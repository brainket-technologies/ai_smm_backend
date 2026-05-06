import { NextResponse } from 'next/server';
import { PostService } from '@/lib/services/post-service';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const post: any = await PostService.reschedulePost(id, scheduledAt);
    
    // Format BigInt fields to String for JSON serialization
    const formattedPost = {
      ...post,
      id: post.id.toString(),
      businessId: post.businessId.toString(),
      ctaButtonId: post.ctaButtonId?.toString(),
    };

    return NextResponse.json({
      res: 'success',
      success: true,
      message: 'Post rescheduled successfully',
      data: formattedPost
    });
  } catch (error: any) {
    console.error('Error rescheduling post:', error);
    return NextResponse.json(
      { res: 'error', success: false, message: error.message || 'Failed to reschedule post' },
      { status: 500 }
    );
  }
}
