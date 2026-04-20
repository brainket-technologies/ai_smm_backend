import prisma from "@/lib/prisma";
import PlatformsManagementClient from "./PlatformsManagementClient";

async function getPlatforms() {
  return await prisma.platform.findMany({
    orderBy: { name: 'asc' }
  });
}

export default async function PlatformsPage() {
  const platforms = await getPlatforms();

  // Convert BigInt to string for client component serialization
  const serializablePlatforms = platforms.map(p => ({
    ...p,
    id: p.id.toString(),
  }));

  return <PlatformsManagementClient initialPlatforms={serializablePlatforms} />;
}
