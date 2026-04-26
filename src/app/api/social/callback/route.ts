import { NextResponse } from 'next/server';
import { SocialMediaService } from '@/lib/services/social-media-service';
import { CryptoService } from '@/lib/services/crypto-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(error)}`;
    return new NextResponse(
      `<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (!code || !state) {
    return NextResponse.json({ success: false, message: 'Missing code or state' }, { status: 400 });
  }

  try {
    // 1. Determine platform from state
    const decodedState = JSON.parse(CryptoService.decrypt(state));
    const platform = decodedState.platform;

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    // 2. Fetch standardized profile list (Pages, Locations, etc.)
    console.log(`[SocialCallback] Fetching profiles for platform: ${platform}`);
    const profiles = await SocialMediaService.getProfilesFromCallback(platform, code, redirectUri);
    console.log(`[SocialCallback] Found ${profiles.length} profiles`);

    if (profiles.length === 0) {
      const deepLink = `brandboost://oauth?status=no_pages&platform=${platform}`;
      return new NextResponse(
        `<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // 3. Send profiles to Flutter via deep link
    const profilesData = encodeURIComponent(JSON.stringify(profiles));
    const deepLink = `brandboost://oauth?status=profiles&platform=${platform}&profiles=${profilesData}`;

    return new NextResponse(
      `<html>
        <head><title>Success</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa;">
          <div style="background:white;padding:2rem;border-radius:1rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;width:90%;max-width:400px;">
            <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
            <h2 style="color:#1e293b;">Connected Successfully!</h2>
            <p style="color:#64748b;">Returning to app to select your ${platform} account...</p>
            <a href="${deepLink}" style="display:inline-block;margin-top:1.5rem;background:#6366f1;color:white;padding:0.75rem 2rem;border-radius:0.75rem;text-decoration:none;font-weight:600;">Back to App</a>
          </div>
          <script>setTimeout(()=>{ window.location='${deepLink}'; }, 800);</script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    console.error('Social Callback Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full Error Data:', JSON.stringify(error.response.data));
    }
    const errorMessage = error.response?.data?.error_description || error.message;
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(errorMessage)}`;
    return new NextResponse(
      `<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
