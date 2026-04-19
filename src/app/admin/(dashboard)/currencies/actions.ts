"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertCurrency(id: string | null, data: {
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  status: boolean;
  isDefault: boolean;
}) {
  try {
    if (data.isDefault) {
      await prisma.currency.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    if (id) {
      await prisma.currency.update({
        where: { id: BigInt(id) },
        data: { ...data }
      });
    } else {
      await prisma.currency.create({
        data: { ...data }
      });
    }
    revalidatePath("/admin/currencies");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to save currency.");
  }
}

export async function deleteCurrency(id: string) {
  const curr = await prisma.currency.findUnique({ where: { id: BigInt(id) } });
  if (curr?.isDefault) {
    throw new Error("Cannot delete the default currency.");
  }

  await prisma.currency.delete({ where: { id: BigInt(id) } });
  revalidatePath("/admin/currencies");
  return { success: true };
}

export async function setDefaultCurrency(id: string) {
  await prisma.$transaction([
    prisma.currency.updateMany({
      where: { isDefault: true },
      data: { isDefault: false }
    }),
    prisma.currency.update({
      where: { id: BigInt(id) },
      data: { isDefault: true, status: true }
    })
  ]);

  revalidatePath("/admin/currencies");
  return { success: true };
}

export async function toggleCurrencyStatus(id: string, status: boolean) {
  if (!status) {
    const curr = await prisma.currency.findUnique({ where: { id: BigInt(id) } });
    if (curr?.isDefault) {
      throw new Error("Cannot deactivate the default currency.");
    }
  }

  await prisma.currency.update({
    where: { id: BigInt(id) },
    data: { status },
  });

  revalidatePath("/admin/currencies");
  return { success: true };
}

export async function importCurrencies(data: any[]) {
    try {
        for (const item of data) {
            await prisma.currency.upsert({
                where: { code: item.code },
                update: {
                    name: item.name,
                    symbol: item.symbol,
                    exchangeRate: parseFloat(item.exchangeRate),
                    status: item.status === 'true' || item.status === true,
                    isDefault: item.isDefault === 'true' || item.isDefault === true
                },
                create: {
                    name: item.name,
                    code: item.code,
                    symbol: item.symbol,
                    exchangeRate: parseFloat(item.exchangeRate),
                    status: item.status === 'true' || item.status === true,
                    isDefault: item.isDefault === 'true' || item.isDefault === true
                }
            });
        }
        revalidatePath("/admin/currencies");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Import failed.");
    }
}
