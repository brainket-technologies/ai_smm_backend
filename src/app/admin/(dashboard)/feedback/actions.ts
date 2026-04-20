"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFeedbacks() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        message: true,
        rating: true,
        status: true,
        createdAt: true,
        user: {
           select: {
              id: true,
              name: true,
              email: true,
              profileMedia: { select: { fileUrl: true } }
           }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return {
      success: true,
      data: feedbacks.map(f => ({
        ...f,
        id: f.id.toString(),
        createdAt: f.createdAt ? f.createdAt.toISOString() : new Date().toISOString()
      }))
    };
  } catch (error: any) {
    console.error("Fetch Feedback Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFeedbackStatus(id: string, status: string) {
  try {
    await prisma.feedback.update({
      where: { id: BigInt(id) },
      data: { status }
    });
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFeedback(id: string) {
  try {
    await prisma.feedback.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
