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
   * Generates OAuth URL for Instagram (Business).
   */
  static async getInstagramAuthUrl(businessId: string, redirectUri: string) {
    const platformConfig = await this.getPlatformConfig('instagram') as any; // Use instagram specific config
    
    const state = encodeURIComponent(CryptoService.encrypt(JSON.stringify({ businessId, platform: 'instagram' })));
    
    // Use the native Instagram Business Login endpoint
    const scopes = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights';
    return `https://www.instagram.com/oauth/authorize?client_id=${platformConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code&scope=${encodeURIComponent(scopes)}`;
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
   * Exchanges authorization code for tokens and saves them.
   */
  static async handleCallback(platform: string, code: string, state: string, redirectUri: string) {
    // 1. Decrypt state to get businessId
    let decodedState;
    try {
      decodedState = JSON.parse(CryptoService.decrypt(state));
    } catch (e) {
      // Fallback for manual testing/web state
      if (state === 'web') {
        // In production, we should probably throw an error if businessId is missing
        // But for testing, we might need a default or a way to pass it
        throw new Error('Business ID missing in state. Please use the mobile app to connect.');
      }
      throw new Error('Invalid state format');
    }
    
    const businessId = BigInt(decodedState.businessId);

    let accessToken = '';
    let refreshToken = '';
    let accountId = '';
    let accountName = '';

    if (platform === 'facebook') {
      const platformConfig = await this.getPlatformConfig(platform) as any;

      // Exchange code for access token
      const tokenRes = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
        params: {
          client_id: platformConfig.appId,
          client_secret: platformConfig.appSecret,
          redirect_uri: redirectUri,
          code: code
        }
      });

      let shortLivedToken = tokenRes.data.access_token;

      // Exchange short-lived token for a long-lived token (60 days)
      const longLivedRes = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: platformConfig.appId,
          client_secret: platformConfig.appSecret,
          fb_exchange_token: shortLivedToken
        }
      });

      accessToken = longLivedRes.data.access_token;

      // Facebook: Get user ID/name
      const meRes = await axios.get('https://graph.facebook.com/v22.0/me', {
        params: { access_token: accessToken, fields: 'id,name' }
      });
      
      accountId = meRes.data.id;
      accountName = meRes.data.name;
    } 
    else if (platform === 'instagram') {
      const platformConfig = await this.getPlatformConfig(platform) as any;

      // For Standalone Instagram App, exchange code at api.instagram.com using form data
      const params = new URLSearchParams();
      params.append('client_id', platformConfig.appId);
      params.append('client_secret', platformConfig.appSecret);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', redirectUri);
      params.append('code', code);

      const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      accessToken = tokenRes.data.access_token;

      // Fetch pages and their linked Instagram business accounts
      const pagesRes = await axios.get('https://graph.facebook.com/v22.0/me/accounts', {
          params: { access_token: accessToken, fields: 'instagram_business_account{id,username,name},name' }
        });
        
        const pages = pagesRes.data.data || [];
        let foundIg = false;
        
        for (const page of pages) {
          if (page.instagram_business_account) {
            accountId = page.instagram_business_account.id;
            accountName = page.instagram_business_account.username || page.instagram_business_account.name;
            foundIg = true;
            break; // Use the first found linked Instagram account
          }
        }
        
        if (!foundIg) {
          throw new Error('No Instagram Business Account linked to your Facebook Pages was found. Please ensure your Instagram account is a Business account and linked to a Facebook Page.');
        }
    } 
    else if (platform === 'gmb') {
      const platformConfig = await this.getPlatformConfig('gmb') as any;

      const params = new URLSearchParams();
      params.append('client_id', platformConfig.appId.trim());
      params.append('client_secret', platformConfig.appSecret.trim());
      params.append('redirect_uri', 'https://ai-smm-backend.vercel.app/api/social/callback');
      params.append('grant_type', 'authorization_code');
      params.append('code', code);

      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token; 

      const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      accountId = userRes.data.sub;
      accountName = userRes.data.email || userRes.data.name;
    }
    else if (platform === 'threads') {
      const platformConfig = await this.getPlatformConfig('threads') as any;

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
