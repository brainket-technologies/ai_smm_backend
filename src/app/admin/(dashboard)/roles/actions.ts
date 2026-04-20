"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRole(name: string) {
  try {
    const exists = await prisma.role.findFirst({ where: { name } });
    if (exists) return { success: false, error: "Role with this name already exists." };

    const role = await prisma.role.create({
      data: { name, isActive: true }
    });
    revalidatePath('/admin/roles');
    return { success: true, id: role.id.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRole(id: string, name: string) {
  try {
    const exists = await prisma.role.findFirst({ where: { name, NOT: { id: BigInt(id) } } });
    if (exists) return { success: false, error: "Another role with this name already exists." };

    await prisma.role.update({
      where: { id: BigInt(id) },
      data: { name }
    });
    revalidatePath('/admin/roles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRole(id: string) {
  try {
    // Check if role has assigned users
    const role = await prisma.role.findFirst({
      where: { id: BigInt(id) },
      include: { _count: { select: { users: true } } }
    });
    if (role && (role as any)._count.users > 0) {
      return { success: false, error: `Cannot delete: ${(role as any)._count.users} user(s) are assigned to this role. Deactivate it instead.` };
    }

    await prisma.role.delete({ where: { id: BigInt(id) } });
    revalidatePath('/admin/roles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleRoleStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.role.update({
      where: { id: BigInt(id) },
      data: { isActive: !currentStatus }
    });
    revalidatePath('/admin/roles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
