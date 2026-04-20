 import prisma from "./prisma";

export type MediaCategory = 'logo' | 'ai_generated' | 'post' | 'product' | 'service' | 'avatar' | 'flag' | 'theme';
export type RelatedType = 'business' | 'ai_content' | 'product' | 'service' | 'user' | 'platform' | 'payment_method' | 'app_theme' | 'app_translation';

export interface RegisterMediaOptions {
  fileUrl: string;
  fileType: 'image' | 'video' | 'document';
  mimeType?: string;
  mediaCategory?: MediaCategory;
  relatedType?: RelatedType;
  relatedId?: string | bigint;
  userId?: string | bigint;
  businessId?: string | bigint;
  size?: number;
  tags?: any;
}

/**
 * Registers a new media file in the centralized MediaFile table.
 * Returns the BigInt ID of the registered file.
 */
export async function registerMedia(options: RegisterMediaOptions) {
  try {
    const { 
      fileUrl, 
      fileType, 
      mimeType, 
      mediaCategory, 
      relatedType, 
      relatedId, 
      userId, 
      businessId,
      size,
      tags 
    } = options;

    const mediaFile = await prisma.mediaFile.create({
      data: {
        fileUrl,
        fileType,
        mimeType,
        mediaCategory,
        relatedType,
        relatedId: relatedId ? BigInt(relatedId) : null,
        userId: userId ? BigInt(userId) : null,
        businessId: businessId ? BigInt(businessId) : null,
        size: size || null,
        tags: tags || {},
      }
    });

    return mediaFile.id;
  } catch (error) {
    console.error("Error registering media file:", error);
    throw new Error("Failed to register media file in registry.");
  }
}

/**
 * Helper to fetch a media URL by its ID.
 */
export async function getMediaUrl(id: string | bigint | null | undefined) {
  if (!id) return null;
  try {
    const media = await prisma.mediaFile.findUnique({
      where: { id: BigInt(id) },
      select: { fileUrl: true }
    });
    return media?.fileUrl || null;
  } catch (error) {
    return null;
  }
}

/**
 * Helper to delete media record and its physical file (TBD: physical deletion logic)
 */
export async function deleteMedia(id: string | bigint) {
  try {
    const mediaId = BigInt(id);
    const media = await prisma.mediaFile.findUnique({ where: { id: mediaId } });
    
    if (media) {
      // TODO: Logic for deleting from S3/Provider could go here
      await prisma.mediaFile.delete({ where: { id: mediaId } });
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting media record:", error);
    return false;
  }
}
