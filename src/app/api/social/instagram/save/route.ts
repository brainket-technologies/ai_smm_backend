import { NextResponse } from 'next/server';
import { SocialManager } from '@/lib/services/social';
import { validateAuth } from '@/lib/auth-utils';

export async function POST(request: Request) {
  // 1. Verify Authentication
  const auth = await validateAuth(request);
  if (!auth.isValid) {
    return auth.response;
  }

  const businessId = request.headers.get('X-Business-Id');
  if (!businessId) {
    return NextResponse.json({ success: false, message: 'X-Business-Id header required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { instagramId, username, profilePicture, pageId, longLivedToken } = body;

    if (!instagramId || !username || !pageId || !longLivedToken) {
      return NextResponse.json({ success: false, message: 'Missing required fields: instagramId, username, pageId, longLivedToken' }, { status: 400 });
    }

    await SocialManager.saveAccount(businessId, {
      id: instagramId,
      name: username,
      username,
      profile_picture: profilePicture || null,
      platform: 'instagram',
      access_token: longLivedToken,
      page_id: pageId
    });

    return NextResponse.json({ success: true, message: `@${username} connected successfully!` });
  } catch (error: any) {
    console.error('Instagram Save Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
