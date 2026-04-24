import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client';

export class ProductService {
    static async createProduct(data: {
        businessId: bigint;
        name: string;
        description?: string;
        price: number;
        stock?: number;
        mediaId?: bigint;
        categories?: string[]; // IDs or Names? Assuming IDs for simplicity in relations
        subCategories?: string[];
        tags?: string[];
        visibilityStatus?: string;
    }) {
        try {
            const product = await prisma.product.create({
                data: {
                    businessId: data.businessId,
                    name: data.name,
                    description: data.description,
                    price: new Decimal(data.price),
                    stock: data.stock,
                    mediaId: data.mediaId,
                    tags: data.tags ? JSON.stringify(data.tags) : null,
                    visibilityStatus: data.visibilityStatus || 'active',
                }
            });

            // Handle Categories
            if (data.categories && data.categories.length > 0) {
                await prisma.productCategory.createMany({
                    data: data.categories.map(catId => ({
                        productId: product.id,
                        categoryId: BigInt(catId)
                    }))
                });
            }

            // Handle SubCategories
            if (data.subCategories && data.subCategories.length > 0) {
                await prisma.productSubCategory.createMany({
                    data: data.subCategories.map(subId => ({
                        productId: product.id,
                        subCategoryId: BigInt(subId)
                    }))
                });
            }

            return {
                success: true,
                message: 'Product created successfully',
                data: {
                    ...product,
                    id: product.id.toString(),
                    businessId: product.businessId.toString(),
                    mediaId: product.mediaId?.toString()
                }
            };
        } catch (error: any) {
            console.error('Create Product Error:', error);
            throw error;
        }
    }

    static async getBusinessProducts(businessId: bigint) {
        try {
            const products = await prisma.product.findMany({
                where: { businessId },
                include: {
                    productCategories: { include: { category: true } },
                    productSubCategories: { include: { subCategory: true } },
                    media: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return products.map(p => ({
                ...p,
                id: p.id.toString(),
                businessId: p.businessId.toString(),
                mediaId: p.mediaId?.toString(),
                categories: p.productCategories.map(pc => pc.category.name),
                subCategories: p.productSubCategories.map(psc => psc.subCategory.name)
            }));
        } catch (error: any) {
            console.error('Get Products Error:', error);
            throw error;
        }
    }
}
