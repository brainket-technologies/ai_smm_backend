import axios from 'axios';
import prisma from '@/lib/prisma';
import { SocialPlatformService, SocialProfile } from './types';

export class FacebookService implements SocialPlatformService {
  private async getPlatformConfig() {
    const platform = await prisma.platform.findFirst({
      where: { nameKey: 'facebook' }
    });
    if (!platform || !platform.appId) {
      throw new Error('Facebook configuration not found in Database.');
    }
    return platform;
  }

  async getAuthUrl(businessId: string, redirectUri: string): Promise<string> {
    const config = await this.getPlatformConfig();
    const state = Buffer.from(JSON.stringify({ businessId, platform: 'facebook' })).toString('base64');
    
    const scope = [
      'pages_manage_metadata',
      'business_management',
      'pages_show_list',
      'pages_read_engagement',
      'public_profile',
      'email'
    ].join(',');

    return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${config.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}&response_type=code`;
  }

  async getProfiles(code: string, redirectUri: string, state?: string): Promise<SocialProfile[]> {
    const config = await this.getPlatformConfig();
    
    const tokenRes = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
      params: {
        client_id: config.appId,
        client_secret: config.appSecret,
        redirect_uri: redirectUri,
        code: code
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
      page_id: page.id,
      account_type: 'Page'
    }));
  }

  async disconnect(businessId: string, accountId: string): Promise<void> {
    await prisma.socialAccount.deleteMany({
      where: {
        businessId: BigInt(businessId),
        accountId: accountId
      }
    });
  }
}
