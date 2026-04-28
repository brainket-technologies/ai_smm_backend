import prisma from '@/lib/prisma';
import { CryptoService } from './crypto-service';
import axios from 'axios';

export class SocialMediaService {
  /**
   * Fetches configuration for a specific platform.
   */
  static async getPlatformConfig(platformKey: string) {
    console.log(`[SocialMediaService] getPlatformConfig called for: ${platformKey}`);
    
    if (!platformKey) {
      throw new Error(`getPlatformConfig called without a platformKey.`);
    }

    // Use findFirst instead of findUnique for more robust searching if multiple entries exist
    const platform = await prisma.platform.findFirst({
      where: { 
        OR: [
          { nameKey: platformKey },
          { nameKey: platformKey.toLowerCase() }
        ]
      }
    });

    if (!platform || !(platform as any).appId) {
      console.error(`[SocialMediaService] Platform not found or not configured: ${platformKey}`);
      throw new Error(`${platformKey} configuration not found in Database. Please check Platforms table.`);
    }

    return platform;
  }

  /**
   * Helper to generate non-encrypted state for stability
   */
  public static generateState(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Helper to parse non-encrypted state
   */
  static parseState(state: string): any {
    try {
      return JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    } catch (e) {
      return {};
    }
  }

  /**
   * Generates OAuth URL for Facebook.
   */
  static async getFacebookAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('facebook') as any;
    const state = this.generateState({ businessId, platform: 'facebook' });
    
    const scope = [
      'pages_manage_metadata',
      'business_management',
      'pages_show_list',
      'pages_read_engagement',
      'public_profile',
      'email'
    ].join(',');

    return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}&response_type=code`;
  }

  /**
   * Generates OAuth URL for Instagram Professional (Direct Flow).
   */
  static async getInstagramAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('instagram') as any;
    const state = this.generateState({ businessId, platform: 'instagram' });
    
    const scope = [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_comments',
      'instagram_business_manage_insights',
      'instagram_business_manage_messages'
    ].join(',');

    return `https://api.instagram.com/oauth/authorize?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
  }

  /**
   * Generates OAuth URL for Threads.
   */
  static async getThreadsAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('threads') as any;
    const state = this.generateState({ businessId, platform: 'threads' });
    const scope = 'threads_basic,threads_content_publish';
    return `https://www.threads.net/oauth/authorize?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
  }

  /**
   * Generates OAuth URL for Google/GMB.
   */
  static async getGoogleAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('gmb') as any;
    const state = this.generateState({ businessId, platform: 'gmb' });
    const scope = encodeURIComponent('https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${platformConfig.appId.trim()}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&access_type=offline&include_granted_scopes=true`;
  }

  /**
   * Generates OAuth URL for YouTube.
   */
  static async getYouTubeAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('youtube') as any;
    const state = this.generateState({ businessId, platform: 'youtube' });
    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;
  }

  /**
   * Generates OAuth URL for LinkedIn.
   */
  static async getLinkedInAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('linkedin') as any;
    const state = this.generateState({ businessId, platform: 'linkedin' });
    const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social rw_organization_admin w_organization_social');
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
  }

  /**
   * Generates OAuth URL for Pinterest.
   */
  static async getPinterestAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('pinterest') as any;
    const state = this.generateState({ businessId, platform: 'pinterest' });
    const scope = 'read_public,write_public';
    return `https://www.pinterest.com/oauth/?consumer_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
  }

  /**
   * Standardized callback handler.
   */
  static async getProfilesFromCallback(platform: string, code: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig(platform) as any;
    
    if (platform === 'instagram') {
      const params = new URLSearchParams();
      params.append('client_id', platformConfig.appId);
      params.append('client_secret', platformConfig.appSecret);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', redirectUri);
      params.append('code', code);
      const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', params.toString());
      const accessToken = tokenRes.data.access_token;
      const userId = tokenRes.data.user_id;
      const userRes = await axios.get(`https://graph.instagram.com/v22.0/${userId}`, {
        params: { fields: 'id,username,name,profile_picture_url', access_token: accessToken }
      });
      return [{ id: userRes.data.id, name: userRes.data.name || userRes.data.username, username: userRes.data.username, profile_picture: userRes.data.profile_picture_url || null, platform: 'instagram', access_token: accessToken, account_type: 'Professional', page_id: userRes.data.id }];
    }

    if (platform === 'facebook' || platform === 'threads') {
      const tokenRes = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
        params: { client_id: platformConfig.appId, client_secret: platformConfig.appSecret, redirect_uri: redirectUri, code: code }
      });
      const accessToken = tokenRes.data.access_token;

      if (platform === 'threads') {
         const userRes = await axios.get('https://graph.threads.net/me', {
           params: { fields: 'id,username,name,threads_profile_picture_url', access_token: accessToken }
         });
         return [{ id: userRes.data.id, name: userRes.data.name || userRes.data.username, username: userRes.data.username, profile_picture: userRes.data.threads_profile_picture_url || null, platform: 'threads', access_token: accessToken, account_type: 'Profile', page_id: userRes.data.id }];
      }

      const pagesRes = await axios.get('https://graph.facebook.com/v22.0/me/accounts', {
        params: { access_token: accessToken, fields: 'id,name,picture' }
      });
      return (pagesRes.data.data || []).map((page: any) => ({
        id: page.id,
        name: page.name,
        username: page.name,
        profile_picture: page.picture?.data?.url || null,
        platform: 'facebook',
        access_token: accessToken,
        page_id: page.id,
        account_type: 'Page'
      }));
    }

    if (platform === 'gmb') {
      const params = new URLSearchParams();
      params.append('client_id', platformConfig.appId.trim());
      params.append('client_secret', platformConfig.appSecret.trim());
      params.append('redirect_uri', redirectUri);
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(), { timeout: 10000 });
      const accessToken = tokenRes.data.access_token;
      const refreshToken = tokenRes.data.refresh_token;
      
      // Call Account Management API to list accounts
      const accountsRes = await axios.get('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', { 
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000
      });
      
      const profiles: any[] = [];
      const accounts = accountsRes.data.accounts || [];
      
      // Fetch locations for all accounts in parallel for speed
      await Promise.all(accounts.map(async (account: any) => {
        try {
          const locationsRes = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`, { 
            headers: { Authorization: `Bearer ${accessToken}` }, 
            params: { readMask: 'name,title' },
            timeout: 5000 
          });
          
          if (locationsRes.data.locations) {
            locationsRes.data.locations.forEach((loc: any) => {
              profiles.push({ 
                id: loc.name, 
                name: loc.title, 
                username: loc.title, 
                platform: 'gmb', 
                access_token: accessToken, 
                refresh_token: refreshToken, 
                account_type: 'Profile', 
                page_id: loc.name 
              });
            });
          }
        } catch (locError) {
          console.warn(`[SocialMediaService] Parallel fetch failed for account ${account.name}:`, locError);
        }
      }));
      
      return profiles;
    }

    if (platform === 'linkedin') {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', redirectUri);
      params.append('client_id', platformConfig.appId);
      params.append('client_secret', platformConfig.appSecret);
      const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params.toString());
      const accessToken = tokenRes.data.access_token;
      const meRes = await axios.get('https://api.linkedin.com/v2/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      const profiles = [{ id: meRes.data.id, name: `${meRes.data.localizedFirstName} ${meRes.data.localizedLastName}`, username: meRes.data.id, platform: 'linkedin', access_token: accessToken, account_type: 'Profile', page_id: meRes.data.id }];
      const orgsRes = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget~()))', { headers: { Authorization: `Bearer ${accessToken}` } });
      for (const element of (orgsRes.data.elements || [])) {
        const org = element['organizationalTarget~'];
        if (org) profiles.push({ id: element.organizationalTarget, name: org.localizedName, username: org.vanityName || org.localizedName, platform: 'linkedin', access_token: accessToken, account_type: 'Page', page_id: element.organizationalTarget });
      }
      return profiles;
    }

    if (platform === 'youtube') {
      const params = new URLSearchParams();
      params.append('client_id', platformConfig.appId);
      params.append('client_secret', platformConfig.appSecret);
      params.append('redirect_uri', redirectUri);
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString());
      const accessToken = tokenRes.data.access_token;
      const refreshToken = tokenRes.data.refresh_token;
      const channelsRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', { headers: { Authorization: `Bearer ${accessToken}` }, params: { part: 'snippet', mine: true } });
      return (channelsRes.data.items || []).map((item: any) => ({ id: item.id, name: item.snippet.title, username: item.snippet.customUrl || item.snippet.title, profile_picture: item.snippet.thumbnails?.default?.url || null, platform: 'youtube', access_token: accessToken, refresh_token: refreshToken, account_type: 'Channel', page_id: item.id }));
    }

    throw new Error(`Platform ${platform} not supported for unified profile flow.`);
  }

  static async saveSelectedAccount(businessId: string | bigint, profile: any) {
    try {
      const platformRecord = await prisma.platform.findFirst({ where: { nameKey: profile.platform } });
      if (!platformRecord) throw new Error(`${profile.platform} platform not found.`);
      
      const encryptedToken = Buffer.from(profile.access_token).toString('base64');
      const encryptedRefreshToken = profile.refresh_token ? Buffer.from(profile.refresh_token).toString('base64') : null;
      
      return await prisma.socialAccount.upsert({
        where: { accountId: profile.id },
        update: { 
          accountName: profile.name, 
          accessToken: encryptedToken, 
          refreshToken: encryptedRefreshToken, 
          profilePicture: profile.profile_picture, 
          pageId: profile.page_id, 
          isActive: true 
        },
        create: { 
          businessId: BigInt(businessId), 
          platformId: platformRecord.id, 
          accountId: profile.id, 
          accountName: profile.name, 
          accessToken: encryptedToken, 
          refreshToken: encryptedRefreshToken, 
          profilePicture: profile.profile_picture, 
          pageId: profile.page_id, 
          isActive: true 
        },
      });
    } catch (error: any) {
      console.error(`[SocialMediaService] Error in saveSelectedAccount:`, error.message);
      throw new Error(`Failed to save account: ${error.message}`);
    }
  }

  static async saveInstagramAccount(businessId: string | bigint, data: any) {
    return this.saveSelectedAccount(businessId, {
      id: data.instagramId,
      name: data.username,
      username: data.username,
      profile_picture: data.profilePicture,
      platform: 'instagram',
      access_token: data.longLivedToken,
      page_id: data.pageId
    });
  }
}
