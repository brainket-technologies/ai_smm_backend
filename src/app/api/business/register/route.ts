import { NextResponse } from 'next/server';
import { BusinessService } from '@/lib/services/business-service';
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

        // 3. Process Registration
        const body = await request.json();
        const { business_name, number, category_id } = body;

        if (!business_name || !number || !category_id) {
            return NextResponse.json(
                { success: false, message: 'Business name, number, and category_id are required' },
                { status: 400 }
            );
        }

        const result = await BusinessService.register(BigInt(decoded.id), {
            name: business_name,
            phone: number,
            categoryId: category_id
        });

        return NextResponse.json({
            success: true,
            message: 'Business registered successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Business Register Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
