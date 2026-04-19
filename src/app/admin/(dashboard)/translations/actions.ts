 "use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { registerMedia } from "@/lib/media";

export async function getLanguages() {
  try {
    const langs = await prisma.appTranslation.findMany({
      include: {
        media: {
          select: { fileUrl: true }
        }
      },
      orderBy: { isDefault: 'desc' }
    });

    return langs.map(l => ({
      ...l,
      id: l.id.toString(),
      flagUrl: l.media?.fileUrl || null, // Map back for frontend compatibility
    }));
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    return [];
  }
}

export async function upsertLanguage(id: string | null, data: {
  displayName: string;
  languageCode: string;
  countryCode: string;
  flagUrl: string;
  isActive: boolean;
  isDefault: boolean;
}) {
  try {
    const { displayName, languageCode, countryCode, flagUrl, isActive, isDefault } = data;

    // If setting as default, unset others first
    if (isDefault) {
      await prisma.appTranslation.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    let mediaId: bigint | null = null;
    if (flagUrl && flagUrl.startsWith('http')) {
      mediaId = await registerMedia({
        fileUrl: flagUrl,
        fileType: 'image',
        mediaCategory: 'flag',
        relatedType: 'app_translation'
      });
    }

    const payload: any = {
      displayName,
      languageCode,
      countryCode,
      isActive,
      isDefault,
      updatedAt: new Date()
    };

    if (mediaId) {
      payload.mediaId = mediaId;
    }

    if (id) {
      await prisma.appTranslation.update({
        where: { id: BigInt(id) },
        data: payload
      });
    } else {
      await prisma.appTranslation.create({
        data: {
          ...payload,
          translations: {} // Initialize with empty translations
        }
      });
    }
    revalidatePath("/admin/translations");
    return { success: true };
  } catch (error: any) {
    console.error("Language upsert error:", error);
    throw new Error(error.message || "Failed to save language.");
  }
}

export async function deleteLanguage(id: string) {
  try {
    const lang = await prisma.appTranslation.findUnique({ where: { id: BigInt(id) } });
    if (lang?.isDefault) {
      throw new Error("Cannot delete the default language.");
    }
    await prisma.appTranslation.delete({ where: { id: BigInt(id) } });
    revalidatePath("/admin/translations");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete language.");
  }
}

export async function toggleLanguageStatus(id: string, isActive: boolean) {
  try {
    const langId = BigInt(id);
    const lang = await prisma.appTranslation.findUnique({ 
      where: { id: langId },
      select: { isDefault: true } 
    });
    
    if (!isActive && lang?.isDefault) {
      throw new Error("Cannot deactivate the system default language.");
    }

    await prisma.appTranslation.update({
      where: { id: langId },
      data: { isActive }
    });
    revalidatePath("/admin/translations");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to update status.");
  }
}

export async function setDefaultLanguage(id: string) {
  try {
    await prisma.$transaction([
      prisma.appTranslation.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      }),
      prisma.appTranslation.update({
        where: { id: BigInt(id) },
        data: { isDefault: true, isActive: true }
      })
    ]);
    revalidatePath("/admin/translations");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to set default language.");
  }
}

export async function importLanguages(data: any[]) {
    try {
        for (const item of data) {
            let mediaId: bigint | null = null;
            if (item.flagUrl && item.flagUrl.startsWith('http')) {
              mediaId = await registerMedia({
                fileUrl: item.flagUrl,
                fileType: 'image',
                mediaCategory: 'flag',
                relatedType: 'app_translation'
              });
            }

            const payload: any = {
                displayName: item.displayName,
                countryCode: item.countryCode,
                isActive: item.isActive === 'true' || item.isActive === true,
                isDefault: item.isDefault === 'true' || item.isDefault === true
            };

            if (mediaId) {
              payload.mediaId = mediaId;
            }

            await prisma.appTranslation.upsert({
                where: { languageCode: item.languageCode },
                update: payload,
                create: {
                    ...payload,
                    languageCode: item.languageCode,
                    translations: {}
                }
            });
        }
        revalidatePath("/admin/translations");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Import failed.");
    }
}
