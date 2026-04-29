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
    
    // Reverted to basic scopes because original app doesn't have Organization products
    const scope = encodeURIComponent('openid profile email w_member_social');
    
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.appId!.trim()}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
  }

  async getProfiles(code: string, redirectUri: string, state?: string): Promise<SocialProfile[]> {
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
    const profiles: SocialProfile[] = [];

    // 1. Fetch User Profile
    console.log('[LinkedinService] Fetching profile via OpenID Connect...');
    const userRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const userData = userRes.data;

    profiles.push({
      id: userData.sub,
      name: userData.name,
      username: userData.name,
      platform: 'linkedin',
      access_token: accessToken,
      refresh_token: undefined,
      account_type: 'Profile',
      page_id: userData.sub,
      profile_picture: userData.picture || null
    });

    // 2. Fetch Organizations (Pages)
    try {
      console.log('[LinkedinService] Fetching managed organizations...');
      const orgAclRes = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const orgElements = orgAclRes.data.elements || [];
      for (const element of orgElements) {
        const orgUrn = element.organizationalTarget; // Format: urn:li:organization:12345
        const orgId = orgUrn.split(':').pop();

        console.log(`[LinkedinService] Fetching details for organization: ${orgUrn}`);
        const orgDetailsRes = await axios.get(`https://api.linkedin.com/v2/organizations/${orgId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const orgData = orgDetailsRes.data;
        profiles.push({
          id: orgUrn,
          name: orgData.localizedName || orgData.id,
          username: orgData.localizedName || orgData.id,
          platform: 'linkedin',
          access_token: accessToken,
          refresh_token: undefined,
          account_type: 'Page',
          page_id: orgUrn,
          profile_picture: null // Logo fetching in LinkedIn is complex, defaulting to null for now
        });
      }
    } catch (error: any) {
      console.log('[LinkedinService] Error fetching organizations (likely missing scopes or products):', error.response?.data || error.message);
      // We don't throw here to at least return the personal profile
    }
    
    return profiles;
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
