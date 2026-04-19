"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPlatformUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          name: "User"
        },
        isDeleted: false
      },
      include: {
        role: true,
        media: {
          select: { fileUrl: true }
        },
        userSubscriptions: {
          where: {
            status: "active"
          },
          take: 1
        },
        _count: {
          select: {
             businesses: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      success: true,
      data: users.map(u => ({
        ...u,
        id: u.id.toString(),
        createdAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString(),
        image: u.media?.fileUrl || null, // Map back to 'image' for frontend compatibility
        businessCount: u._count.businesses,
        subscription: u.userSubscriptions?.[0]?.tierKey || "Free Trial"
      }))
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function toggleUserVerification(id: string, currentStatus: boolean) {
  try {
    await prisma.user.update({
      where: { id: BigInt(id) },
      data: { isVerified: !currentStatus }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update verification status" };
  }
}

export async function deleteUser(id: string) {
  try {
    // Soft delete
    await prisma.user.update({
      where: { id: BigInt(id) },
      data: { isDeleted: true }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user" };
  }
}
