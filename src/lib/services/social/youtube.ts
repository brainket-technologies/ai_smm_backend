import axios from 'axios';
import prisma from '@/lib/prisma';
import { SocialPlatformService, SocialProfile } from './types';

export class YoutubeService implements SocialPlatformService {
  private async getPlatformConfig() {
    const platform = await prisma.platform.findFirst({
      where: { nameKey: 'youtube' }
    });
    if (!platform || !platform.appId) {
      throw new Error('YouTube configuration not found in Database.');
    }
    return platform;
  }

  async getAuthUrl(businessId: string, redirectUri: string): Promise<string> {
    const config = await this.getPlatformConfig();
    const state = Buffer.from(JSON.stringify({ businessId, platform: 'youtube' })).toString('base64');
    const scope = encodeURIComponent([
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' '));
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.appId!.trim()}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&access_type=offline&include_granted_scopes=true&prompt=consent`;
  }

  async getProfiles(code: string, redirectUri: string): Promise<SocialProfile[]> {
    const config = await this.getPlatformConfig();
    
    const params = new URLSearchParams();
    params.append('client_id', config.appId!.trim());
    params.append('client_secret', config.appSecret!.trim());
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    
    console.log('[YoutubeService] Exchanging code for token...');
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString());
    const accessToken = tokenRes.data.access_token;
    const refreshToken = tokenRes.data.refresh_token;
    
    console.log('[YoutubeService] Fetching YouTube channels...');
    const channelsRes = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { 
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const profiles: SocialProfile[] = [];
    const channels = channelsRes.data.items || [];
    
    console.log(`[YoutubeService] Found ${channels.length} channels.`);
    
    channels.forEach((channel: any) => {
      profiles.push({ 
        id: channel.id, 
        name: channel.snippet.title, 
        username: channel.snippet.title, 
        platform: 'youtube', 
        access_token: accessToken, 
        refresh_token: refreshToken, 
        account_type: 'Channel', 
        page_id: channel.id,
        profile_picture: channel.snippet.thumbnails?.default?.url || null
      });
    });
    
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
