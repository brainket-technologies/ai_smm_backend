import axios from 'axios';
import prisma from '@/lib/prisma';
import { SocialPlatformService, SocialProfile } from './types';

export class InstagramService implements SocialPlatformService {
  private async getPlatformConfig() {
    const platform = await prisma.platform.findFirst({
      where: { nameKey: 'instagram' }
    });
    if (!platform || !platform.appId) {
      throw new Error('Instagram configuration not found in Database.');
    }
    return platform;
  }

  async getAuthUrl(businessId: string, redirectUri: string): Promise<string> {
    const config = await this.getPlatformConfig();
    const state = Buffer.from(JSON.stringify({ businessId, platform: 'instagram' })).toString('base64');
    
    const scope = [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_comments',
      'instagram_business_manage_insights',
      'instagram_business_manage_messages'
    ].join(',');

    return `https://api.instagram.com/oauth/authorize?client_id=${config.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
  }

  async getProfiles(code: string, redirectUri: string): Promise<SocialProfile[]> {
    const config = await this.getPlatformConfig();
    
    const params = new URLSearchParams();
    params.append('client_id', config.appId!);
    params.append('client_secret', config.appSecret!);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);
    params.append('code', code);
    
    const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', params.toString());
    const accessToken = tokenRes.data.access_token;
    const userId = tokenRes.data.user_id;
    
    const userRes = await axios.get(`https://graph.instagram.com/v22.0/${userId}`, {
      params: { fields: 'id,username,name,profile_picture_url', access_token: accessToken }
    });
    
    return [{
      id: userRes.data.id,
      name: userRes.data.name || userRes.data.username,
      username: userRes.data.username,
      profile_picture: userRes.data.profile_picture_url || null,
      platform: 'instagram',
      access_token: accessToken,
      account_type: 'Professional',
      page_id: userRes.data.id
    }];
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
