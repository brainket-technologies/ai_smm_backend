import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
    try {
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const genders = [
            { id: '1', name: 'Male' },
            { id: '2', name: 'Female' },
            { id: '3', name: 'Unisex' },
            { id: '4', name: 'All' }
        ];

        return NextResponse.json({
            success: true,
            message: 'Target genders fetched successfully',
            data: genders
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
