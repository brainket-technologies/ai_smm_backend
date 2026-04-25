import { NextResponse } from 'next/server';
import { SocialMediaService } from '@/lib/services/social-media-service';
import { CryptoService } from '@/lib/services/crypto-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ success: false, message: `Social Auth Error: ${error}` }, { status: 400 });
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

    // 2. Handle token exchange
    await SocialMediaService.handleCallback(platform, code, state, redirectUri);

    // 3. Return a success page that the Flutter app can detect
    return new NextResponse(
      `<html>
        <head>
          <title>Connection Successful</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; }
            .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
            h1 { color: #10b981; margin-bottom: 0.5rem; }
            p { color: #64748b; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Connected!</h1>
            <p>Your ${platform} account has been successfully linked.</p>
            <p>You can close this window now.</p>
          </div>
          <script>
             // Signal to Flutter if using a custom scheme (Optional but recommended)
             // window.location.href = "ai-social://connection?status=success&platform=${platform}";
             
             // Or just let the user close the WebView
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error: any) {
    console.error('Social Callback Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
