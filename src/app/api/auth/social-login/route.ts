import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth-service';
import { validateApiKey } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        // Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const body = await request.json();
        const { login_type, token, name, email, image } = body;

        if (!login_type || !token) {
            return NextResponse.json(
                { success: false, message: 'login_type and token are required' },
                { status: 400 }
            );
        }

        if (login_type !== 'google' && login_type !== 'apple') {
            return NextResponse.json(
                { success: false, message: 'Invalid login_type. Must be google or apple' },
                { status: 400 }
            );
        }

        const deviceId = request.headers.get('device-id') || request.headers.get('device_id') || undefined;
        const deviceType = request.headers.get('device-type') || request.headers.get('device_type') || undefined;

        const result = await AuthService.socialLogin({
            loginType: login_type as 'google' | 'apple',
            token,
            name,
            email,
            image,
            deviceId,
            deviceType,
        });

        return NextResponse.json({
            success: true,
            message: 'Social login successful',
            data: result
        });
    } catch (error: any) {
        console.error('Social Login Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
