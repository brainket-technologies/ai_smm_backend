"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAIPrompts() {
  try {
    const prompts = await prisma.aIPrompt.findMany({
      orderBy: { moduleName: 'asc' }
    });
    return {
      success: true,
      data: prompts.map(p => ({
        ...p,
        id: p.id.toString(),
        createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
      }))
    };
  } catch (error) {
    console.error("Error fetching AI prompts:", error);
    return { success: false, error: "Failed to fetch AI prompts" };
  }
}

export async function upsertAIPrompt(data: any) {
  try {
    const { id, ...payload } = data;
    
    const formattedPayload = {
      ...payload,
      version: payload.version ? parseInt(payload.version) : 1,
      isActive: payload.isActive ?? true
    };

    if (id) {
      await prisma.aIPrompt.update({
        where: { id: BigInt(id) },
        data: {
            ...formattedPayload,
            updatedAt: new Date()
        }
      });
    } else {
      await prisma.aIPrompt.create({
        data: formattedPayload
      });
    }

    revalidatePath("/admin/ai-prompts");
    return { success: true };
  } catch (error: any) {
    console.error("Error upserting AI prompt:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Prompt Key must be unique." };
    }
    return { success: false, error: "Failed to save AI prompt" };
  }
}

export async function togglePromptStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.aIPrompt.update({
      where: { id: BigInt(id) },
      data: { isActive: !currentStatus }
    });
    revalidatePath("/admin/ai-prompts");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteAIPrompt(id: string) {
  try {
    await prisma.aIPrompt.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath("/admin/ai-prompts");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete AI prompt" };
  }
}
