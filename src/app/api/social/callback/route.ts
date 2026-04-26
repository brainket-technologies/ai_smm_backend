import { NextResponse } from 'next/server';
import { SocialMediaService } from '@/lib/services/social-media-service';
import { CryptoService } from '@/lib/services/crypto-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  console.log(`[SocialCallback] Received callback. Code: ${code ? 'yes' : 'no'}, State: ${state ? 'yes' : 'no'}, Error: ${error || 'none'}`);

  if (error) {
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(error)}`;
    return new NextResponse(
      `<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (!code || !state) {
    console.error('[SocialCallback] Missing code or state');
    return NextResponse.json({ success: false, message: 'Missing code or state' }, { status: 400 });
  }

  try {
    // 1. Determine platform from state
    let decryptedState;
    try {
      decryptedState = JSON.parse(CryptoService.decrypt(state));
      console.log('[SocialCallback] Decrypted state:', JSON.stringify(decryptedState));
    } catch (e: any) {
      console.error('[SocialCallback] State decryption failed:', e.message);
      throw new Error('Invalid state parameter');
    }

    const platform = decryptedState.platform;
    const protocol = 'https'; // Force https for Vercel
    const host = request.headers.get('host');
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    // 2. Fetch standardized profile list (Pages, Locations, etc.)
    console.log(`[SocialCallback] Fetching profiles for ${platform} using redirect_uri: ${redirectUri}`);
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
        <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff;">
          <div style="text-align:center;">
            <div style="font-size:3rem;">✅</div>
            <h2>Connected!</h2>
            <p>Returning to app...</p>
            <script>setTimeout(()=>{ window.location='${deepLink}'; }, 500);</script>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    console.error('Social Callback Error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error_description || error.message;
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(errorMessage)}`;
    return new NextResponse(
      `<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
