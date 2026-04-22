import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth-service';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        // 1. Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // 2. Authenticate User
        const auth = await validateAuth(request);
        if (!auth.isValid) return auth.response;

        const body = await request.json();
        const { name, email, phone, number } = body;

        const result = await AuthService.updateProfile(auth.userId!, { 
            name, 
            email, 
            phone: phone || number 
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
