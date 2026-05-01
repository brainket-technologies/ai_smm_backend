import { NextResponse } from 'next/server';
import { BusinessService } from '@/lib/services/business-service';
import { validateRequest } from '@/lib/auth-utils';

export async function GET(request: Request) {
    try {
        const check = await validateRequest(request);
        if (!check.isValid) return check.response!;

        // 4. Fetch business details
        const result = await BusinessService.getById(check.userId!, check.businessId.toString());

        if (!result) {
            return NextResponse.json(
                { res: false, message: 'Business not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            res: true,
            message: 'Business details fetched successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Business Details Error:', error);
        return NextResponse.json(
            { res: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
