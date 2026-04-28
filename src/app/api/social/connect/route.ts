import { NextRequest, NextResponse } from 'next/server';
import { SocialManager } from '@/lib/services/social';

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const searchParams = req.nextUrl.searchParams;
  const platform = searchParams.get('platform');
  
  // Try to get businessId from query or header
  const businessId = searchParams.get('businessId') || 
                    searchParams.get('business_id') || 
                    req.headers.get('x-business-id');

  console.log(`[${timestamp}] AppRouter Connect - Platform: ${platform}, BusinessId: ${businessId}`);

  if (!platform || !businessId) {
    return NextResponse.json({ error: 'Missing parameters (platform or businessId)' }, { status: 400 });
  }

  try {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host');
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    const service = SocialManager.getService(platform);
    const authUrl = await service.getAuthUrl(businessId, redirectUri);

    return NextResponse.redirect(authUrl);

  } catch (error: any) {
    console.error(`[${timestamp}] AppRouter Connect Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
