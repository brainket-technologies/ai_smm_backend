import type { NextApiRequest, NextApiResponse } from 'next';
import { SocialMediaService } from '@/lib/services/social-media-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] SocialConnect Request - Method: ${req.method}, URL: ${req.url}`);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Robust parameter reading
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  const platform = req.query.platform || url.searchParams.get('platform');
  const businessId = req.query.businessId || req.query.business_id || url.searchParams.get('businessId') || url.searchParams.get('business_id');

  console.log(`[${timestamp}] Params parsed - Platform: ${platform}, BusinessId: ${businessId}`);

  if (!platform || !businessId) {
    console.warn(`[${timestamp}] Missing parameters. Returning 400.`);
    return res.status(400).json({ 
      error: 'Platform and businessId are required',
      received: { platform: platform || null, businessId: businessId || null },
      path: req.url
    });
  }

  try {
    const protocol = 'https';
    const host = req.headers.host;
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    console.log(`[${timestamp}] Generating Auth URL for ${platform}. RedirectURI: ${redirectUri}`);

    let authUrl = '';

    if (platform === 'facebook') {
      authUrl = await SocialMediaService.getFacebookAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'instagram') {
      authUrl = await SocialMediaService.getInstagramAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'google' || platform === 'gmb') {
      const platformConfig = await SocialMediaService.getPlatformConfig('gmb') as any;
      const state = SocialMediaService.generateState({ businessId, platform: 'gmb' });
      const scope = encodeURIComponent('https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile');
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
                `client_id=${platformConfig.appId.trim()}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `response_type=code&` +
                `scope=${scope}&` +
                `state=${state}&` +
                `access_type=offline&` +
                `include_granted_scopes=true`;
    } else if (platform === 'youtube') {
      authUrl = await SocialMediaService.getYouTubeAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'linkedin') {
      authUrl = await SocialMediaService.getLinkedInAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'threads') {
      authUrl = await SocialMediaService.getThreadsAuthUrl(businessId as string, redirectUri);
    } else if (platform === 'pinterest') {
      authUrl = await SocialMediaService.getPinterestAuthUrl(businessId as string, redirectUri);
    } else {
      console.error(`[${timestamp}] Unsupported platform: ${platform}`);
      return res.status(400).json({ error: `Platform ${platform} not supported` });
    }

    console.log(`[${timestamp}] Redirecting to: ${authUrl.substring(0, 50)}...`);
    return res.redirect(authUrl);

  } catch (error: any) {
    console.error(`[${timestamp}] Social Connect Error:`, error.message);
    return res.status(500).json({ error: error.message, tip: 'Check if platforms are configured in database' });
  }
}
