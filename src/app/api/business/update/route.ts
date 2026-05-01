import { NextResponse } from 'next/server';
import { BusinessService } from '@/lib/services/business-service';
import { validateApiKey, validateAuth, validateBusinessId } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const auth = await validateAuth(request);
        if (!auth.isValid) return auth.response;

        // Get Business ID from header
        const businessCheck = validateBusinessId(request);
        if (!businessCheck.isValid) return businessCheck.response;

        const body = await request.json();
        const data = body; // Body no longer needs id

        const result = await BusinessService.update(auth.userId!, businessCheck.businessId!.toString(), data);

        return NextResponse.json({
            res: true,
            message: 'Business updated successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Business Update Error:', error);
        return NextResponse.json(
            { res: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
