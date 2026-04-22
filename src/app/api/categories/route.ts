import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
    try {
        // Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'business';

        const categories = await prisma.category.findMany({
            where: { 
                type: type,
                isActive: true 
            },
            orderBy: { name: 'asc' }
        });

        // Convert BigInt to String for JSON serialization
        const formattedCategories = categories.map(cat => ({
            id: cat.id.toString(),
            name: cat.name,
            type: cat.type
        }));

        return NextResponse.json({
            success: true,
            message: 'Categories fetched successfully',
            data: formattedCategories
        });
    } catch (error: any) {
        console.error('Fetch Categories Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
