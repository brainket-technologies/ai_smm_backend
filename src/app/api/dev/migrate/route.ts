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

    // Detect Current Domain dynamically
    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;
    const apiUrl = `${origin}/api/v1`;
    const adminUrl = `${origin}/admin`;
    const landingUrl = `${origin}/`;

    // Auto-Set Values for Production based on dynamic origin
    await prisma.$executeRawUnsafe(`
      UPDATE app_configs 
      SET 
        api_base_url = '${apiUrl}',
        landing_page_url = '${landingUrl}',
        admin_panel_url = '${adminUrl}'
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
