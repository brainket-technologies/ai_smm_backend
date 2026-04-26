import { NextResponse } from 'next/server';
import { SocialMediaService } from '@/lib/services/social-media-service';
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
    return NextResponse.json({ success: false, message: 'X-Business-Id header required' }, { status: 400 });
  }

  try {
    const profile = await request.json();

    // Required fields check (platform specific IDs and tokens)
    if (!profile.id || !profile.platform || !profile.access_token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required profile fields: id, platform, access_token' 
      }, { status: 400 });
    }

    // 3. Save to database using standardized service
    await SocialMediaService.saveSelectedAccount(businessId, profile);

    return NextResponse.json({ 
      success: true, 
      message: `${profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1)} account connected successfully!` 
    });
  } catch (error: any) {
    console.error('Social Save Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
