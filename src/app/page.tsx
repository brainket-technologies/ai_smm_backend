import { ZomatoHeader, ZomatoHero } from "@/components/landing/zomato/Hero";
import FeaturesCollection from "@/components/landing/zomato/FeaturesCollection";
import { ZomatoHowItWorks, ZomatoDashboardPreview, ZomatoCTA, ZomatoFooter } from "@/components/landing/zomato/Dashboard";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

async function getLandingData() {
  try {
    const config = await prisma.appConfig.findFirst({
      where: { id: BigInt(1) }
    });
    return { config };
  } catch (error) {
    console.error("Landing Data Fetch Failed:", error);
    return { config: null };
  }
}

export default async function LandingPage() {
  const { config } = await getLandingData();
  const primaryColor = config?.primaryColor || "#2ECC71";
  const heroImage = "/landing/zomato_style_hero_social_media_1776720288190.png";

  return (
    <main className="bg-white min-h-screen text-slate-900 selection:bg-emerald-500/10 selection:text-emerald-900 font-sans">
      <ZomatoHeader primaryColor={primaryColor} />
      <ZomatoHero primaryColor={primaryColor} heroImage={heroImage} />
      <FeaturesCollection primaryColor={primaryColor} />
      <ZomatoHowItWorks primaryColor={primaryColor} />
      <ZomatoDashboardPreview primaryColor={primaryColor} />
      <Pricing primaryColor={primaryColor} config={config} />
      <Testimonials primaryColor={primaryColor} />
      <ZomatoCTA primaryColor={primaryColor} />
      <ZomatoFooter primaryColor={primaryColor} />
    </main>
  );
}
