 "use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { registerMedia } from "@/lib/media";

export async function getPlatforms() {
  try {
    const platforms = await prisma.platform.findMany({
      include: {
        media: {
          select: { fileUrl: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return platforms.map(p => ({
      ...p,
      id: p.id.toString(),
      mediaId: p.mediaId?.toString() || null,
      logo: p.media?.fileUrl || null,
    }));
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    return [];
  }
}

export async function togglePlatformStatus(id: string, isActive: boolean) {
  try {
    await prisma.platform.update({
      where: { id: BigInt(id) },
      data: { isActive }
    });
    revalidatePath("/admin/platforms");
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update status");
  }
}

export async function deletePlatform(id: string) {
  try {
    await prisma.platform.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath("/admin/platforms");
    return { success: true };
  } catch (error) {
    throw new Error("Failed to delete platform");
  }
}

export async function upsertPlatform(id: string | null, data: {
  name: string;
  logo?: string;
  url?: string;
  nameKey?: string;
  isActive: boolean;
  appId?: string;
  appSecret?: string;
  clientToken?: string;
}) {
  try {
    const { name, logo, url, nameKey, isActive, appId, appSecret, clientToken } = data;
    let mediaId: bigint | null = null;

    // Handle logo registration if it's a string URL
    if (logo && logo.startsWith('http')) {
      mediaId = await registerMedia({
        fileUrl: logo,
        fileType: 'image',
        mediaCategory: 'logo',
        relatedType: 'platform'
      });
    }

    const payload: any = {
      name,
      url,
      nameKey,
      isActive,
      appId,
      appSecret,
      clientToken,
    };
    
    if (mediaId) {
      payload.mediaId = mediaId;
    }

    if (id) {
      await prisma.platform.update({
        where: { id: BigInt(id) },
        data: payload
      });
    } else {
      await prisma.platform.create({
        data: payload
      });
    }
    revalidatePath("/admin/platforms");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to save platform");
  }
}

export async function importPlatforms(data: any[]) {
    try {
        for (const item of data) {
            let mediaId: bigint | null = null;
            if (item.logo && item.logo.startsWith('http')) {
              mediaId = await registerMedia({
                fileUrl: item.logo,
                fileType: 'image',
                mediaCategory: 'logo',
                relatedType: 'platform'
              });
            }

            const payload: any = {
              url: item.url,
              nameKey: item.nameKey,
              isActive: item.isActive === 'true' || item.isActive === true
            };

            if (mediaId) {
              payload.mediaId = mediaId;
            }

            await prisma.platform.upsert({
                where: { name: item.name },
                update: payload,
                create: {
                    ...payload,
                    name: item.name,
                }
            });
        }
        revalidatePath("/admin/platforms");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Import failed.");
    }
}
