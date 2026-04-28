import axios from 'axios';
import prisma from '@/lib/prisma';
import { SocialPlatformService, SocialProfile } from './types';

export class LinkedinService implements SocialPlatformService {
  private async getPlatformConfig() {
    const platform = await prisma.platform.findFirst({
      where: { nameKey: 'linkedin' }
    });
    if (!platform || !platform.appId) {
      throw new Error('LinkedIn configuration not found in Database.');
    }
    return platform;
  }

  async getAuthUrl(businessId: string, redirectUri: string): Promise<string> {
    const config = await this.getPlatformConfig();
    const state = Buffer.from(JSON.stringify({ businessId, platform: 'linkedin' })).toString('base64');
    
    // Using OpenID Connect scopes (recommended for new apps)
    const scope = encodeURIComponent('openid profile email w_member_social');
    
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.appId!.trim()}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
  }

  async getProfiles(code: string, redirectUri: string): Promise<SocialProfile[]> {
    const config = await this.getPlatformConfig();
    
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', config.appId!.trim());
    params.append('client_secret', config.appSecret!.trim());
    params.append('redirect_uri', redirectUri);
    
    console.log('[LinkedinService] Exchanging code for token...');
    const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const accessToken = tokenRes.data.access_token;
    
    console.log('[LinkedinService] Fetching profile via OpenID Connect...');
    const userRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const userData = userRes.data;
    
    return [{
      id: userData.sub, // OpenID 'sub' is the unique identifier
      name: userData.name,
      username: userData.name,
      platform: 'linkedin',
      access_token: accessToken,
      refresh_token: undefined, // LinkedIn v2 tokens usually don't return refresh_token unless specifically requested/configured
      account_type: 'Profile',
      page_id: userData.sub,
      profile_picture: userData.picture || null
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
