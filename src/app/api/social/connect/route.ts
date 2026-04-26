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
      // Use a Middle Page with a button to bypass Android's aggressive App Link redirection
      return new NextResponse(
        `<html>
          <head>
            <title>Instagram</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa; }
              .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; width: 90%; max-width: 400px; }
              .logo { width: 60px; height: 60px; margin-bottom: 1rem; }
              .btn { 
                display: block; 
                background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); 
                color: white; 
                padding: 12px; 
                border-radius: 8px; 
                text-decoration: none; 
                font-weight: bold; 
                margin-top: 1.5rem;
                box-shadow: 0 4px 15px rgba(204, 35, 102, 0.3);
              }
              p { color: #666; font-size: 14px; line-height: 1.4; }
            </style>
          </head>
          <body>
            <div class="card">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" class="logo">
              <h3>Instagram Professional</h3>
              <p>Connect your business account to start managing your content.</p>
              <form id="bypass-form" action="https://www.instagram.com/accounts/login/" method="GET">
                <input type="hidden" name="force_authentication" value="">
                <input type="hidden" name="platform_app_id" value="${authUrl.match(/platform_app_id=([^&]+)/)?.[1] || ''}">
                <input type="hidden" name="enable_fb_login" value="">
                <input type="hidden" name="next" value="${decodeURIComponent(authUrl.match(/next=([^&]+)/)?.[1] || '')}">
                <a href="javascript:void(0)" onclick="document.getElementById('bypass-form').submit()" class="btn">Continue to Instagram</a>
              </form>
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
