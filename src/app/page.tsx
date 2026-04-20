import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import DashboardPreview from "@/components/landing/DashboardPreview";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import { CTA, Footer } from "@/components/landing/Footer";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

async function getLandingData() {
  const config = await prisma.appConfig.findFirst({
    where: { id: BigInt(1) }
  });
  return { config };
}

export default async function LandingPage() {
  const { config } = await getLandingData();
  const primaryColor = config?.primaryColor || "#2ECC71";

  return (
    <main className="bg-white min-h-screen text-slate-900 selection:bg-emerald-500/10 selection:text-emerald-900">
      <Navbar primaryColor={primaryColor} />
      <Hero primaryColor={primaryColor} config={config} />
      <Features primaryColor={primaryColor} />
      <HowItWorks primaryColor={primaryColor} />
      <DashboardPreview primaryColor={primaryColor} />
      <Pricing primaryColor={primaryColor} config={config} />
      <Testimonials primaryColor={primaryColor} />
      <CTA primaryColor={primaryColor} />
      <Footer primaryColor={primaryColor} />
    </main>
  );
}
