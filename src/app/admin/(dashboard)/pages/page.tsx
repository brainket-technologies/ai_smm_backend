import prisma from "@/lib/prisma";
import PagesManagementClient from "./PagesManagementClient";

async function getPages() {
  return await prisma.staticPage.findMany({
    orderBy: { updatedAt: 'desc' }
  });
}

export default async function PagesManagement() {
  const pages = await getPages();

  // Convert BigInt to Number/String for client component serialization
  const serializablePages = pages.map(p => ({
    ...p,
    id: p.id.toString(), // Convert BigInt to string
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <PagesManagementClient initialPages={serializablePages} />;
}
