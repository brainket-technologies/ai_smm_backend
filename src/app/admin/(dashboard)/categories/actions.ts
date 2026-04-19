"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// UPSERT CATEGORY
export async function upsertCategory(data: any) {
  try {
    const { id, name, type } = data;
    
    if (id) {
      await prisma.category.update({
        where: { id: BigInt(id) },
        data: { name, type }
      });
    } else {
      await prisma.category.create({
        data: { name, type }
      });
    }

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'A category with this name already exists in this type.' };
    }
    return { success: false, error: error.message };
  }
}

// DELETE CATEGORY
export async function deleteCategory(id: string) {
  try {
    // Delete related subcategories first (Cascade simulation if DB doesn't handle it)
    await prisma.subCategory.deleteMany({
      where: { categoryId: BigInt(id) }
    });

    await prisma.category.delete({
      where: { id: BigInt(id) }
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// UPSERT SUBCATEGORY
export async function upsertSubcategory(data: any) {
  try {
    const { id, categoryId, name, type } = data;
    
    if (id) {
      await prisma.subCategory.update({
        where: { id: BigInt(id) },
        data: { name, categoryId: BigInt(categoryId), type }
      });
    } else {
      await prisma.subCategory.create({
        data: { name, categoryId: BigInt(categoryId), type }
      });
    }

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'This subcategory already exists under the parent category.' };
    }
    return { success: false, error: error.message };
  }
}

// DELETE SUBCATEGORY
export async function deleteSubcategory(id: string) {
  try {
    await prisma.subCategory.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// TOGGLE CATEGORY STATUS
export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  try {
    const newStatus = !currentStatus;
    await prisma.category.update({
      where: { id: BigInt(id) },
      data: { isActive: newStatus }
    });
    
    // Automatically cascade the status mathematically to all child subcategories
    if (newStatus === false) {
      await prisma.subCategory.updateMany({
        where: { categoryId: BigInt(id) },
        data: { isActive: false }
      });
    }

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// TOGGLE SUBCATEGORY STATUS
export async function toggleSubcategoryStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.subCategory.update({
      where: { id: BigInt(id) },
      data: { isActive: !currentStatus }
    });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
