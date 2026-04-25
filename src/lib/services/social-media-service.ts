import prisma from '@/lib/prisma';
import { CryptoService } from './crypto-service';
import axios from 'axios';

export class SocialMediaService {
  /**
   * Fetches global social configurations from AppConfig.
   */
  static async getAppConfig() {
    const config = await prisma.appConfig.findFirst({
      where: { id: BigInt(1) }
    });

    if (!config) {
      throw new Error("System configuration not found. Please contact admin.");
    }

    return config;
  }

  /**
   * Generates OAuth URL for Facebook / Instagram.
   */
  static async getFacebookAuthUrl(businessId: string, redirectUri: string) {
    const config = await this.getAppConfig();
    
    if (!config.fbAppId) {
      throw new Error("Facebook App ID not configured in System Settings.");
    }

    const state = CryptoService.encrypt(JSON.stringify({ businessId, platform: 'facebook' }));
    const scope = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
      'business_management'
    ].join(',');

    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${config.fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
  }

  /**
   * Generates OAuth URL for Google Business Profile.
   */
  static async getGoogleAuthUrl(businessId: string, redirectUri: string) {
    const config = await this.getAppConfig();
    
    if (!config.googleClientId) {
      throw new Error("Google Client ID not configured in System Settings.");
    }

    const state = CryptoService.encrypt(JSON.stringify({ businessId, platform: 'gmb' }));
    const scope = [
      'https://www.googleapis.com/auth/business.manage'
    ].join(' ');

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
  }

  /**
   * Exchanges authorization code for tokens and saves them.
   */
  static async handleCallback(platform: string, code: string, state: string, redirectUri: string) {
    // 1. Decrypt state to get businessId
    const decodedState = JSON.parse(CryptoService.decrypt(state));
    const businessId = BigInt(decodedState.businessId);

    const config = await this.getAppConfig();
    let accessToken = '';
    let refreshToken = '';
    let accountId = '';
    let accountName = '';

    if (platform === 'facebook' || platform === 'instagram') {
      const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: config.fbAppId,
          client_secret: config.fbAppSecret,
          redirect_uri: redirectUri,
          code: code
        }
      });

      accessToken = tokenRes.data.access_token;
      
      // Get user profile to get account ID/Name
      const meRes = await axios.get('https://graph.facebook.com/me', {
        params: { access_token: accessToken, fields: 'id,name' }
      });
      
      accountId = meRes.data.id;
      accountName = meRes.data.name;
    } 
    else if (platform === 'gmb') {
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
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

    // 2. Encrypt tokens
    const encryptedAccessToken = CryptoService.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? CryptoService.encrypt(refreshToken) : null;

    // 3. Find Platform ID
    const platformRecord = await prisma.platform.findUnique({
      where: { name_key: platform }
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
