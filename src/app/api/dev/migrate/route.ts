import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
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

    // Auto-Set Values for Production
    await prisma.$executeRawUnsafe(`
      UPDATE app_configs 
      SET 
        api_base_url = 'https://ai-smm-backend.vercel.app/api/v1',
        landing_page_url = 'https://ai-smm-backend.vercel.app/',
        admin_panel_url = 'https://ai-smm-backend.vercel.app/admin'
      WHERE id = 1
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: "Schema updated and system URLs auto-set successfully.",
      data: {
        landing: "https://ai-smm-backend.vercel.app/",
        admin: "https://ai-smm-backend.vercel.app/admin",
        api: "https://ai-smm-backend.vercel.app/api/v1"
      }
    });
  } catch(error: any) {
    console.error("Migration Failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
