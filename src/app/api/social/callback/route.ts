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

    // 2. Instagram: fetch pages list, let user select which to connect
    if (platform === 'instagram') {
      const pages = await SocialMediaService.getInstagramPages(code, redirectUri);

      if (pages.length === 0) {
        // No Instagram Business accounts found
        const deepLink = `brandboost://oauth?status=no_pages`;
        return new NextResponse(
          `<html>
            <head><title>No Instagram Business Account</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
            <body style="font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa;">
              <div style="background:white;padding:2rem;border-radius:1rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;width:90%;max-width:400px;">
                <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
                <h2 style="color:#1e293b;">No Business Account Found</h2>
                <p style="color:#64748b;">Please switch your Instagram to a Professional (Business/Creator) account and link it to a Facebook Page.</p>
                <a href="${`brandboost://oauth?status=no_pages`}" style="display:inline-block;margin-top:1.5rem;background:#6366f1;color:white;padding:0.75rem 2rem;border-radius:0.75rem;text-decoration:none;font-weight:600;">Back to App</a>
              </div>
            </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Pass pages list to Flutter via deep link (token never exposed — stored in encrypted session on next call)
      // We pass enough info for the UI, token goes via a second save API call
      const pagesData = encodeURIComponent(JSON.stringify(pages));
      const deepLink = `brandboost://oauth?status=ig_pages&pages=${pagesData}`;

      return new NextResponse(
        `<html>
          <head><title>Select Instagram Account</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa;">
            <div style="background:white;padding:2rem;border-radius:1rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;width:90%;max-width:400px;">
              <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
              <h2 style="color:#1e293b;">Authorized Successfully!</h2>
              <p style="color:#64748b;">Returning to app to select your Instagram Business account...</p>
              <a href="${deepLink}" style="display:inline-block;margin-top:1.5rem;background:#6366f1;color:white;padding:0.75rem 2rem;border-radius:0.75rem;text-decoration:none;font-weight:600;">Back to App</a>
            </div>
            <script>setTimeout(()=>{ window.location='${deepLink}'; }, 800);</script>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // 3. Other platforms: auto-save as before
    await SocialMediaService.handleCallback(platform, code, state, redirectUri);

    const deepLink = `brandboost://oauth?status=success&platform=${platform}`;
    return new NextResponse(
      `<html>
        <head><title>Connected!</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:linear-gradient(135deg,#6366f1 0%,#a855f7 100%);">
          <div style="background:white;padding:3rem;border-radius:2rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);text-align:center;max-width:400px;width:90%;">
            <div style="font-size:4rem;margin-bottom:1rem;">🎉</div>
            <h1 style="color:#1e293b;margin-bottom:0.5rem;font-weight:800;">${platform.charAt(0).toUpperCase() + platform.slice(1)} Connected!</h1>
            <p style="color:#64748b;">Your account has been linked. Returning to app...</p>
            <a href="${deepLink}" style="display:inline-block;margin-top:2rem;background:#6366f1;color:white;padding:0.75rem 2rem;border-radius:1rem;text-decoration:none;font-weight:600;">Back to App</a>
          </div>
          <script>setTimeout(()=>{ window.location='${deepLink}'; }, 800);</script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    console.error('Social Callback Error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error_description || error.message;
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(errorMessage)}`;
    return new NextResponse(
      `<html>
        <head><title>Connection Failed</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa;">
          <div style="background:white;padding:2rem;border-radius:1rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;width:90%;max-width:400px;">
            <div style="font-size:3rem;margin-bottom:1rem;">❌</div>
            <h2 style="color:#dc2626;">Connection Failed</h2>
            <p style="color:#64748b;">${errorMessage}</p>
            <a href="${deepLink}" style="display:inline-block;margin-top:1.5rem;background:#6366f1;color:white;padding:0.75rem 2rem;border-radius:0.75rem;text-decoration:none;font-weight:600;">Back to App</a>
          </div>
          <script>setTimeout(()=>{ window.location='${deepLink}'; }, 800);</script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
