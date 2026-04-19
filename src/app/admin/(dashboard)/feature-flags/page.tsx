import prisma from "@/lib/db";
import FeatureFlagManager from "@/components/admin/FeatureFlagManager";

async function getFeatureFlags() {
  return await prisma.appFeatureFlag.findMany({
    orderBy: { moduleName: 'asc' }
  });
}

export default async function FeatureFlagsPage() {
  const flags = await getFeatureFlags();
  
  // Serialize flags for client component
  const serializedFlags = flags.map(flag => ({
    ...flag,
    id: flag.id.toString(),
  }));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-700">
      <FeatureFlagManager initialFlags={serializedFlags} />
    </div>
  );
}
