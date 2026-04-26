import { NextRequest, NextResponse } from 'next/server';
import { SocialMediaService } from '@/lib/services/social-media-service';

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const searchParams = req.nextUrl.searchParams;
  const platform = searchParams.get('platform');
  const businessId = searchParams.get('businessId') || searchParams.get('business_id');

  console.log(`[${timestamp}] AppRouter Connect - Platform: ${platform}, BusinessId: ${businessId}`);

  if (!platform || !businessId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const protocol = 'https';
    const host = req.headers.get('host');
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    let authUrl = '';

    if (platform === 'facebook') {
      authUrl = await SocialMediaService.getFacebookAuthUrl(businessId, redirectUri);
    } else if (platform === 'instagram') {
      authUrl = await SocialMediaService.getInstagramAuthUrl(businessId, redirectUri);
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
    } else {
      return NextResponse.json({ error: `Platform ${platform} not supported` }, { status: 400 });
    }

    return NextResponse.redirect(authUrl);

  } catch (error: any) {
    console.error(`[${timestamp}] AppRouter Connect Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
