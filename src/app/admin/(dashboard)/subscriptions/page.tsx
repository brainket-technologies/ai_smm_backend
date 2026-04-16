import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreditCard, Plus, Check, X, Shield, Star, Rocket } from "lucide-react";

async function getTiers() {
  return await prisma.subscriptionTier.findMany({
    orderBy: { priceAmount: 'asc' }
  });
}

export default async function SubscriptionsPage() {
  const tiers = await getTiers();

  const getTierIcon = (key: string) => {
    if (key.includes('free')) return <Shield className="h-6 w-6 text-slate-400" />;
    if (key.includes('pro')) return <Star className="h-6 w-6 text-blue-500" />;
    return <Rocket className="h-6 w-6 text-purple-500" />;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Tiers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Configure pricing plans, limits, and feature permissions for your users.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
          <Plus className="h-5 w-5" />
          <span>Create Tier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div key={tier.id.toString()} className="bg-[var(--card-background)] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col">
            {!tier.isActive && (
              <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                Paused
              </div>
            )}
            
            <div className="mb-8">
               <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm">
                  {getTierIcon(tier.tierKey.toLowerCase())}
               </div>
               <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm truncate uppercase tracking-widest font-bold text-[10px]">
                 {tier.tierKey}
               </p>
            </div>

            <div className="mb-8">
               <div className="flex items-baseline">
                  <span className="text-4xl font-black">${tier.priceAmount?.toString()}</span>
                  <span className="text-gray-400 font-medium ml-1">/{tier.pricePeriod}</span>
               </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Included Features</div>
               <div className="space-y-3">
                  {/* We would parse highlight_features JSON here */}
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span>AI Content Generation</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span>Business Management</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <X className="h-4 w-4 text-red-300 mr-3" />
                    <span>Priority Support</span>
                  </div>
               </div>
            </div>

            <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all">
              Manage Tier
            </button>
          </div>
        ))}

        {tiers.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
             <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
             <p className="text-gray-400 italic">No subscription tiers configured. Seeding may be required.</p>
          </div>
        )}
      </div>
    </div>
  );
}
