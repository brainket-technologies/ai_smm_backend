import axios from 'axios';
import prisma from '@/lib/prisma';
import { SocialPlatformService, SocialProfile } from './types';
import crypto from 'crypto';

export class TwitterService implements SocialPlatformService {
  private async getPlatformConfig() {
    const platform = await prisma.platform.findFirst({
      where: { nameKey: 'twitter' }
    });
    if (!platform || !platform.appId) {
      throw new Error('Twitter configuration not found in Database.');
    }
    return platform;
  }

  // Simple PKCE generator
  private generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
  }

  async getAuthUrl(businessId: string, redirectUri: string): Promise<string> {
    const config = await this.getPlatformConfig();
    
    // For X, we need to store the code_verifier somewhere or use a deterministic one for this session.
    // For simplicity in this architecture, we'll include it in the state (base64 encoded)
    const pkce = this.generatePKCE();
    
    const stateData = { 
      businessId, 
      platform: 'twitter',
      code_verifier: pkce.verifier 
    };
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');
    
    const scopes = encodeURIComponent('tweet.read tweet.write users.read offline.access');
    
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${config.appId!.trim()}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}&code_challenge=${pkce.challenge}&code_challenge_method=S256`;
  }

  async getProfiles(code: string, redirectUri: string, state?: string): Promise<SocialProfile[]> {
    const config = await this.getPlatformConfig();
    
    // Extract code_verifier from state
    let codeVerifier = '';
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        codeVerifier = decodedState.code_verifier;
      } catch (e) {
        console.error('[TwitterService] Failed to parse state for code_verifier');
      }
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('code_verifier', codeVerifier);
    
    console.log('[TwitterService] Exchanging code for token...');
    
    // Twitter OAuth 2.0 requires Basic Auth header with client_id:client_secret
    const authHeader = Buffer.from(`${config.appId!.trim()}:${config.appSecret!.trim()}`).toString('base64');
    
    const tokenRes = await axios.post('https://api.twitter.com/2/oauth2/token', params.toString(), {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      }
    });
    
    const accessToken = tokenRes.data.access_token;
    const refreshToken = tokenRes.data.refresh_token;

    console.log('[TwitterService] Fetching user profile...');
    const userRes = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const userData = userRes.data.data;
    
    return [{
      id: userData.id,
      name: userData.name,
      username: userData.username,
      platform: 'twitter',
      access_token: accessToken,
      refresh_token: refreshToken,
      account_type: 'Profile',
      page_id: userData.id,
      profile_picture: userData.profile_image_url || null
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
