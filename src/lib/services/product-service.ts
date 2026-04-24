import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
                    price: new Prisma.Decimal(data.price),
                    stock: data.stock,
                    mediaId: data.mediaId,
                    tags: data.tags || Prisma.JsonNull,
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

    static async updateProduct(id: bigint, data: {
        businessId: bigint;
        name?: string;
        description?: string;
        price?: number;
        stock?: number;
        mediaId?: bigint;
        categories?: string[];
        subCategories?: string[];
        tags?: string[];
        visibilityStatus?: string;
    }) {
        try {
            const product = await prisma.product.update({
                where: { id, businessId: data.businessId },
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
                    stock: data.stock,
                    mediaId: data.mediaId,
                    tags: data.tags || undefined,
                    visibilityStatus: data.visibilityStatus,
                }
            });

            // Handle Categories (Clear and Re-create for simplicity or sync)
            if (data.categories) {
                await prisma.productCategory.deleteMany({ where: { productId: id } });
                if (data.categories.length > 0) {
                    await prisma.productCategory.createMany({
                        data: data.categories.map(catId => ({
                            productId: id,
                            categoryId: BigInt(catId)
                        }))
                    });
                }
            }

            // Handle SubCategories
            if (data.subCategories) {
                await prisma.productSubCategory.deleteMany({ where: { productId: id } });
                if (data.subCategories.length > 0) {
                    await prisma.productSubCategory.createMany({
                        data: data.subCategories.map(subId => ({
                            productId: id,
                            subCategoryId: BigInt(subId)
                        }))
                    });
                }
            }

            return {
                success: true,
                message: 'Product updated successfully',
                data: {
                    ...product,
                    id: product.id.toString(),
                    businessId: product.businessId.toString(),
                    mediaId: product.mediaId?.toString()
                }
            };
        } catch (error: any) {
            console.error('Update Product Error:', error);
            throw error;
        }
    }

    static async getBusinessProducts(businessId: bigint, search?: string) {
        try {
            const products = await prisma.product.findMany({
                where: { 
                    businessId,
                    OR: search ? [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ] : undefined
                },
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
                categories: p.productCategories.map(pc => ({ id: pc.category.id.toString(), name: pc.category.name })),
                subCategories: p.productSubCategories.map(psc => ({ id: psc.subCategory.id.toString(), name: psc.subCategory.name }))
            }));
        } catch (error: any) {
            console.error('Get Products Error:', error);
            throw error;
        }
    }

    static async getProductDetails(id: bigint, businessId: bigint) {
        try {
            const product = await prisma.product.findFirst({
                where: { id, businessId },
                include: {
                    productCategories: { include: { category: true } },
                    productSubCategories: { include: { subCategory: true } },
                    media: true
                }
            });

            if (!product) return null;

            return {
                ...product,
                id: product.id.toString(),
                businessId: product.businessId.toString(),
                mediaId: product.mediaId?.toString(),
                categories: product.productCategories.map(pc => ({ id: pc.category.id.toString(), name: pc.category.name })),
                subCategories: product.productSubCategories.map(psc => ({ id: psc.subCategory.id.toString(), name: psc.subCategory.name }))
            };
        } catch (error: any) {
            console.error('Get Product Details Error:', error);
            throw error;
        }
    }

    static async deleteProduct(id: bigint, businessId: bigint) {
        try {
            // Relations are deleted automatically if ON DELETE CASCADE is set, 
            // but for safety we can delete manually or let Prisma handle it.
            // Check if product belongs to business
            const product = await prisma.product.findFirst({ where: { id, businessId } });
            if (!product) return { success: false, message: 'Product not found' };

            await prisma.product.delete({ where: { id } });

            return {
                success: true,
                message: 'Product deleted successfully'
            };
        } catch (error: any) {
            console.error('Delete Product Error:', error);
            throw error;
        }
    }
}
