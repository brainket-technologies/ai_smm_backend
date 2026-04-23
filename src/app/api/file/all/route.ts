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

        // 3. Get Query Parameters for Filtering
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('type'); // type=logo, ai_generated, etc.
        const fileType = searchParams.get('file_type'); // file_type=image, video, etc.

        // 4. Fetch Media Files from Database
        const mediaFiles = await prisma.mediaFile.findMany({
            where: {
                userId: auth.userId,
                ...(category && { mediaCategory: category }),
                ...(fileType && { fileType: fileType }),
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // 5. Format and Return Response
        const formattedFiles = JSON.parse(JSON.stringify(mediaFiles, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({
            success: true,
            message: 'Media files fetched successfully',
            data: formattedFiles
        });

    } catch (error: any) {
        console.error('Fetch Media Files Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
