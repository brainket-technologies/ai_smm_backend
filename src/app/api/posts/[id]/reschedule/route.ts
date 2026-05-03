import { NextResponse } from 'next/server';
import { PostService } from '@/lib/services/post-service';
import { ApiResponse } from '@/lib/utils/api-response';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return ApiResponse.error('Business ID is required', 400);
    }

    const { scheduledAt } = await request.json();
    if (!scheduledAt) {
      return ApiResponse.error('Scheduled date is required', 400);
    }

    const post = await PostService.reschedulePost(params.id, scheduledAt);
    return ApiResponse.success(post, 'Post rescheduled successfully');
  } catch (error: any) {
    console.error('Error rescheduling post:', error);
    return ApiResponse.error(error.message || 'Failed to reschedule post');
  }
}
