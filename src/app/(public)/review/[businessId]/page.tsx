import React from 'react';
import prisma from "@/lib/prisma";
import ReviewForm from "./ReviewForm";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function BusinessReviewPage({ params }: { params: { businessId: string } }) {
  const { businessId } = params;
  console.log(`[ReviewPage] Fetching business for ID: ${businessId}`);

  // Fetch Business details and GMB social account
  let business;
  try {
    business = await prisma.business.findUnique({
      where: { id: BigInt(businessId) },
      include: {
        media: true,
        socialAccounts: {
          where: {
            platform: {
              nameKey: 'gmb'
            },
            isActive: true
          }
        }
      }
    });
  } catch (error) {
    console.error(`[ReviewPage] Error fetching business ${businessId}:`, error);
    return notFound();
  }

  if (!business) {
    console.log(`[ReviewPage] Business NOT found for ID: ${businessId}`);
    return notFound();
  }
  
  console.log(`[ReviewPage] Found business: ${business.name}`);

  // Construct GMB Review Link if account exists
  // Assuming the Review Link is stored in accountName or we can construct it if we have the placeId
  // For now, let's look for a link in the account details
  const gmbAccount = business.socialAccounts[0];
  const gmbReviewLink = gmbAccount?.pageId ? `https://search.google.com/local/writereview?placeid=${gmbAccount.pageId}` : null;

  // Fetch App Config for App Name and Logo
  const appConfig = await prisma.appConfig.findFirst();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-10 px-4 font-sans">
      {/* App Header */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          {appConfig?.appName || 'Social Suite'}
        </h1>
        <div className="h-1 w-10 bg-blue-600 rounded-full mt-1" />
      </div>

      {/* Business Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 mb-6">
        <div className="flex flex-col items-center text-center">
          {business.media?.fileUrl ? (
            <div className="h-20 w-20 rounded-2xl overflow-hidden mb-4 border-2 border-white dark:border-slate-800 shadow-lg relative">
              <Image 
                src={business.media.fileUrl} 
                alt={business.name} 
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800">
               <span className="text-2xl font-black text-blue-600 uppercase">{business.name.substring(0, 2)}</span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{business.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{business.tagline || 'Rate your experience with us'}</p>
        </div>

        <div className="mt-8">
          <ReviewForm 
            businessId={businessId} 
            businessName={business.name}
            gmbReviewLink={gmbReviewLink}
          />
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-400 font-medium">Powered by {appConfig?.appName || 'Social Suite'}</p>
    </div>
  );
}
