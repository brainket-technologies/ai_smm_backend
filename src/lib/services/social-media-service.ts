import prisma from '@/lib/prisma';
import { CryptoService } from './crypto-service';
import axios from 'axios';

export class SocialMediaService {
  /**
   * Fetches configuration for a specific platform.
   */
  static async getPlatformConfig(platformKey: string) {
    const platform = await prisma.platform.findUnique({
      where: { nameKey: platformKey }
    });

    if (!platform || !(platform as any).appId) {
      throw new Error(`${platformKey} App ID not configured in Platforms.`);
    }

    return platform;
  }

  /**
   * Generates OAuth URL for Facebook.
   */
  static async getFacebookAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('facebook') as any;
    
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'facebook' })));
    
    // Scopes from DB or defaults
    const scopesFromDb = (platformConfig as any).scopes;
    const scopeList = scopesFromDb ? scopesFromDb.split(',') : [
      'pages_manage_metadata',
      'business_management',
      'pages_show_list',
      'pages_read_engagement',
      'email'
    ];
    const scope = encodeURIComponent(scopeList.join(','));

    // Use Configuration ID for Facebook login
    return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&config_id=1506175574548062&response_type=code`;
  }

  /**
   * Generates OAuth URL for Instagram Professional (Direct).
   * No Facebook Page link required for this flow.
   */
  static async getInstagramAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('instagram') as any;
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'instagram' })));
    
    // Modern Instagram Professional Scopes (Direct)
    const scope = platformConfig.scopes || [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_comments',
      'instagram_business_manage_insights',
      'instagram_business_manage_messages'
    ].join(',');

    return `https://api.instagram.com/oauth/authorize?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
  }

  /**
   * After Instagram OAuth: exchange code, get long-lived token, fetch FB Pages + linked IG accounts.
   * Returns standardized profile list for user to select.
   */
  static async getInstagramPages(code: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('instagram') as any;

    const tokenRes = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
      params: {
        client_id: platformConfig.appId,
        client_secret: platformConfig.appSecret,
        redirect_uri: redirectUri,
        code: code,
      }
    });
    const shortLivedToken = tokenRes.data.access_token;

    const longLivedRes = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: platformConfig.appId,
        client_secret: platformConfig.appSecret,
        fb_exchange_token: shortLivedToken,
      }
    });
    const longLivedToken = longLivedRes.data.access_token;

    const pagesRes = await axios.get('https://graph.facebook.com/v22.0/me/accounts', {
      params: {
        access_token: longLivedToken,
        fields: 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}',
      }
    });

    const pages = pagesRes.data.data || [];

    return pages
      .filter((page: any) => page.instagram_business_account)
      .map((page: any) => ({
        id: page.instagram_business_account.id,
        name: page.instagram_business_account.name || page.instagram_business_account.username,
        username: page.instagram_business_account.username,
        profile_picture: page.instagram_business_account.profile_picture_url || null,
        platform: 'instagram',
        access_token: longLivedToken,
        page_id: page.id,
      }));
  }

  /**
   * Save a user-selected Instagram Business account to the existing social_accounts table.
   * Upserts based on accountId (instagram_business_id).
   */
  static async saveInstagramAccount(businessId: string, data: {
    instagramId: string;
    username: string;
    profilePicture: string | null;
    pageId: string;
    longLivedToken: string;
  }) {
    const platformRecord = await prisma.platform.findUnique({ where: { nameKey: 'instagram' } });
    if (!platformRecord) throw new Error('Instagram platform not found in database.');

    const encryptedToken = CryptoService.encrypt(data.longLivedToken);

    return await prisma.socialAccount.upsert({
      where: { accountId: data.instagramId },
      update: {
        accountName: data.username,
        accessToken: encryptedToken,
        profilePicture: data.profilePicture,
        pageId: data.pageId,
        isActive: true,
      },
      create: {
        businessId: BigInt(businessId),
        platformId: platformRecord.id,
        accountId: data.instagramId,
        accountName: data.username,
        accessToken: encryptedToken,
        profilePicture: data.profilePicture,
        pageId: data.pageId,
        isActive: true,
      },
    });
  }

  /**
   * Generates OAuth URL for Google Business Profile.
   */
  static async getGoogleAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('gmb') as any;
    
    // Force the same redirect URI that is configured in Google Console
    const fixedRedirectUri = 'https://ai-smm-backend.vercel.app/api/social/callback';
    
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'gmb' })));
    const scopesFromDb = (platformConfig as any).scopes;
    const scope = scopesFromDb || [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(fixedRedirectUri)}&state=${state}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
  }

  /**
   * Generates OAuth URL for LinkedIn.
   */
  static async getLinkedInAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('linkedin') as any;
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'linkedin' })));
    
    const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social');
    
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
  }

  /**
   * Generates OAuth URL for YouTube.
   */
  static async getYouTubeAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('youtube') as any;
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'youtube' })));
    
    const scope = encodeURIComponent([
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' '));
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  }

  /**
   * Generates OAuth URL for Pinterest.
   */
  static async getPinterestAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('pinterest') as any;
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'pinterest' })));
    
    const scope = 'user_accounts:read,boards:read,pins:read,pins:write';
    
    return `https://www.pinterest.com/oauth/?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
  }

  /**
   * Generates OAuth URL for Threads.
   */
  static async getThreadsAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('threads') as any;
    
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'threads' })));
    const scopesFromDb = (platformConfig as any).scopes;
    const scope = scopesFromDb || [
      'threads_basic',
      'threads_content_publish',
      'threads_read_replies',
      'threads_manage_replies',
      'threads_manage_insights'
    ].join(',');

    return `https://www.threads.net/oauth/authorize?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}&response_type=code`;
  }

  /**
   * Standardized callback handler that returns a list of profiles/pages for any platform.
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

      // Fetch Instagram Profile details directly
      const userRes = await axios.get(`https://graph.instagram.com/v22.0/${userId}`, {
        params: {
          fields: 'id,username,name,profile_picture_url',
          access_token: accessToken
        }
      });

      return [{
        id: userRes.data.id,
        name: userRes.data.name || userRes.data.username,
        username: userRes.data.username,
        profile_picture: userRes.data.profile_picture_url || null,
        platform: 'instagram',
        access_token: accessToken,
        account_type: 'Professional'
      }];
    }

    if (platform === 'facebook') {
      const tokenRes = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
        params: {
          client_id: platformConfig.appId,
          client_secret: platformConfig.appSecret,
          redirect_uri: redirectUri,
          code: code,
        }
      });
      const accessToken = tokenRes.data.access_token;

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
        page_id: page.id
      }));
    }

    if (platform === 'gmb') {
      const params = new URLSearchParams();
      params.append('client_id', platformConfig.appId.trim());
      params.append('client_secret', platformConfig.appSecret.trim());
      params.append('redirect_uri', redirectUri);
      params.append('grant_type', 'authorization_code');
      params.append('code', code);

      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString());
      const accessToken = tokenRes.data.access_token;
      const refreshToken = tokenRes.data.refresh_token;

      const accountsRes = await axios.get('https://mybusinessbusinessinformation.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const profiles = [];
      for (const account of (accountsRes.data.accounts || [])) {
        const locationsRes = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { readMask: 'name,title' }
        });
        
        for (const loc of (locationsRes.data.locations || [])) {
          profiles.push({
            id: loc.name,
            name: loc.title,
            username: loc.title,
            profile_picture: null,
            platform: 'gmb',
            access_token: accessToken,
            refresh_token: refreshToken
          });
        }
      }
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

      // 1. Fetch Personal Profile
      const meRes = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const profiles = [{
        id: meRes.data.id,
        name: `${meRes.data.localizedFirstName} ${meRes.data.localizedLastName}`,
        username: meRes.data.id,
        profile_picture: null,
        platform: 'linkedin',
        access_token: accessToken,
        account_type: 'Profile'
      }];

      // 2. Fetch Organizations (Pages)
      const orgsRes = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget~()))', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      for (const element of (orgsRes.data.elements || [])) {
        const org = element['organizationalTarget~'];
        if (org) {
          profiles.push({
            id: element.organizationalTarget,
            name: org.localizedName,
            username: org.vanityName || org.localizedName,
            profile_picture: null,
            platform: 'linkedin',
            access_token: accessToken,
            account_type: 'Page'
          });
        }
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

      const channelsRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { part: 'snippet', mine: true }
      });

      return (channelsRes.data.items || []).map((item: any) => ({
        id: item.id,
        name: item.snippet.title,
        username: item.snippet.customUrl || item.snippet.title,
        profile_picture: item.snippet.thumbnails?.default?.url || null,
        platform: 'youtube',
        access_token: accessToken,
        refresh_token: refreshToken,
        account_type: 'Channel'
      }));
    }

    if (platform === 'pinterest') {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', redirectUri);
      params.append('client_id', platformConfig.appId);
      params.append('client_secret', platformConfig.appSecret);

      const tokenRes = await axios.post('https://api.pinterest.com/v5/oauth/token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const accessToken = tokenRes.data.access_token;

      const userRes = await axios.get('https://api.pinterest.com/v5/user_account', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return [{
        id: userRes.data.username,
        name: userRes.data.username,
        username: userRes.data.username,
        profile_picture: userRes.data.profile_image || null,
        platform: 'pinterest',
        access_token: accessToken,
        account_type: 'Profile'
      }];
    }

    throw new Error(`Platform ${platform} not supported for unified profile flow.`);
  }

  /**
   * Final step: Save the user-selected account to the database.
   */
  static async saveSelectedAccount(businessId: string, profile: any) {
    const platformRecord = await prisma.platform.findUnique({ where: { nameKey: profile.platform } });
    if (!platformRecord) throw new Error(`${profile.platform} platform not found.`);

    const encryptedToken = CryptoService.encrypt(profile.access_token);
    const encryptedRefreshToken = profile.refresh_token ? CryptoService.encrypt(profile.refresh_token) : null;

    return await prisma.socialAccount.upsert({
      where: { accountId: profile.id },
      update: {
        accountName: profile.name,
        accessToken: encryptedToken,
        refreshToken: encryptedRefreshToken,
        profilePicture: profile.profile_picture,
        pageId: profile.page_id,
        isActive: true,
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
        isActive: true,
      },
    });
  }
}
