import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth-service';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        // Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // Validate Auth
        const authCheck = await validateAuth(request);
        if (!authCheck.isValid) return authCheck.response;

        const userId = authCheck.userId!;
        const result = await AuthService.deleteAccount(userId);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Delete Account Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
