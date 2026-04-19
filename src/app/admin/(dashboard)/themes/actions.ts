 "use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { registerMedia } from "@/lib/media";

// Workaround for Prisma Client sync issues: Using Raw SQL for reliability
export async function updateThemeStatus(id: string, status: boolean) {
  try {
    const themeId = BigInt(id);
    
    // Check if it's the default theme first (using standard query)
    const theme = await prisma.appTheme.findUnique({ 
      where: { id: themeId },
      select: { isDefault: true } 
    });
    
    if (!status && theme?.isDefault) {
      throw new Error("Cannot deactivate the system default theme.");
    }

    // Using explicit boolean evaluation format with RAW SQL 
    // to bypass Prisma Client out-of-date schema cache
    if (status) {
        await prisma.$executeRaw`UPDATE app_themes SET is_active = true WHERE id = ${themeId}`;
    } else {
        await prisma.$executeRaw`UPDATE app_themes SET is_active = false WHERE id = ${themeId}`;
    }

    revalidatePath("/admin/themes");
    return { success: true };
  } catch (error: any) {
    console.error("Theme Status Error (Raw):", error);
    throw new Error(error.message || "Could not update status.");
  }
}

export async function setThemeAsDefault(id: string) {
  try {
    const themeId = BigInt(id);
    
    // Using transaction with raw SQL for absolute reliability against outdated Prisma Client caches
    await prisma.$transaction([
      prisma.$executeRaw`UPDATE app_themes SET is_default = false WHERE is_default = true`,
      prisma.$executeRaw`UPDATE app_themes SET is_default = true, is_active = true WHERE id = ${themeId}`
    ]);

    revalidatePath("/admin/themes");
    return { success: true };
  } catch (error: any) {
    console.error("Theme Default Error:", error);
    throw new Error("Could not set default theme.");
  }
}

// Standard Prisma logic for non-problematic fields/models
export async function upsertTheme(id: string | null, data: any) {
  try {
    let mediaId: bigint | null = null;
    if (data.image && typeof data.image === 'string' && data.image.startsWith('http')) {
      mediaId = await registerMedia({
        fileUrl: data.image,
        fileType: 'image',
        mediaCategory: 'theme',
        relatedType: 'app_theme'
      });
    }

    if (id) {
      const themeId = BigInt(id);
      
      // Using Raw SQL for updates to ensure schema sync reliability
      if (mediaId) {
        await prisma.$executeRaw`
          UPDATE app_themes 
          SET name = ${data.name}, 
              primary_color = ${data.primaryColor}, 
              secondary_color = ${data.secondaryColor},
              dark_primary_color = ${data.darkPrimaryColor},
              dark_secondary_color = ${data.darkSecondaryColor},
              is_active = ${Boolean(data.isActive)},
              is_default = ${Boolean(data.isDefault)},
              media_id = ${mediaId}
          WHERE id = ${themeId}
        `;
      } else {
        await prisma.$executeRaw`
          UPDATE app_themes 
          SET name = ${data.name}, 
              primary_color = ${data.primaryColor}, 
              secondary_color = ${data.secondaryColor},
              dark_primary_color = ${data.darkPrimaryColor},
              dark_secondary_color = ${data.darkSecondaryColor},
              is_active = ${Boolean(data.isActive)},
              is_default = ${Boolean(data.isDefault)}
          WHERE id = ${themeId}
        `;
      }
    } else {
      const payload = {
        name: data.name,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        darkPrimaryColor: data.darkPrimaryColor,
        darkSecondaryColor: data.darkSecondaryColor,
        isActive: Boolean(data.isActive),
        isDefault: Boolean(data.isDefault),
        mediaId: mediaId
      };
      await prisma.appTheme.create({ data: payload });
    }
    revalidatePath("/admin/themes");
    return { success: true };
  } catch (error: any) {
    console.error("Upsert Theme Error:", error);
    throw new Error(error.message || "Failed to save theme.");
  }
}

export async function deleteTheme(id: string) {
  try {
    await prisma.$executeRaw`DELETE FROM app_themes WHERE id = ${BigInt(id)} AND is_default = false`;
    revalidatePath("/admin/themes");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete theme.");
  }
}

// Aliases for modern UI
export const toggleThemeStatus = updateThemeStatus;
export const setDefaultTheme = setThemeAsDefault;
export const markThemeAsPrimary = setThemeAsDefault;

export async function importThemes(data: any[]) {
    try {
        for (const item of data) {
            let mediaId: bigint | null = null;
            if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) {
              mediaId = await registerMedia({
                fileUrl: item.image,
                fileType: 'image',
                mediaCategory: 'theme',
                relatedType: 'app_theme'
              });
            }

            await prisma.appTheme.create({
                data: {
                    name: item.name,
                    primaryColor: item.primaryColor,
                    secondaryColor: item.secondaryColor,
                    darkPrimaryColor: item.darkPrimaryColor,
                    darkSecondaryColor: item.darkSecondaryColor,
                    isDefault: item.isDefault === 'true' || item.isDefault === true,
                    isActive: true,
                    mediaId: mediaId
                }
            });
        }
        revalidatePath("/admin/themes");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Import failed.");
    }
}
