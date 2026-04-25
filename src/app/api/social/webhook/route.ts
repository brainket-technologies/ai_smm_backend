import { NextResponse } from 'next/server';

/**
 * Facebook/Instagram Webhook Handler
 * 
 * GET: Verification for Meta (hub.mode, hub.verify_token, hub.challenge)
 * POST: Receiving event notifications (messages, posts, etc.)
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // We recommend setting this in your .env file
  const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'brandboost_ai_social_webhook_secret';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Facebook Webhook Verified Successfully');
    return new Response(challenge, { status: 200 });
  } else {
    console.error('❌ Facebook Webhook Verification Failed: Token mismatch');
    return new Response('Forbidden', { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log the incoming event (useful for debugging during development)
    console.log('📩 Webhook Event Received:', JSON.stringify(body, null, 2));

    /**
     * Handle different event types here
     * - body.object === 'page' for Facebook
     * - body.object === 'instagram' for Instagram
     */
    if (body.object === 'page') {
      body.entry?.forEach((entry: any) => {
        // Handle changes, messaging, etc.
        console.log('Page Event Entry:', entry);
      });
    } else if (body.object === 'instagram') {
      body.entry?.forEach((entry: any) => {
        // Handle Instagram comments, mentions, etc.
        console.log('Instagram Event Entry:', entry);
      });
    }

    return NextResponse.json({ success: true, message: 'EVENT_RECEIVED' });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
