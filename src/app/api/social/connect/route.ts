import { NextResponse } from 'next/server';
import { SocialMediaService } from '@/lib/services/social-media-service';

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
    if (platform === 'facebook') {
      authUrl = await SocialMediaService.getFacebookAuthUrl(businessId, redirectUri);
    } else if (platform === 'instagram') {
      authUrl = await SocialMediaService.getInstagramAuthUrl(businessId, redirectUri);
    } else if (platform === 'google' || platform === 'gmb') {
      authUrl = await SocialMediaService.getGoogleAuthUrl(businessId, redirectUri);
    } else if (platform === 'threads') {
      authUrl = await SocialMediaService.getThreadsAuthUrl(businessId, redirectUri);
    } else if (platform === 'youtube') {
      authUrl = await SocialMediaService.getYouTubeAuthUrl(businessId, redirectUri);
    } else if (platform === 'pinterest') {
      authUrl = await SocialMediaService.getPinterestAuthUrl(businessId, redirectUri);
    } else if (platform === 'linkedin') {
      authUrl = await SocialMediaService.getLinkedInAuthUrl(businessId, redirectUri);
    } else {
      return NextResponse.json({ success: false, message: `Platform ${platform} not supported for OAuth` }, { status: 400 });
    }

    // Direct redirect for all platforms (removed the Instagram bridge page as requested)
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Social Connect Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
