import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth-service';
import { validateApiKey } from '@/lib/auth-utils';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: Request) {
    try {
        // 1. Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // 2. Authenticate User
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Authorization token required' }, { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token) as { id: string };
        if (!decoded) {
            return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
        }

        // 3. Process Update
        const body = await request.json();
        const { name, email } = body;

        const result = await AuthService.updateProfile(BigInt(decoded.id), { name, email });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
