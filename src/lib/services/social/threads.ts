import axios from 'axios';
import prisma from '@/lib/prisma';
import { SocialPlatformService, SocialProfile } from './types';

export class ThreadsService implements SocialPlatformService {
  private async getPlatformConfig() {
    const platform = await prisma.platform.findFirst({
      where: { nameKey: 'threads' }
    });
    if (!platform || !platform.appId) {
      throw new Error('Threads configuration not found in Database.');
    }
    return platform;
  }

  async getAuthUrl(businessId: string, redirectUri: string): Promise<string> {
    const config = await this.getPlatformConfig();
    const state = Buffer.from(JSON.stringify({ businessId, platform: 'threads' })).toString('base64');
    const scope = 'threads_basic,threads_content_publish';
    return `https://www.threads.net/oauth/authorize?response_type=code&client_id=${config.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  }

  async getProfiles(code: string, redirectUri: string, state?: string): Promise<SocialProfile[]> {
    const config = await this.getPlatformConfig();
    
    const params = new URLSearchParams({
      client_id: config.appId!.trim(),
      client_secret: config.appSecret!.trim(),
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code,
    });

    console.log('[ThreadsService] Exchanging code for token...');
    const tokenRes = await axios.post('https://graph.threads.net/oauth/access_token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://graph.threads.net/me', {
      params: { fields: 'id,username,name,threads_profile_picture_url', access_token: accessToken }
    });

    return [{
      id: userRes.data.id,
      name: userRes.data.name || userRes.data.username,
      username: userRes.data.username,
      profile_picture: userRes.data.threads_profile_picture_url || null,
      platform: 'threads',
      access_token: accessToken,
      account_type: 'Profile',
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
