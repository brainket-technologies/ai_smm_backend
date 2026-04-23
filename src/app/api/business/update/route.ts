import { NextResponse } from 'next/server';
import { BusinessService } from '@/lib/services/business-service';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const auth = await validateAuth(request);
        if (!auth.isValid) return auth.response;

        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Business ID is required' },
                { status: 400 }
            );
        }

        const result = await BusinessService.update(auth.userId!, id, data);

        return NextResponse.json({
            success: true,
            message: 'Business updated successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Business Update Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
