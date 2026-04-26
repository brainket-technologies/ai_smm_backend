import { NextRequest, NextResponse } from 'next/server';
import { SocialMediaService } from '@/lib/services/social-media-service';

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  console.log(`[${timestamp}] AppRouter Callback - URL: ${req.url}`);

  if (error) {
    console.error(`[${timestamp}] Callback error: ${error}`);
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(error)}`;
    return new NextResponse(`<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }

  if (!code || !state) {
    console.warn(`[${timestamp}] Missing code or state.`);
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  try {
    const decryptedState = SocialMediaService.parseState(state);
    const platform = decryptedState.platform;
    const businessId = decryptedState.businessId;

    console.log(`[${timestamp}] State parsed - Platform: ${platform}, BusinessId: ${businessId}`);

    const protocol = 'https';
    const host = req.headers.get('host');
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    console.log(`[${timestamp}] Fetching profiles for ${platform}.`);
    const profiles = await SocialMediaService.getProfilesFromCallback(platform, code, redirectUri);
    
    if (profiles.length === 0) {
      const deepLink = `brandboost://oauth?status=no_pages&platform=${platform}`;
      return new NextResponse(`<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }

    const optimizedProfiles = profiles.map((p: any) => ({
      id: p.id,
      name: p.name,
      username: p.username,
      profile_picture: p.profile_picture,
      platform: p.platform,
      account_type: p.account_type,
      page_id: p.page_id,
      access_token: p.access_token,
      refresh_token: p.refresh_token
    })).slice(0, 10);

    const profilesData = encodeURIComponent(JSON.stringify(optimizedProfiles));
    const deepLink = `brandboost://oauth?status=profiles&platform=${platform}&profiles=${profilesData}`;

    return new NextResponse(`
      <html>
        <head><title>Success</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff;">
          <div style="text-align:center;">
            <div style="font-size:3rem;">✅</div>
            <h2 style="color:#22c55e;">Connected!</h2>
            <p>Taking you back to SocialSuite...</p>
            <script>setTimeout(()=>{ window.location='${deepLink}'; }, 800);</script>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (error: any) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error(`[${timestamp}] AppRouter Callback Error Details:`, errorDetails);
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(error.message)}`;
    return new NextResponse(`<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }
}
