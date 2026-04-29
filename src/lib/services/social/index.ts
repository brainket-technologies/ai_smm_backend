import { SocialPlatformService } from './types';
import { FacebookService } from './facebook';
import { InstagramService } from './instagram';
import { GoogleService } from './google';
import { ThreadsService } from './threads';
import { YoutubeService } from './youtube';
import { LinkedinService } from './linkedin';
import { TwitterService } from './twitter';
import prisma from '@/lib/prisma';

export class SocialManager {
  private static services: Record<string, SocialPlatformService> = {
    facebook: new FacebookService(),
    instagram: new InstagramService(),
    gmb: new GoogleService(),
    threads: new ThreadsService(),
    youtube: new YoutubeService(),
    linkedin: new LinkedinService(),
    twitter: new TwitterService(),
    // Add other platforms as needed
  };

  static getService(platform: string): SocialPlatformService {
    const service = this.services[platform.toLowerCase()];
    if (!service) {
      throw new Error(`Platform ${platform} is not supported yet.`);
    }
    return service;
  }

  static parseState(state: string): any {
    try {
      return JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    } catch (e) {
      return {};
    }
  }

  static async saveAccount(businessId: string | bigint, profile: any) {
    const platformRecord = await prisma.platform.findFirst({
      where: { nameKey: profile.platform }
    });
    if (!platformRecord) throw new Error(`${profile.platform} platform not found.`);

    const encryptedToken = Buffer.from(profile.access_token).toString('base64');
    const encryptedRefreshToken = profile.refresh_token 
      ? Buffer.from(profile.refresh_token).toString('base64') 
      : null;

    return await prisma.socialAccount.upsert({
      where: { accountId: profile.id },
      update: {
        accountName: profile.name,
        accessToken: encryptedToken,
        refreshToken: encryptedRefreshToken,
        profilePicture: profile.profile_picture,
        pageId: profile.page_id,
        isActive: true
      },
      create: {
        businessId: BigInt(businessId),
        platformId: platformRecord.id,
        accountId: profile.id,
        accountName: profile.name,
        accessToken: encryptedToken,
        refreshToken: encryptedRefreshToken,
        profilePicture: profile.profile_picture,
        pageId: profile.page_id,
        isActive: true
      }
    });
  }
}

export * from './types';
