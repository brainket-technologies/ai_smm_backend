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
    await prisma.$executeRawUnsafe(`ALTER TABLE app_configs ADD COLUMN IF NOT EXISTS primary_color TEXT`);

    // Detect Current Domain dynamically
    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;
    const apiUrl = `${origin}/api/v1`;
    const adminUrl = `${origin}/admin`;
    const landingUrl = `${origin}/`;

    const defaultFeatures = [
      { id: "1", title: "AI Content Engine", description: "Generate localized, high-impact posts for Instagram, Facebook, and LinkedIn in seconds.", icon: "Zap" },
      { id: "2", title: "Global Scheduling", description: "One-click publishing across multiple platforms with AI-optimized timing.", icon: "Globe" },
      { id: "3", title: "Business CRM", description: "Manage products, services, and customers with integrated business intelligence.", icon: "Cpu" },
      { id: "4", title: "Analytics Wall", description: "Real-time growth tracking and audience insights delivered via a beautiful dashboard.", icon: "BarChart3" },
      { id: "5", title: "Team Roles", description: "Granular access control for agency owners, managers, and contributors.", icon: "ShieldAlert" },
      { id: "6", title: "Brand Voice", description: "AI models trained on your specific brand identity for consistent messaging.", icon: "Star" }
    ];

    const defaultTestimonials = [
      { id: "1", name: "Sarah Chen", role: "Digital Agency Owner", text: "BrandBoost AI reduced my content creation time by 80%. It's like having a full-time social team.", avatar: "https://i.pravatar.cc/150?img=32" },
      { id: "2", name: "David Miller", role: "E-commerce Manager", text: "The integration with our product catalog is seamless. AI generation works like magic for our ads.", avatar: "https://i.pravatar.cc/150?img=12" }
    ];

    // Initialize Default Static Pages if missing
    const pagesToSeed = [
      { slug: 'faq', title: 'Frequently Asked Questions', content: '<h3>How does the AI work?</h3><p>Our AI uses advanced LLMs fine-tuned for social media marketing.</p>' }
    ];

    for (const page of pagesToSeed) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO static_pages (slug, title, content, is_active, created_at, updated_at)
        VALUES ('${page.slug}', '${page.title}', '${page.content}', true, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;
      `);
    }

    // Auto-Set Values for Production based on dynamic origin
    await prisma.$executeRawUnsafe(`
      UPDATE app_configs 
      SET 
        api_base_url = '${apiUrl}',
        landing_page_url = '${landingUrl}',
        admin_panel_url = '${adminUrl}',
        primary_color = '#2ECC71',
        hero_title = 'Ignite Your Brand with AI-Powered Social Mastery',
        hero_subtitle = 'The all-in-one Social Media AI management suite. Create, Automate, and Scale your digital presence across all platforms instantly.',
        pricing_title = 'Engineered for Growth',
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
