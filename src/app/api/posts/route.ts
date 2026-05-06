import { NextResponse } from 'next/server';
import { PostService } from '@/lib/services/post-service';
import { validateRequest } from '@/lib/auth-utils';
import { PostStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response!;

    const body = await req.json();
    const { caption, ctaButtonId, mediaIds, platformIds, scheduledAt, status } = body;

    if (!platformIds || platformIds.length === 0) {
      return NextResponse.json(
        { res: "error", message: 'platformIds are required' },
        { status: 400 }
      );
    }

    const post = await PostService.createPost({
      businessId: check.businessId,
      caption,
      ctaButtonId,
      mediaIds,
      platformIds,
      scheduledAt,
      status: status as PostStatus,
    });

    return NextResponse.json({ 
      res: "success", 
      message: post.status === PostStatus.SCHEDULED ? "Post scheduled successfully" : "Post created successfully",
      data: post 
    });
  } catch (error: any) {
    console.error('[API Posts POST] Error:', error.message);
    return NextResponse.json(
      { res: "error", message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as PostStatus;
    const limit = parseInt(searchParams.get('limit') || '20');

    const posts = await PostService.getPosts(check.businessId, status, limit);

    const formattedPosts = posts.map((post: any) => ({
      ...post,
      media: post.media.map((item: any) => ({
        id: item.id.toString(),
        postId: item.postId.toString(),
        mediaId: item.mediaId.toString(),
        order: item.order,
        fileUrl: item.media?.fileUrl,
        fileType: item.media?.fileType,
      }))
    }));

    return NextResponse.json({ 
      res: "success", 
      message: "Posts fetched successfully",
      data: formattedPosts 
    });
  } catch (error: any) {
    console.error('[API Posts GET] Error:', error.message);
    return NextResponse.json(
      { res: "error", message: error.message },
      { status: 500 }
    );
  }
}
