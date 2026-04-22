import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth-service';
import { validateApiKey } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        // Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const body = await request.json();
        const { phone, email, type } = body;

        // Determine type if not provided explicitly
        const authType = type || (phone ? 'phone' : (email ? 'email' : null));
        const value = authType === 'phone' ? phone : email;

        if (!authType || !value) {
            return NextResponse.json(
                { success: false, message: 'Value (phone/email) and type are required' },
                { status: 400 }
            );
        }

        const result = await AuthService.sendOtp(authType as 'phone' | 'email', value);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Request OTP Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
