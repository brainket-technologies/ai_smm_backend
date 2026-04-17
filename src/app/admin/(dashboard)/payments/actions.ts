"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPaymentMethods() {
  try {
    return await prisma.paymentMethod.findMany({
      orderBy: { isDefault: 'desc' }
    });
  } catch (error) {
    console.error("Failed to fetch payment methods:", error);
    return [];
  }
}

export async function togglePaymentStatus(id: bigint, isActive: boolean) {
  try {
    await prisma.paymentMethod.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update status");
  }
}

export async function setDefaultPayment(id: bigint) {
  try {
    await prisma.paymentMethod.updateMany({
      data: { isDefault: false }
    });
    
    await prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true, isActive: true }
    });
    
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error) {
    throw new Error("Failed to set default payment method");
  }
}

export async function deletePaymentMethod(id: bigint) {
  try {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    });
    
    if (paymentMethod?.isDefault) {
      throw new Error("Cannot delete the default payment method");
    }
    
    await prisma.paymentMethod.delete({
      where: { id }
    });
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete payment method");
  }
}

export async function upsertPaymentMethod(id: bigint | null, data: {
  name: string;
  displayName: string;
  type: string;
  mode?: string;
  image?: string;
  isActive: boolean;
  isDefault: boolean;
  config?: any;
}) {
  try {
    if (data.isDefault) {
      await prisma.paymentMethod.updateMany({
        data: { isDefault: false }
      });
    }

    if (id) {
      await prisma.paymentMethod.update({
        where: { id },
        data
      });
    } else {
      await prisma.paymentMethod.create({
        data
      });
    }
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to save payment method");
  }
}

export async function importPayments(data: any[]) {
    try {
        for (const item of data) {
            await prisma.paymentMethod.upsert({
                where: { name: item.name },
                update: {
                    displayName: item.displayName,
                    type: item.type,
                    mode: item.mode,
                    image: item.image,
                    isActive: item.isActive === 'true' || item.isActive === true,
                    isDefault: item.isDefault === 'true' || item.isDefault === true
                },
                create: {
                    name: item.name,
                    displayName: item.displayName,
                    type: item.type,
                    mode: item.mode,
                    image: item.image,
                    isActive: item.isActive === 'true' || item.isActive === true,
                    isDefault: item.isDefault === 'true' || item.isDefault === true,
                    config: {}
                }
            });
        }
        revalidatePath("/admin/payments");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Import failed.");
    }
}
