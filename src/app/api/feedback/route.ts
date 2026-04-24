import { NextResponse } from 'next/server';
import { FeedbackService } from '@/lib/services/feedback-service';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        // Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // Validate Auth
        const authCheck = await validateAuth(request);
        if (!authCheck.isValid) return authCheck.response;

        const userId = authCheck.userId!;
        const body = await request.json();
        const { message, type, rating, subject } = body;

        if (!message || !type) {
            return NextResponse.json(
                { success: false, message: 'Message and type are required' },
                { status: 400 }
            );
        }

        const result = await FeedbackService.createFeedback(userId, {
            message,
            type,
            rating,
            subject
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Feedback API Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        // This is usually for admin, but we can put basic security if needed
        // For now, allow it if API key is valid
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const feedbacks = await FeedbackService.getAllFeedback();

        return NextResponse.json({
            success: true,
            data: feedbacks
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
