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

    if (!platform || !platform.appId) {
      throw new Error(`${platformKey} App ID not configured in Platforms.`);
    }

    return platform;
  }

  /**
   * Generates OAuth URL for Facebook / Instagram.
   */
  static async getFacebookAuthUrl(businessId: string, redirectUri: string, platformType: string = 'facebook') {
    const platformConfig = await this.getPlatformConfig('facebook');
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: platformType })));
    
    if (platformType === 'instagram') {
      // Instagram Business OAuth via facebook.com with Configuration ID
      const configId = '949385448077001';
      const scopes = [
        'instagram_business_basic',
        'instagram_business_manage_comments',
        'instagram_business_content_publish',
        'instagram_business_manage_messages',
        'instagram_business_manage_insights'
      ].join(',');
      
      return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${platformConfig.appId}&config_id=${configId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}`;
    }

    // Facebook OAuth with specific business scopes
    const scopes = [
      'pages_manage_metadata',
      'business_management',
      'pages_show_list',
      'pages_manage_posts',
      'pages_read_engagement',
      'pages_read_user_content',
      'email',
      'read_insights',
      'pages_manage_engagement',
      'pages_messaging'
    ].join(',');

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}`;
  }

  /**
   * Generates OAuth URL for Google Business Profile.
   */
  static async getGoogleAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('gmb');
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'gmb' })));
    
    const scopes = [
      'https://www.googleapis.com/auth/business.manage'
    ].join(' ');

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}&access_type=offline&prompt=consent`;
  }

  /**
   * Generates OAuth URL for Threads.
   */
  static async getThreadsAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('threads');
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'threads' })));
    
    const scopes = [
      'threads_basic',
      'threads_content_publish',
      'threads_read_replies',
      'threads_manage_replies',
      'threads_manage_insights'
    ].join(',');

    return `https://www.threads.net/oauth/authorize?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;
  }

  /**
   * Exchanges authorization code for tokens and saves them.
   */
  static async handleCallback(platform: string, code: string, state: string, redirectUri: string) {
    // 1. Decrypt state to get businessId
    const decodedState = JSON.parse(CryptoService.decrypt(state));
    const businessId = BigInt(decodedState.businessId);

    let accessToken = '';
    let refreshToken = '';
    let accountId = '';
    let accountName = '';

    if (platform === 'facebook' || platform === 'instagram') {
      const platformConfig = await this.getPlatformConfig('facebook');

      const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: platformConfig.appId,
          client_secret: platformConfig.appSecret,
          redirect_uri: redirectUri,
          code: code
        }
      });

      accessToken = tokenRes.data.access_token;
      
      if (platform === 'instagram') {
        // Fetch pages and their linked Instagram business accounts
        const pagesRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
          params: { access_token: accessToken, fields: 'instagram_business_account{id,username},name' }
        });
        
        const pages = pagesRes.data.data || [];
        let foundIg = false;
        
        for (const page of pages) {
          if (page.instagram_business_account) {
            accountId = page.instagram_business_account.id;
            accountName = page.instagram_business_account.username;
            foundIg = true;
            break; // Use the first found linked Instagram account
          }
        }
        
        if (!foundIg) {
          // Fallback if no IG account found, maybe use the user ID as placeholder
          const meRes = await axios.get('https://graph.facebook.com/me', {
            params: { access_token: accessToken, fields: 'id,name' }
          });
          accountId = `ig_${meRes.data.id}`;
          accountName = meRes.data.name;
        }
      } else {
        // Facebook fallback: just get user ID/name
        const meRes = await axios.get('https://graph.facebook.com/me', {
          params: { access_token: accessToken, fields: 'id,name' }
        });
        
        accountId = meRes.data.id;
        accountName = meRes.data.name;
      }
    } 
    else if (platform === 'gmb') {
      const platformConfig = await this.getPlatformConfig('gmb');

      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: platformConfig.appId,
        client_secret: platformConfig.appSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code: code
      });

      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token; // Offline access gives refresh token

      // Google doesn't have a single "account" for Business Profile in OAuth, 
      // but we can store the primary user email as accountName
      const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      accountId = userRes.data.sub;
      accountName = userRes.data.email || userRes.data.name;
    }
    else if (platform === 'threads') {
      const platformConfig = await this.getPlatformConfig('threads');

      const tokenRes = await axios.post('https://graph.threads.net/oauth/access_token', {
        client_id: platformConfig.appId,
        client_secret: platformConfig.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      });

      accessToken = tokenRes.data.access_token;
      accountId = tokenRes.data.user_id.toString();

      // Get Threads user profile
      const userRes = await axios.get(`https://graph.threads.net/me`, {
        params: { 
          fields: 'id,username',
          access_token: accessToken 
        }
      });
      
      accountName = userRes.data.username;
    }

    // 2. Encrypt tokens
    const encryptedAccessToken = CryptoService.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? CryptoService.encrypt(refreshToken) : null;

    // 3. Find Platform ID
    const platformRecord = await prisma.platform.findUnique({
      where: { nameKey: platform }
    });

    if (!platformRecord) {
      throw new Error(`Platform ${platform} not found in database.`);
    }

    // 4. Save to SocialAccount
    return await prisma.socialAccount.upsert({
      where: { accountId: accountId },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        accountName: accountName,
        isActive: true
      },
      create: {
        businessId: businessId,
        platformId: platformRecord.id,
        accountId: accountId,
        accountName: accountName,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        isActive: true
      }
    });
  }
}
