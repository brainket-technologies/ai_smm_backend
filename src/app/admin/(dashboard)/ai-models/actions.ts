"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAIModels() {
  try {
    const models = await prisma.aIModel.findMany({
      orderBy: { provider: 'asc' }
    });
    return {
      success: true,
      data: models.map(m => ({
        ...m,
        id: m.id.toString(),
        apiKey: m.apiKey || "",
        inputCostPer1k: m.inputCostPer1k ? Number(m.inputCostPer1k) : 0,
        outputCostPer1k: m.outputCostPer1k ? Number(m.outputCostPer1k) : 0,
        createdAt: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
      }))
    };
  } catch (error) {
    console.error("Error fetching AI models:", error);
    return { success: false, error: "Failed to fetch AI models" };
  }
}

export async function upsertAIModel(data: any) {
  try {
    const { id, ...payload } = data;
    
    // Ensure numeric fields are correctly typed
    const formattedPayload = {
      ...payload,
      contextWindow: payload.contextWindow ? parseInt(payload.contextWindow) : null,
      maxTokens: payload.maxTokens ? parseInt(payload.maxTokens) : null,
      inputCostPer1k: payload.inputCostPer1k ? parseFloat(payload.inputCostPer1k) : 0,
      outputCostPer1k: payload.outputCostPer1k ? parseFloat(payload.outputCostPer1k) : 0,
    };

    if (id) {
      await prisma.aIModel.update({
        where: { id: BigInt(id) },
        data: formattedPayload
      });
    } else {
      await prisma.aIModel.create({
        data: formattedPayload
      });
    }

    revalidatePath("/admin/ai-models");
    return { success: true };
  } catch (error: any) {
    console.error("Error upserting AI model:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Model Key must be unique." };
    }
    return { success: false, error: "Failed to save AI model" };
  }
}

export async function toggleModelStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.aIModel.update({
      where: { id: BigInt(id) },
      data: { isActive: !currentStatus }
    });
    revalidatePath("/admin/ai-models");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteAIModel(id: string) {
  try {
    await prisma.aIModel.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath("/admin/ai-models");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete AI model" };
  }
}
