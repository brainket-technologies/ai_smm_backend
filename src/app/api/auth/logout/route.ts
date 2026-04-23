import { NextResponse } from 'next/server';
import { validateAuth, validateApiKey } from '@/lib/auth-utils';
import { AuthService } from '@/lib/services/auth-service';

export async function POST(request: Request) {
  const apiKeyValidation = validateApiKey(request);
  if (!apiKeyValidation.isValid) return apiKeyValidation.response;

  const auth = await validateAuth(request);
  if (!auth.isValid) return auth.response;

  try {
    const result = await AuthService.logout(auth.userId!, auth.deviceId!);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Logout Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
