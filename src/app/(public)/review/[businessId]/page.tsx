import React from 'react';
import prisma from "@/lib/prisma";
import ReviewForm from "./ReviewForm";
import BusinessLogo from "./BusinessLogo";
import { notFound } from "next/navigation";

export default async function BusinessReviewPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  console.log(`[ReviewPage] Fetching business for ID: ${businessId}`);

  // Fetch Business details and GMB social account
  let business;
  try {
    business = await prisma.business.findUnique({
      where: { id: BigInt(businessId) },
      include: {
        media: true,
        mediaFiles: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
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

  // Use primary logo (mediaId) or fallback to latest uploaded logo from mediaFiles relation
  let logoUrl: string | undefined = business.media?.fileUrl || business.mediaFiles[0]?.fileUrl;

  // Final fallback: double check media_files table directly for any image linked to this businessId
  if (!logoUrl) {
    const fallbackMedia = await prisma.mediaFile.findFirst({
      where: { businessId: BigInt(businessId) },
      orderBy: { createdAt: 'desc' }
    });
    logoUrl = fallbackMedia?.fileUrl;
  }
  
  console.log(`[ReviewPage] Found business: ${business.name}, Logo: ${logoUrl ? 'Yes' : 'No'}`);
  if (logoUrl) console.log(`[ReviewPage] Logo URL: ${logoUrl}`);

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
          <BusinessLogo src={logoUrl} name={business.name} />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{business.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{business.tagline || 'Rate your experience with us'}</p>
        </div>

        <div className="mt-8">
          <ReviewForm 
            businessId={businessId} 
            businessName={business.name}
            gmbReviewLink={gmbReviewLink}
            apiKey={process.env.API_KEY || ''}
          />
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-400 font-medium">Powered by {appConfig?.appName || 'Social Suite'}</p>
    </div>
  );
}
