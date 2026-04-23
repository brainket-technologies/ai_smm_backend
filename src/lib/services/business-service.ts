import { prisma } from '@/lib/prisma';

export class BusinessService {
  /**
   * Registers a new business for a user.
   */
  static async register(userId: bigint, data: { name: string; phone: string; categoryId: string }) {
    const business = await prisma.business.create({
      data: {
        ownerId: userId,
        name: data.name,
        phone: data.phone,
        businessCategories: {
          create: {
            categoryId: BigInt(data.categoryId),
          },
        },
      },
      include: {
        businessCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return JSON.parse(JSON.stringify(business, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  /**
   * Checks if a user has any registered business.
   */
  static async hasBusiness(userId: bigint) {
    const count = await prisma.business.count({
      where: { ownerId: userId },
    });
    return count > 0;
  }

  /**
   * Fetches all businesses for a user.
   */
  static async list(userId: bigint) {
    const businesses = await prisma.business.findMany({
      where: { ownerId: userId },
      include: {
        businessCategories: {
          include: {
            category: true,
          },
        },
        media: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return JSON.parse(JSON.stringify(businesses, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  /**
   * Updates an existing business.
   */
  static async update(userId: bigint, businessId: string, data: any) {
    // 1. Resolve related IDs from names if provided
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.streetAddress !== undefined) updateData.address = data.streetAddress;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.pinCode !== undefined) updateData.postalCode = data.pinCode;
    if (data.brandColor !== undefined) updateData.brandColor = data.brandColor.toString();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.gender !== undefined) updateData.targetGender = data.gender;

    // Handle relations by name lookups
    if (data.audienceType) {
      const item = await prisma.audienceType.findFirst({ where: { name: data.audienceType } });
      if (item) updateData.audienceTypeId = item.id;
    }
    if (data.region) {
      const item = await prisma.targetRegion.findFirst({ where: { name: data.region } });
      if (item) updateData.targetRegionId = item.id;
    }
    if (data.ageGroup) {
      const item = await prisma.targetAgeGroup.findFirst({ where: { name: data.ageGroup } });
      if (item) updateData.targetAgeGroupId = item.id;
    }
    if (data.ethnicity) {
      const item = await prisma.modelEthnicity.findFirst({ where: { name: data.ethnicity } });
      if (item) updateData.modelEthnicityId = item.id;
    }
    if (data.ctaButton) {
      const item = await prisma.cTAButton.findFirst({ where: { name: data.ctaButton } });
      if (item) updateData.ctaButtonId = item.id;
    }

    const business = await prisma.business.update({
      where: { id: BigInt(businessId), ownerId: userId },
      data: updateData,
      include: {
        businessCategories: { include: { category: true } },
        media: true,
        audienceType: true,
        targetRegion: true,
        targetAgeGroup: true,
        modelEthnicity: true,
        ctaButton: true,
      },
    });

    return JSON.parse(JSON.stringify(business, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }
}
