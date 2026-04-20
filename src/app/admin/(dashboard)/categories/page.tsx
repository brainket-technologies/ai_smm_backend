import React from 'react';
import prisma from "@/lib/prisma";
import CategoriesManagementClient from "./CategoriesManagementClient";

export default async function CategoriesPage() {
  const categoriesRaw = await prisma.category.findMany({
    include: {
      subCategories: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Serialize BigInts to strings
  const categories = categoriesRaw.map(cat => ({
    ...cat,
    id: cat.id.toString(),
    subCategories: cat.subCategories.map(sub => ({
      ...sub,
      id: sub.id.toString(),
      categoryId: sub.categoryId.toString(),
      createdAt: sub.createdAt?.toISOString() || null
    }))
  }));

  return (
    <div className="animate-in fade-in duration-700">
      <CategoriesManagementClient initialCategories={categories} />
    </div>
  );
}
