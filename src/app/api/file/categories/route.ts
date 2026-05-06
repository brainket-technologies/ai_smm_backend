import { NextResponse } from 'next/server';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // 1. Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // 2. Authenticate User
        const auth = await validateAuth(request);
        if (!auth.isValid) return auth.response;

        // 3. Get Business ID from header (Optional)
        const businessId = request.headers.get('X-Business-Id');

        // 4. Fetch Grouped Media Categories
        const categories = await prisma.mediaFile.groupBy({
            by: ['mediaCategory'],
            where: {
                userId: auth.userId,
                ...(businessId && { businessId: BigInt(businessId) }),
            },
            _count: {
                _all: true
            }
        });

        // 5. Format response
        const formattedCategories = categories.map(cat => ({
            category: cat.mediaCategory || 'general',
            count: cat._count._all
        }));

        return NextResponse.json({
            res: "success",
            success: true,
            message: 'Media categories fetched successfully',
            data: formattedCategories
        });

    } catch (error: any) {
        console.error('Fetch Media Categories Error:', error);
        return NextResponse.json(
            { res: "error", success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
