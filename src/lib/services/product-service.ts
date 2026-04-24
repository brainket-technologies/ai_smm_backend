import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class ProductService {
    private static async resolveCategoryIds(namesOrIds: string[]) {
        const resolvedIds: bigint[] = [];
        for (const item of namesOrIds) {
            if (/^\d+$/.test(item)) {
                resolvedIds.push(BigInt(item));
            } else {
                let category = await prisma.category.findFirst({
                    where: { name: item, type: 'product' }
                });
                if (!category) {
                    category = await prisma.category.create({
                        data: { name: item, type: 'product' }
                    });
                }
                resolvedIds.push(category.id);
            }
        }
        return resolvedIds;
    }

    private static async resolveSubCategoryIds(namesOrIds: string[], resolvedCatIds: bigint[]) {
        const resolvedIds: bigint[] = [];
        for (const item of namesOrIds) {
            if (/^\d+$/.test(item)) {
                resolvedIds.push(BigInt(item));
            } else {
                let subCategory = await prisma.subCategory.findFirst({
                    where: { name: item, categoryId: resolvedCatIds[0] }
                });
                if (!subCategory && resolvedCatIds.length > 0) {
                    subCategory = await prisma.subCategory.create({
                        data: { name: item, categoryId: resolvedCatIds[0] }
                    });
                }
                if (subCategory) resolvedIds.push(subCategory.id);
            }
        }
        return resolvedIds;
    }

    static async createProduct(data: {
        businessId: bigint;
        name: string;
        description?: string;
        price: number;
        stock?: number;
        mediaId?: bigint;
        categories?: string[];
        subCategories?: string[];
        tags?: string[];
        visibilityStatus?: string;
    }) {
        try {
            const categoryIds = data.categories ? await this.resolveCategoryIds(data.categories) : [];
            const subCategoryIds = data.subCategories ? await this.resolveSubCategoryIds(data.subCategories, categoryIds) : [];

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
                    productCategories: {
                        create: categoryIds.map(id => ({
                            categoryId: id
                        }))
                    },
                    productSubCategories: {
                        create: subCategoryIds.map(id => ({
                            subCategoryId: id
                        }))
                    }
                }
            });

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
            const categoryIds = data.categories ? await this.resolveCategoryIds(data.categories) : null;
            const subCategoryIds = data.subCategories ? await this.resolveSubCategoryIds(data.subCategories, categoryIds || []) : null;

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

            // Handle Categories
            if (categoryIds) {
                await prisma.productCategory.deleteMany({ where: { productId: id } });
                if (categoryIds.length > 0) {
                    await prisma.productCategory.createMany({
                        data: categoryIds.map(catId => ({
                            productId: id,
                            categoryId: catId
                        }))
                    });
                }
            }

            // Handle SubCategories
            if (subCategoryIds) {
                await prisma.productSubCategory.deleteMany({ where: { productId: id } });
                if (subCategoryIds.length > 0) {
                    await prisma.productSubCategory.createMany({
                        data: subCategoryIds.map(subId => ({
                            productId: id,
                            subCategoryId: subId
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
