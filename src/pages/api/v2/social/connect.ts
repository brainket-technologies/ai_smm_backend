import type { NextApiRequest, NextApiResponse } from 'next';
import { SocialMediaService } from '@/lib/services/social-media-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Robust parameter reading
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  const platform = req.query.platform || url.searchParams.get('platform');
  const businessId = req.query.businessId || req.query.business_id || url.searchParams.get('businessId') || url.searchParams.get('business_id');

  console.log(`[PagesSocialConnectV2] Params received - Platform: ${platform}, BusinessId: ${businessId}`);

  if (!platform || !businessId) {
    return res.status(400).json({ 
      error: 'Platform and businessId are required',
      received: { platform: platform || null, businessId: businessId || null },
      debug_url: req.url,
      debug_query: req.query
    });
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
      // Matching opponent's URL style more closely
      const platformConfig = await SocialMediaService.getPlatformConfig('gmb') as any;
      const state = (SocialMediaService as any).generateState({ businessId, platform: 'gmb' });
      const scope = encodeURIComponent('https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile');
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
                `client_id=${platformConfig.appId.trim()}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `response_type=code&` +
                `scope=${scope}&` +
                `state=${state}&` +
                `access_type=offline&` +
                `include_granted_scopes=true&` +
                `prompt=consent`;
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

    return res.redirect(authUrl);

  } catch (error: any) {
    console.error('Social Connect Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
