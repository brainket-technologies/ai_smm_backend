import { NextResponse } from 'next/server';
import { PostService } from '@/lib/services/post-service';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json(
        { res: 'error', success: false, message: 'Business ID is required' },
        { status: 400 }
      );
    }

    const { scheduledAt } = await request.json();
    if (!scheduledAt) {
      return NextResponse.json(
        { res: 'error', success: false, message: 'Scheduled date is required' },
        { status: 400 }
      );
    }

    const post = await PostService.reschedulePost(params.id, scheduledAt);
    return NextResponse.json({
      res: 'success',
      success: true,
      message: 'Post rescheduled successfully',
      data: post
    });
  } catch (error: any) {
    console.error('Error rescheduling post:', error);
    return NextResponse.json(
      { res: 'error', success: false, message: error.message || 'Failed to reschedule post' },
      { status: 500 }
    );
  }
}
