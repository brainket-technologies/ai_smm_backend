import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    console.log("Starting Migration via API (Adding is_active for auxiliary models)...");
    
    // Add 'is_active' columns
    await prisma.$executeRawUnsafe(`ALTER TABLE audience_types ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
    await prisma.$executeRawUnsafe(`ALTER TABLE cta_buttons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
    await prisma.$executeRawUnsafe(`ALTER TABLE model_ethnicities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
    await prisma.$executeRawUnsafe(`ALTER TABLE target_age_groups ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
    await prisma.$executeRawUnsafe(`ALTER TABLE target_regions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
    await prisma.$executeRawUnsafe(`ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
    
    // Site URL Configuration Expansion
    await prisma.$executeRawUnsafe(`ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS landing_page_url TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS admin_panel_url TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS hero_title TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS hero_subtitle TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS features_json JSONB`);
    await prisma.$executeRawUnsafe(`ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS pricing_title TEXT`);

    // Detect Current Domain dynamically
    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;
    const apiUrl = `${origin}/api/v1`;
    const adminUrl = `${origin}/admin`;
    const landingUrl = `${origin}/`;

    const defaultFeatures = [
      {
        id: "1",
        title: "AI Post Generation",
        description: "Generate high-engaging social media posts for any platform using advanced AI models tailored to your brand voice.",
        icon: "Zap"
      },
      {
        id: "2",
        title: "Multi-Platform Scheduling",
        description: "Schedule and manage content across Instagram, Facebook, LinkedIn, and Twitter from a single, unified dashboard.",
        icon: "Globe"
      },
      {
        id: "3",
        title: "Business Intelligence",
        description: "Get deep insights into your audience, product performance, and social growth with AI-driven analytics.",
        icon: "Cpu"
      },
      {
        id: "4",
        title: "Team Collaboration",
        description: "Role-based access control and seamless workflows for your marketing team and business managers.",
        icon: "ShieldAlert"
      }
    ];

    // Auto-Set Values for Production based on dynamic origin
    await prisma.$executeRawUnsafe(`
      UPDATE app_configs 
      SET 
        api_base_url = '${apiUrl}',
        landing_page_url = '${landingUrl}',
        admin_panel_url = '${adminUrl}',
        hero_title = 'Elevate Your Social Influence with AI',
        hero_subtitle = 'The ultimate Social Media AI Management suite for businesses. Generate, schedule, and grow your digital presence in seconds.',
        pricing_title = 'Simple, Transparent Pricing',
        features_json = '${JSON.stringify(defaultFeatures)}'
      WHERE id = 1
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: "Schema updated and system URLs auto-set dynamically.",
      data: {
        detected_origin: origin,
        landing: landingUrl,
        admin: adminUrl,
        api: apiUrl
      }
    });
  } catch(error: any) {
    console.error("Migration Failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
