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
  }
}
