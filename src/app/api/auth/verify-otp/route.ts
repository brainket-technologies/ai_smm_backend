import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth-service';
import { validateApiKey } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        // Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const body = await request.json();
        const { phone, email, otp, type } = body;

        // Determine type if not provided explicitly
        const authType = type || (phone ? 'phone' : (email ? 'email' : null));
        const value = authType === 'phone' ? phone : email;

        if (!authType || !value || !otp) {
            return NextResponse.json(
                { success: false, message: 'Value (phone/email), type and OTP are required' },
                { status: 400 }
            );
        }

        const deviceId = request.headers.get('device-id') || request.headers.get('device_id') || undefined;
        const deviceType = request.headers.get('device-type') || request.headers.get('device_type') || undefined;

        const result = await AuthService.verifyOtp(authType as 'phone' | 'email', value, otp, deviceId, deviceType);

        return NextResponse.json({
            success: true,
            message: 'Logged in successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
