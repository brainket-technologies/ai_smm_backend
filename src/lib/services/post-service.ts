import prisma from '@/lib/prisma';
import { PostStatus } from '@prisma/client';

export class PostService {
  /**
   * Creates a new post with associated media and platforms.
   */
  static async createPost(data: {
    businessId: string | bigint;
    caption?: string;
    ctaButtonId?: string | bigint;
    mediaIds?: string[] | bigint[];
    platformIds: string[] | bigint[];
    scheduledAt?: string | Date;
    status?: PostStatus;
  }) {
    const { businessId, caption, ctaButtonId, mediaIds, platformIds, scheduledAt, status } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Create the core post
      const post = await tx.post.create({
        data: {
          businessId: BigInt(businessId),
          caption,
          ctaButtonId: ctaButtonId ? BigInt(ctaButtonId) : null,
          status: status || (scheduledAt ? PostStatus.SCHEDULED : PostStatus.DRAFT),
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        },
      });

      // 2. Link media if any
      if (mediaIds && mediaIds.length > 0) {
        await tx.postMedia.createMany({
          data: mediaIds.map((id, index) => ({
            postId: post.id,
            mediaId: BigInt(id),
            order: index,
          })),
        });
      }

      // 3. Link platforms
      if (platformIds && platformIds.length > 0) {
        await tx.postPlatform.createMany({
          data: platformIds.map((id) => ({
            postId: post.id,
            platformId: BigInt(id),
            status: 'pending',
          })),
        });
      }

      return post;
    });
  }

  /**
   * Fetches posts for a business, filtered by status.
   */
  static async getPosts(businessId: string | bigint, status?: PostStatus, limit: number = 20) {
    return await prisma.post.findMany({
      where: {
        businessId: BigInt(businessId),
        ...(status && { status }),
      },
      include: {
        media: {
          include: {
            media: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        platformStatus: {
          include: {
            platform: true,
          },
        },
        ctaButton: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Fetches a single post by ID.
   */
  static async getPostById(id: string | bigint) {
    return await prisma.post.findUnique({
      where: { id: BigInt(id) },
      include: {
        media: {
          include: {
            media: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        platformStatus: {
          include: {
            platform: true,
          },
        },
        ctaButton: true,
      },
    });
  }

  /**
   * Updates an existing post.
   */
  static async updatePost(id: string | bigint, data: {
    caption?: string;
    ctaButtonId?: string | bigint;
    scheduledAt?: string | Date;
    status?: PostStatus;
    mediaIds?: string[] | bigint[];
    platformIds?: string[] | bigint[];
  }) {
    const postId = BigInt(id);
    const { caption, ctaButtonId, scheduledAt, status, mediaIds, platformIds } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Update core fields
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          ...(caption !== undefined && { caption }),
          ...(ctaButtonId !== undefined && { ctaButtonId: ctaButtonId ? BigInt(ctaButtonId) : null }),
          ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
          ...(status !== undefined && { status }),
        },
      });

      // 2. Update media if provided
      if (mediaIds !== undefined) {
        await tx.postMedia.deleteMany({ where: { postId } });
        if (mediaIds.length > 0) {
          await tx.postMedia.createMany({
            data: mediaIds.map((mid, index) => ({
              postId,
              mediaId: BigInt(mid),
              order: index,
            })),
          });
        }
      }

      // 3. Update platforms if provided
      if (platformIds !== undefined) {
        await tx.postPlatform.deleteMany({ where: { postId } });
        if (platformIds.length > 0) {
          await tx.postPlatform.createMany({
            data: platformIds.map((pid) => ({
              postId,
              platformId: BigInt(pid),
              status: 'pending',
            })),
          });
        }
      }

      return post;
    });
  }

  /**
   * Deletes a post and its relations.
   */
  static async deletePost(id: string | bigint) {
    const postId = BigInt(id);
    return await prisma.$transaction(async (tx) => {
      await tx.postMedia.deleteMany({ where: { postId } });
      await tx.postPlatform.deleteMany({ where: { postId } });
      return await tx.post.delete({ where: { id: postId } });
    });
  }
}
