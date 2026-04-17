import prisma from "@/lib/db";
import SubscriptionManager from "@/components/admin/SubscriptionManager";

export default async function SubscriptionsPage() {
  // 1. Fetch Tiers
  const tiersRaw = await prisma.subscriptionTier.findMany({
    orderBy: { priceAmount: 'asc' }
  });

  // 2. Fetch Permissions for all tiers
  const permissionsRaw = await prisma.subscriptionPermission.findMany();

  // 3. Fetch all available feature flags for the checklist
  const availableFeatures = await prisma.appFeatureFlag.findMany({
    select: { moduleName: true, featureKey: true },
    orderBy: { moduleName: 'asc' }
  });

  // 4. Map data for the client component
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
      <SubscriptionManager 
        initialTiers={tiers} 
        availableFeatures={availableFeatures as any} 
      />
    </div>
  );
}
