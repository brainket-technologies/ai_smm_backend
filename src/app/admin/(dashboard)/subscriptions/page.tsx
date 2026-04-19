import prisma from "@/lib/db";
import SubscriptionsManagementClient from "./SubscriptionsManagementClient";

export default async function SubscriptionsPage() {
  // 1. Fetch Tiers
  const tiersRaw = await prisma.subscriptionTier.findMany({
    orderBy: { priceAmount: 'asc' }
  });

  // 2. Fetch Permissions for all tiers
  const permissionsRaw = await prisma.subscriptionPermission.findMany();

  // 3. Fetch all active feature flags for the checklist using raw SQL
  const availableFeatures = await prisma.$queryRaw`
    SELECT module_name as "moduleName", feature_key as "featureKey" 
    FROM app_feature_flags 
    WHERE is_enabled = true 
    ORDER BY module_name ASC
  `;

  // 4. Fetch all active social platforms using raw SQL
  const activePlatformsRaw = await prisma.$queryRaw`
    SELECT name_key as id, name 
    FROM platforms 
    WHERE is_active = true 
    ORDER BY name ASC
  `;
  
  // 5. Map data for the client component
  const tiers = tiersRaw.map(tier => ({
    ...tier,
    id: tier.id.toString(),
    priceAmount: Number(tier.priceAmount || 0),
    permissions: permissionsRaw
      .filter(p => p.tierKey === tier.tierKey)
      .map(p => p.permissionKey)
  }));

  return (
    <div className="animate-in fade-in duration-700">
      <SubscriptionsManagementClient 
        initialTiers={tiers} 
        availableFeatures={availableFeatures as any} 
        availablePlatforms={activePlatformsRaw as any}
      />
    </div>
  );
}
