import { NextResponse } from 'next/server';
import { validateAuth, validateApiKey } from '@/lib/auth-utils';
import { AuthService } from '@/lib/services/auth-service';

export async function POST(request: Request) {
  const apiKeyValidation = validateApiKey(request);
  if (!apiKeyValidation.isValid) return apiKeyValidation.response;

  const auth = await validateAuth(request);
  if (!auth.isValid) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const { fcmToken, deviceId, deviceType } = body;

    if (!fcmToken) {
      return NextResponse.json({ success: false, message: 'fcmToken is required' }, { status: 400 });
    }

    // Use deviceId from body or from auth token
    const targetDeviceId = deviceId || auth.deviceId;

    if (!targetDeviceId) {
      return NextResponse.json({ success: false, message: 'deviceId is required' }, { status: 400 });
    }

    const result = await AuthService.updateFcmToken(auth.userId!, targetDeviceId, fcmToken, deviceType);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('FCM Token Update Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
