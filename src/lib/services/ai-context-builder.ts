import { prisma } from "@/lib/prisma";

export interface AIContext {
  business: {
    name: string;
    tagline?: string;
    description?: string;
    category?: string;
    brandColor?: string;
    contact: {
      phone?: string;
      email?: string;
      website?: string;
      address?: string;
    };
  };
  offerings: {
    products: { name: string; description: string; price: string }[];
    services: { name: string; description: string; price: string }[];
  };
  audience?: {
    type?: string;
    region?: string;
    ageGroup?: string;
    gender?: string;
  };
  cta?: string;
}

export class AIContextBuilder {
  /**
   * Aggregates all business data into a structured context for AI.
   */
  static async build(userId: bigint, businessId: bigint): Promise<AIContext> {
    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: userId },
      include: {
        businessCategories: { include: { category: true } },
        audienceType: true,
        targetRegion: true,
        targetAgeGroup: true,
        ctaButton: true,
        products: { where: { visibilityStatus: "active" } },
        services: { where: { visibilityStatus: "active" } },
      },
    });

    if (!business) {
      throw new Error("Business not found or unauthorized.");
    }

    return {
      business: {
        name: business.name,
        tagline: business.tagline || undefined,
        description: business.description || undefined,
        category: business.businessCategories[0]?.category.name,
        brandColor: business.brandColor || undefined,
        contact: {
          phone: business.phone || undefined,
          email: business.email || undefined,
          website: business.website || undefined,
          address: business.address || undefined,
        },
      },
      offerings: {
        products: business.products.map((p) => ({
          name: p.name,
          description: p.description || "",
          price: p.price.toString(),
        })),
        services: business.services.map((s) => ({
          name: s.name,
          description: s.description || "",
          price: s.price.toString(),
        })),
      },
      audience: {
        type: business.audienceType?.name,
        region: business.targetRegion?.name,
        ageGroup: business.targetAgeGroup?.name,
        gender: business.targetGender || "all",
      },
      cta: business.ctaButton?.name,
    };
  }

  /**
   * Converts the AIContext into a natural language string for prompt injection.
   */
  static toContextString(context: AIContext): string {
    let str = `Business Name: ${context.business.name}\n`;
    if (context.business.category) str += `Category: ${context.business.category}\n`;
    if (context.business.tagline) str += `Tagline: ${context.business.tagline}\n`;
    if (context.business.description) str += `Description: ${context.business.description}\n`;
    
    if (context.audience) {
      str += `Target Audience: ${context.audience.type || "General"}, Region: ${context.audience.region || "Any"}, Age Group: ${context.audience.ageGroup || "All"}\n`;
    }

    if (context.offerings.products.length > 0) {
      str += `Products: ${context.offerings.products.map(p => `${p.name} (${p.price})`).join(", ")}\n`;
    }

    if (context.offerings.services.length > 0) {
      str += `Services: ${context.offerings.services.map(s => `${s.name} (${s.price})`).join(", ")}\n`;
    }

    return str;
  }
}
