import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
    try {
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const data = await prisma.targetRegion.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        const formatted = data.map(item => ({
            id: item.id.toString(),
            name: item.name
        }));

        return NextResponse.json({
            success: true,
            message: 'Target regions fetched successfully',
            data: formatted
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
