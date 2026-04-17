"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createStaticPage(formData: { title: string; slug: string; content: string; isActive: boolean }) {
  const { title, slug, content, isActive } = formData;
  
  await prisma.staticPage.create({
    data: {
      title,
      slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      content,
      isActive
    }
  });

  revalidatePath("/admin/pages");
}

export async function updateStaticPage(id: bigint, formData: { title: string; slug: string; content: string; isActive: boolean }) {
  const { title, slug, content, isActive } = formData;

  await prisma.staticPage.update({
    where: { id },
    data: {
      title,
      slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      content,
      isActive
    }
  });

  revalidatePath("/admin/pages");
}

export async function deleteStaticPage(id: bigint) {
  await prisma.staticPage.delete({
    where: { id }
  });

  revalidatePath("/admin/pages");
}

export async function togglePageStatus(id: bigint, isActive: boolean) {
  await prisma.staticPage.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath("/admin/pages");
}

export async function importStaticPages(data: any[]) {
    try {
        for (const item of data) {
            await prisma.staticPage.upsert({
                where: { slug: item.slug },
                update: {
                    title: item.title,
                    content: item.content,
                    isActive: item.isActive === 'true' || item.isActive === true
                },
                create: {
                    title: item.title,
                    slug: item.slug,
                    content: item.content,
                    isActive: item.isActive === 'true' || item.isActive === true
                }
            });
        }
        revalidatePath("/admin/pages");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Import failed.");
    }
}
