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
    if (platform === 'facebook') {
      authUrl = await SocialMediaService.getFacebookAuthUrl(businessId, redirectUri);
    } else if (platform === 'instagram') {
      authUrl = await SocialMediaService.getInstagramAuthUrl(businessId, redirectUri);
    } else if (platform === 'google' || platform === 'gmb') {
      authUrl = await SocialMediaService.getGoogleAuthUrl(businessId, redirectUri);
    } else if (platform === 'threads') {
      authUrl = await SocialMediaService.getThreadsAuthUrl(businessId, redirectUri);
    } else {
      return NextResponse.json({ success: false, message: `Platform ${platform} not supported for OAuth` }, { status: 400 });
    }

    if (platform === 'instagram') {
      // Use a JS redirect for Instagram to break the App Link intent chain
      return new NextResponse(
        `<html>
          <body style="background: #fafafa; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
            <div style="text-align: center;">
              <p>Redirecting to Instagram...</p>
              <script>window.location.replace("${authUrl}");</script>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Social Connect Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
