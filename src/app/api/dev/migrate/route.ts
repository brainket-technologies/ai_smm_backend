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
    
    return NextResponse.json({ success: true, message: "is_active migration applied successfully to 5 tables." });
  } catch(error: any) {
    console.error("Migration Failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
