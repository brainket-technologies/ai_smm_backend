import { NextResponse } from 'next/server';
import { PostService } from '@/lib/services/post-service';
import { validateRequest } from '@/lib/auth-utils';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response!;

    const { id } = await params;
    const post = await PostService.getPostById(id);

    if (!post) {
      return NextResponse.json(
        { res: "error", message: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.businessId.toString() !== check.businessId.toString()) {
      return NextResponse.json(
        { res: "error", message: 'Unauthorized access to this post' },
        { status: 403 }
      );
    }

    // Flatten media items for easier frontend consumption
    const formattedMedia = post.media.map((item: any) => ({
      id: item.id.toString(),
      postId: item.postId.toString(),
      mediaId: item.mediaId.toString(),
      order: item.order,
      fileUrl: item.media?.fileUrl,
      fileType: item.media?.fileType,
      mimeType: item.media?.mimeType,
      size: item.media?.size,
    }));

    return NextResponse.json({ 
      res: "success", 
      message: "Post details fetched successfully",
      data: {
        ...post,
        media: formattedMedia
      } 
    });
  } catch (error: any) {
    console.error('[API Post Detail GET] Error:', error.message);
    return NextResponse.json(
      { res: "error", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response!;

    const { id } = await params;
    const body = await req.json();

    const existingPost = await PostService.getPostById(id);
    if (!existingPost) {
      return NextResponse.json({ res: "error", message: 'Post not found' }, { status: 404 });
    }
    if (existingPost.businessId.toString() !== check.businessId.toString()) {
      return NextResponse.json({ res: "error", message: 'Unauthorized' }, { status: 403 });
    }

    const post = await PostService.updatePost(id, body);

    return NextResponse.json({ 
      res: "success", 
      message: "Post updated successfully",
      data: post 
    });
  } catch (error: any) {
    console.error('[API Post Detail PATCH] Error:', error.message);
    return NextResponse.json(
      { res: "error", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response!;

    const { id } = await params;
    
    const existingPost = await PostService.getPostById(id);
    if (!existingPost) {
      return NextResponse.json({ res: "error", message: 'Post not found' }, { status: 404 });
    }
    if (existingPost.businessId.toString() !== check.businessId.toString()) {
      return NextResponse.json({ res: "error", message: 'Unauthorized' }, { status: 403 });
    }

    await PostService.deletePost(id);

    return NextResponse.json({ 
      res: "success", 
      message: 'Post deleted successfully' 
    });
  } catch (error: any) {
    console.error('[API Post Detail DELETE] Error:', error.message);
    return NextResponse.json(
      { res: "error", message: error.message },
      { status: 500 }
    );
  }
}
