import axios from 'axios';
import prisma from '@/lib/prisma';
import { SocialPlatformService, SocialProfile } from './types';

export class GoogleService implements SocialPlatformService {
  private async getPlatformConfig() {
    const platform = await prisma.platform.findFirst({
      where: { nameKey: 'gmb' }
    });
    if (!platform || !platform.appId) {
      throw new Error('Google My Business configuration not found in Database.');
    }
    return platform;
  }

  async getAuthUrl(businessId: string, redirectUri: string): Promise<string> {
    const config = await this.getPlatformConfig();
    const state = Buffer.from(JSON.stringify({ businessId, platform: 'gmb' })).toString('base64');
    const scope = encodeURIComponent('https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.appId!.trim()}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&access_type=offline&include_granted_scopes=true`;
  }

  async getProfiles(code: string, redirectUri: string, state?: string): Promise<SocialProfile[]> {
    const config = await this.getPlatformConfig();
    
    const params = new URLSearchParams();
    params.append('client_id', config.appId!.trim());
    params.append('client_secret', config.appSecret!.trim());
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString());
    const accessToken = tokenRes.data.access_token;
    const refreshToken = tokenRes.data.refresh_token;
    
    console.log(`[GoogleService] Fetching accounts for ${accessToken.substring(0, 10)}...`);
    const accountsRes = await axios.get('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', { 
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const profiles: SocialProfile[] = [];
    const accounts = accountsRes.data.accounts || [];
    console.log(`[GoogleService] Found ${accounts.length} accounts.`);
    
    // Use for...of instead of Promise.all to avoid hitting quota too fast
    for (const account of accounts) {
      try {
        console.log(`[GoogleService] Fetching locations for account: ${account.name}`);
        const locationsRes = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`, { 
          headers: { Authorization: `Bearer ${accessToken}` }, 
          params: { readMask: 'name,title' }
        });
        
        if (locationsRes.data.locations) {
          console.log(`[GoogleService] Found ${locationsRes.data.locations.length} locations for ${account.name}`);
          locationsRes.data.locations.forEach((loc: any) => {
            profiles.push({ 
              id: loc.name, 
              name: loc.title, 
              username: loc.title, 
              platform: 'gmb', 
              access_token: accessToken, 
              refresh_token: refreshToken, 
              account_type: 'Profile', 
              page_id: loc.name,
              profile_picture: null
            });
          });
        }
        
        // Add a small delay between accounts to respect quota
        if (accounts.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (locError) {
        console.warn(`[GoogleService] fetch failed for account ${account.name}:`, locError);
      }
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
