"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type TargetModelParam = "targetRegion" | "targetAgeGroup" | "modelEthnicity" | "cTAButton" | "audienceType";

function getModelDelegate(modelName: TargetModelParam) {
  switch (modelName) {
    case "targetRegion": return prisma.targetRegion;
    case "targetAgeGroup": return prisma.targetAgeGroup;
    case "modelEthnicity": return prisma.modelEthnicity;
    case "cTAButton": return prisma.cTAButton;
    case "audienceType": return prisma.audienceType;
    default: throw new Error(`Invalid model name: ${modelName}`);
  }
}

// UPSERT TARGET (Create/Update)
export async function upsertTarget(modelName: TargetModelParam, id: string | null, name: string) {
  try {
    const delegate = getModelDelegate(modelName) as any;
    
    if (id) {
      await delegate.update({
        where: { id: BigInt(id) },
        data: { name }
      });
    } else {
      await delegate.create({
        data: { name, isActive: true }
      });
    }
    
    revalidatePath('/admin/targeting');
    return { success: true };
  } catch (error: any) {
    console.error(`Error in upsertTarget [${modelName}]:`, error);
    return { success: false, error: error.message };
  }
}

// DELETE TARGET
export async function deleteTarget(modelName: TargetModelParam, id: string) {
  try {
    const delegate = getModelDelegate(modelName) as any;
    
    await delegate.delete({
      where: { id: BigInt(id) }
    });
    
    revalidatePath('/admin/targeting');
    return { success: true };
  } catch (error: any) {
    console.error(`Error in deleteTarget [${modelName}]:`, error);
    // Common error handling if tied to businesses
    if (error.code === 'P2003') {
      return { success: false, error: "Cannot delete this target because it is referenced by active business records. Please turn it off instead." };
    }
    return { success: false, error: error.message };
  }
}

// TOGGLE TARGET STATUS
export async function toggleTargetStatus(modelName: TargetModelParam, id: string, currentStatus: boolean) {
  try {
    const delegate = getModelDelegate(modelName) as any;
    
    await delegate.update({
      where: { id: BigInt(id) },
      data: { isActive: !currentStatus }
    });
    
    revalidatePath('/admin/targeting');
    return { success: true };
  } catch (error: any) {
    console.error(`Error in toggleTargetStatus [${modelName}]:`, error);
    return { success: false, error: error.message };
  }
}
