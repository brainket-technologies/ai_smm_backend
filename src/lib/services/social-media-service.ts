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
   * Generates OAuth URL for Instagram Professional.
   * This uses the Official Meta Dialog which is the standard path for Professional accounts.
   */
  static async getInstagramAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('instagram') as any;
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'instagram' })));
    
    const scope = [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement',
      'public_profile',
      'email'
    ].join(',');

    return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}&response_type=code`;
  }

  /**
   * Standardized callback handler.
   */
  static async getProfilesFromCallback(platform: string, code: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig(platform) as any;
    
    if (platform === 'instagram' || platform === 'facebook') {
      const tokenRes = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
        params: {
          client_id: platformConfig.appId,
          client_secret: platformConfig.appSecret,
          redirect_uri: redirectUri,
          code: code,
        }
      });
      const accessToken = tokenRes.data.access_token;

      if (platform === 'instagram') {
        const pagesRes = await axios.get('https://graph.facebook.com/v22.0/me/accounts', {
          params: {
            access_token: accessToken,
            fields: 'id,name,instagram_business_account{id,username,name,profile_picture_url}',
          }
        });

        const pages = pagesRes.data.data || [];
        const igAccounts = pages
          .filter((page: any) => page.instagram_business_account)
          .map((page: any) => ({
            id: page.instagram_business_account.id,
            name: page.instagram_business_account.name || page.instagram_business_account.username,
            username: page.instagram_business_account.username,
            profile_picture: page.instagram_business_account.profile_picture_url || null,
            platform: 'instagram',
            access_token: accessToken,
            page_id: page.id,
            account_type: 'Professional'
          }));

        if (igAccounts.length === 0) {
          throw new Error('No Instagram Professional accounts found. Please ensure your Instagram account is a Professional account and linked to a Facebook Page.');
        }
        return igAccounts;
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

    // Restore other platforms...
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
      const accountsRes = await axios.get('https://mybusinessbusinessinformation.googleapis.com/v1/accounts', { headers: { Authorization: `Bearer ${accessToken}` } });
      const profiles = [];
      for (const account of (accountsRes.data.accounts || [])) {
        const locationsRes = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`, { headers: { Authorization: `Bearer ${accessToken}` }, params: { readMask: 'name,title' } });
        for (const loc of (locationsRes.data.locations || [])) {
          profiles.push({ id: loc.name, name: loc.title, username: loc.title, platform: 'gmb', access_token: accessToken, refresh_token: refreshToken, account_type: 'Profile' });
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
      const meRes = await axios.get('https://api.linkedin.com/v2/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      const profiles = [{ id: meRes.data.id, name: `${meRes.data.localizedFirstName} ${meRes.data.localizedLastName}`, username: meRes.data.id, platform: 'linkedin', access_token: accessToken, account_type: 'Profile' }];
      const orgsRes = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget~()))', { headers: { Authorization: `Bearer ${accessToken}` } });
      for (const element of (orgsRes.data.elements || [])) {
        const org = element['organizationalTarget~'];
        if (org) profiles.push({ id: element.organizationalTarget, name: org.localizedName, username: org.vanityName || org.localizedName, platform: 'linkedin', access_token: accessToken, account_type: 'Page' });
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
      return (channelsRes.data.items || []).map((item: any) => ({ id: item.id, name: item.snippet.title, username: item.snippet.customUrl || item.snippet.title, profile_picture: item.snippet.thumbnails?.default?.url || null, platform: 'youtube', access_token: accessToken, refresh_token: refreshToken, account_type: 'Channel' }));
    }

    throw new Error(`Platform ${platform} not supported for unified profile flow.`);
  }

  static async saveSelectedAccount(businessId: string | bigint, profile: any) {
    const platformRecord = await prisma.platform.findUnique({ where: { nameKey: profile.platform } });
    if (!platformRecord) throw new Error(`${profile.platform} platform not found.`);
    const encryptedToken = CryptoService.encrypt(profile.access_token);
    const encryptedRefreshToken = profile.refresh_token ? CryptoService.encrypt(profile.refresh_token) : null;
    return await prisma.socialAccount.upsert({
      where: { accountId: profile.id },
      update: { accountName: profile.name, accessToken: encryptedToken, refreshToken: encryptedRefreshToken, profilePicture: profile.profile_picture, pageId: profile.page_id, isActive: true },
      create: { businessId: BigInt(businessId), platformId: platformRecord.id, accountId: profile.id, accountName: profile.name, accessToken: encryptedToken, refreshToken: encryptedRefreshToken, profilePicture: profile.profile_picture, pageId: profile.page_id, isActive: true },
    });
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
