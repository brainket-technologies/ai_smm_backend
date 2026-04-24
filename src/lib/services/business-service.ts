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
        audienceType: true,
        targetRegion: true,
        targetAgeGroup: true,
        modelEthnicity: true,
        ctaButton: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return JSON.parse(JSON.stringify(businesses, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  /**
   * Updates an existing business.
   */
  static async update(userId: bigint, businessId: string, data: any) {
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.pinCode !== undefined) updateData.postalCode = data.pinCode;
    if (data.brandColor !== undefined) updateData.brandColor = data.brandColor;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.gender !== undefined) updateData.targetGender = data.gender;
    
    // Direct ID updates
    if (data.mediaId !== undefined) updateData.mediaId = BigInt(data.mediaId);
    if (data.audienceTypeId !== undefined) updateData.audienceTypeId = BigInt(data.audienceTypeId);
    if (data.targetRegionId !== undefined) updateData.targetRegionId = BigInt(data.targetRegionId);
    if (data.targetAgeGroupId !== undefined) updateData.targetAgeGroupId = BigInt(data.targetAgeGroupId);
    if (data.modelEthnicityId !== undefined) updateData.modelEthnicityId = BigInt(data.modelEthnicityId);
    if (data.ctaButtonId !== undefined) updateData.ctaButtonId = BigInt(data.ctaButtonId);

    // Handle business category update
    if (data.categoryId !== undefined) {
      // For now, we clear existing categories and set the new one
      await prisma.businessCategory.deleteMany({
        where: { businessId: BigInt(businessId) }
      });
      await prisma.businessCategory.create({
        data: {
          businessId: BigInt(businessId),
          categoryId: BigInt(data.categoryId)
        }
      });
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

  /**
   * Fetches details of a single business.
   */
  static async getById(userId: bigint, businessId: string) {
    const business = await prisma.business.findFirst({
      where: { 
        id: BigInt(businessId), 
        ownerId: userId 
      },
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

    if (!business) return null;

    return JSON.parse(JSON.stringify(business, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }
}
