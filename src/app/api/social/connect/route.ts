import { NextResponse } from 'next/server';
import { SocialMediaService } from '@/lib/services/social-media-service';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const businessId = searchParams.get('business_id');

  if (!platform || !businessId) {
    return NextResponse.json({ success: false, message: 'platform and business_id are required' }, { status: 400 });
  }

  try {
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    let authUrl = '';
    if (platform === 'facebook' || platform === 'instagram') {
      authUrl = await SocialMediaService.getFacebookAuthUrl(businessId, redirectUri);
    } else if (platform === 'google' || platform === 'gmb') {
      authUrl = await SocialMediaService.getGoogleAuthUrl(businessId, redirectUri);
    } else {
      return NextResponse.json({ success: false, message: `Platform ${platform} not supported for OAuth` }, { status: 400 });
    }

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Social Connect Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
