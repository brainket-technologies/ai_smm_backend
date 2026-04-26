import type { NextApiRequest, NextApiResponse } from 'next';
import { SocialMediaService } from '@/lib/services/social-media-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { platform, businessId } = req.query;

  if (!platform || !businessId) {
    return res.status(400).json({ error: 'Platform and businessId are required' });
  }

  try {
    const protocol = 'https';
    const host = req.headers.host;
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    let authUrl = '';

    if (platform === 'facebook') {
      authUrl = await SocialMediaService.getFacebookAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'instagram') {
      authUrl = await SocialMediaService.getInstagramAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'google' || platform === 'gmb') {
      authUrl = await SocialMediaService.getGoogleAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'youtube') {
      authUrl = await SocialMediaService.getYouTubeAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'linkedin') {
      authUrl = await SocialMediaService.getLinkedInAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'threads') {
      authUrl = await SocialMediaService.getThreadsAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'pinterest') {
      authUrl = await SocialMediaService.getPinterestAuthUrl(businessId as string, redirectUri);
    } else {
      return res.status(400).json({ error: `Platform ${platform} not supported` });
    }

    // Direct redirect to OAuth provider
    return res.redirect(authUrl);

  } catch (error: any) {
    console.error('Social Connect Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
