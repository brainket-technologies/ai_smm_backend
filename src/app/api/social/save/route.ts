import { NextResponse } from 'next/server';
import { SocialManager } from '@/lib/services/social';
import { validateAuth } from '@/lib/auth-utils';

export async function POST(request: Request) {
  // 1. Verify Authentication
  const auth = await validateAuth(request);
  if (!auth.isValid) {
    return auth.response;
  }

  // 2. Check Business context
  const businessId = request.headers.get('X-Business-Id');
  if (!businessId) {
    return NextResponse.json({ res: "error", message: 'X-Business-Id header required' }, { status: 400 });
  }

  try {
    const profile = await request.json();

    // Required fields check (platform specific IDs and tokens)
    if (!profile.id || !profile.platform || !profile.access_token) {
      return NextResponse.json({
        res: "error",
        message: 'Missing required profile fields: id, platform, access_token'
      }, { status: 400 });
    }

    // 3. Save to database using standardized manager
    await SocialManager.saveAccount(businessId, profile);

    return NextResponse.json({
      res: "success",
      message: `${profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1)} account connected successfully!`
    });
  } catch (error: any) {
    console.error('Social Save Error:', error.message);
    return NextResponse.json({ res: "error", message: error.message }, { status: 500 });
  }
}
