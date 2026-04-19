"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    const formattedData = {
      ...data,
      isDefault: Boolean(data.isDefault),
      isActive: Boolean(data.isActive)
    };

    if (id) {
      await prisma.$executeRaw`
        UPDATE app_themes 
        SET name = ${data.name}, 
            primary_color = ${data.primaryColor}, 
            secondary_color = ${data.secondaryColor},
            dark_primary_color = ${data.darkPrimaryColor},
            dark_secondary_color = ${data.darkSecondaryColor},
            is_active = ${data.isActive},
            is_default = ${data.isDefault}
        WHERE id = ${BigInt(id)}
      `;
    } else {
      await prisma.appTheme.create({ data: formattedData });
    }
    revalidatePath("/admin/themes");
    return { success: true };
  } catch (error: any) {
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
            await prisma.appTheme.create({
                data: {
                    name: item.name,
                    primaryColor: item.primaryColor,
                    secondaryColor: item.secondaryColor,
                    darkPrimaryColor: item.darkPrimaryColor,
                    darkSecondaryColor: item.darkSecondaryColor,
                    isDefault: item.isDefault === 'true' || item.isDefault === true,
                    isActive: true
                }
            });
        }
        revalidatePath("/admin/themes");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Import failed.");
    }
}
