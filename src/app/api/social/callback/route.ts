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
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: 'Inter', -apple-system, sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0;
              background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); 
            }
            .card { 
              background: white; 
              padding: 3rem; 
              border-radius: 2rem; 
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
              text-align: center; 
              max-width: 400px;
              width: 90%;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 { 
              color: #1e293b; 
              margin-bottom: 0.5rem; 
              font-weight: 800;
              letter-spacing: -0.025em;
            }
            p { 
              color: #64748b; 
              line-height: 1.6;
              font-size: 1.1rem;
            }
            .button {
              display: inline-block;
              margin-top: 2rem;
              background: #6366f1;
              color: white;
              padding: 0.75rem 2rem;
              border-radius: 1rem;
              text-decoration: none;
              font-weight: 600;
              transition: all 0.2s;
            }
            .button:hover {
              background: #4f46e5;
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">🎉</div>
            <h1>Successfully Linked!</h1>
            <p>Your <b>${platform}</b> account is now connected to Ai Social.</p>
            <p>You can safely close this window to continue.</p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error: any) {
    console.error('Social Callback Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
