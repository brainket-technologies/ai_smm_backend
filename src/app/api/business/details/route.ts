import { NextResponse } from 'next/server';
import { BusinessService } from '@/lib/services/business-service';
import { validateApiKey, validateAuth, validateBusinessId } from '@/lib/auth-utils';

export async function GET(request: Request) {
    try {
        // 1. Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // 2. Validate Auth (to get userId)
        const auth = await validateAuth(request);
        if (!auth.isValid) return auth.response;

        // 3. Get Business ID from header
        const businessCheck = validateBusinessId(request);
        if (!businessCheck.isValid) return businessCheck.response;

        // 4. Fetch business details
        const result = await BusinessService.getById(auth.userId!, businessCheck.businessId!.toString());

        if (!result) {
            return NextResponse.json(
                { success: false, message: 'Business not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Business details fetched successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Business Details Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
