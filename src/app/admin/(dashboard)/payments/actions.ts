 "use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { registerMedia } from "@/lib/media";

export async function getPaymentMethods() {
  try {
    const methods = await prisma.paymentMethod.findMany({
      include: {
        media: {
          select: { fileUrl: true }
        }
      },
      orderBy: { isDefault: 'desc' }
    });

    return methods.map(m => ({
      ...m,
      id: m.id.toString(),
      image: m.media?.fileUrl || null, // Map back to 'image' for frontend compatibility
    }));
  } catch (error) {
    console.error("Failed to fetch payment methods:", error);
    return [];
  }
}

export async function togglePaymentStatus(id: string, isActive: boolean) {
  try {
    await prisma.paymentMethod.update({
      where: { id: BigInt(id) },
      data: { isActive }
    });
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update status");
  }
}

export async function setDefaultPayment(id: string) {
  try {
    await prisma.paymentMethod.updateMany({
      data: { isDefault: false }
    });
    
    await prisma.paymentMethod.update({
      where: { id: BigInt(id) },
      data: { isDefault: true, isActive: true }
    });
    
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error) {
    throw new Error("Failed to set default payment method");
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: BigInt(id) }
    });
    
    if (paymentMethod?.isDefault) {
      throw new Error("Cannot delete the default payment method");
    }
    
    await prisma.paymentMethod.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete payment method");
  }
}

export async function upsertPaymentMethod(id: string | null, data: {
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
    const { name, displayName, type, mode, image, isActive, isDefault, config } = data;
    
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        data: { isDefault: false }
      });
    }

    let mediaId: bigint | null = null;
    if (image && image.startsWith('http')) {
      mediaId = await registerMedia({
        fileUrl: image,
        fileType: 'image',
        mediaCategory: 'logo',
        relatedType: 'payment_method'
      });
    }

    const payload: any = {
      name,
      displayName,
      type,
      mode,
      isActive,
      isDefault,
      config: config || {}
    };

    if (mediaId) {
      payload.mediaId = mediaId;
    }

    if (id) {
      await prisma.paymentMethod.update({
        where: { id: BigInt(id) },
        data: payload
      });
    } else {
      await prisma.paymentMethod.create({
        data: payload
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
            let mediaId: bigint | null = null;
            if (item.image && item.image.startsWith('http')) {
              mediaId = await registerMedia({
                fileUrl: item.image,
                fileType: 'image',
                mediaCategory: 'logo',
                relatedType: 'payment_method'
              });
            }

            const payload: any = {
                displayName: item.displayName,
                type: item.type,
                mode: item.mode,
                isActive: item.isActive === 'true' || item.isActive === true,
                isDefault: item.isDefault === 'true' || item.isDefault === true
            };

            if (mediaId) {
              payload.mediaId = mediaId;
            }

            await prisma.paymentMethod.upsert({
                where: { name: item.name },
                update: payload,
                create: {
                    ...payload,
                    name: item.name,
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
