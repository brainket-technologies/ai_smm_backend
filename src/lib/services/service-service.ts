import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class ServiceService {
    static async createService(data: {
        businessId: bigint;
        name: string;
        description?: string;
        price: number;
        slots?: number;
        tags?: string[];
        visibilityStatus?: string;
        mediaId?: bigint;
        categoryIds?: bigint[];
        subCategoryIds?: bigint[];
    }) {
        try {
            const { categoryIds, subCategoryIds, ...serviceData } = data;

            // Validate mediaId if provided
            if (data.mediaId) {
                const mediaExists = await prisma.mediaFile.findUnique({
                    where: { id: data.mediaId }
                });
                if (!mediaExists) {
                    return { success: false, message: 'Invalid mediaId: File does not exist' };
                }
            }

            const service = await prisma.service.create({
                data: {
                    ...serviceData,
                    price: new Prisma.Decimal(data.price),
                    serviceCategories: categoryIds ? {
                        create: categoryIds.map(id => ({
                            categoryId: id
                        }))
                    } : undefined,
                    serviceSubCategories: subCategoryIds ? {
                        create: subCategoryIds.map(id => ({
                            subCategoryId: id
                        }))
                    } : undefined
                }
            });

            return {
                success: true,
                message: 'Service created successfully',
                data: {
                    ...service,
                    id: service.id.toString(),
                    businessId: service.businessId.toString(),
                    mediaId: service.mediaId?.toString()
                }
            };
        } catch (error: any) {
            console.error('Create Service Error:', error);
            throw error;
        }
    }

    static async updateService(id: bigint, businessId: bigint, data: {
        name?: string;
        description?: string;
        price?: number;
        slots?: number;
        tags?: string[];
        visibilityStatus?: string;
        mediaId?: bigint;
        categoryIds?: bigint[];
        subCategoryIds?: bigint[];
    }) {
        try {
            const { categoryIds, subCategoryIds, ...serviceData } = data;

            // Check if service belongs to business
            const existingService = await prisma.service.findFirst({ where: { id, businessId } });
            if (!existingService) return { success: false, message: 'Service not found' };

            const service = await prisma.service.update({
                where: { id },
                data: {
                    ...serviceData,
                    price: data.price ? new Prisma.Decimal(data.price) : undefined,
                    updatedAt: new Date()
                }
            });

            // Handle Categories
            if (categoryIds) {
                await prisma.serviceCategory.deleteMany({ where: { serviceId: id } });
                if (categoryIds.length > 0) {
                    await prisma.serviceCategory.createMany({
                        data: categoryIds.map(catId => ({
                            serviceId: id,
                            categoryId: catId
                        }))
                    });
                }
            }

            // Handle SubCategories
            if (subCategoryIds) {
                await prisma.serviceSubCategory.deleteMany({ where: { serviceId: id } });
                if (subCategoryIds.length > 0) {
                    await prisma.serviceSubCategory.createMany({
                        data: subCategoryIds.map(subId => ({
                            serviceId: id,
                            subCategoryId: subId
                        }))
                    });
                }
            }

            return {
                success: true,
                message: 'Service updated successfully',
                data: {
                    ...service,
                    id: service.id.toString(),
                    businessId: service.businessId.toString(),
                    mediaId: service.mediaId?.toString()
                }
            };
        } catch (error: any) {
            console.error('Update Service Error:', error);
            throw error;
        }
    }

    static async getBusinessServices(businessId: bigint, search?: string) {
        try {
            const services = await prisma.service.findMany({
                where: { 
                    businessId,
                    OR: search ? [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ] : undefined
                },
                include: {
                    serviceCategories: { include: { category: true } },
                    serviceSubCategories: { include: { subCategory: true } },
                    media: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return services.map(s => ({
                ...s,
                id: s.id.toString(),
                businessId: s.businessId.toString(),
                mediaId: s.mediaId?.toString(),
                categories: s.serviceCategories.map(sc => ({ id: sc.category.id.toString(), name: sc.category.name })),
                subCategories: s.serviceSubCategories.map(ssc => ({ id: ssc.subCategory.id.toString(), name: ssc.subCategory.name }))
            }));
        } catch (error: any) {
            console.error('Get Services Error:', error);
            throw error;
        }
    }

    static async getServiceDetails(id: bigint, businessId: bigint) {
        try {
            const service = await prisma.service.findFirst({
                where: { id, businessId },
                include: {
                    serviceCategories: { include: { category: true } },
                    serviceSubCategories: { include: { subCategory: true } },
                    media: true
                }
            });

            if (!service) return null;

            return {
                ...service,
                id: service.id.toString(),
                businessId: service.businessId.toString(),
                mediaId: service.mediaId?.toString(),
                categories: service.serviceCategories.map(sc => ({ id: sc.category.id.toString(), name: sc.category.name })),
                subCategories: service.serviceSubCategories.map(ssc => ({ id: ssc.subCategory.id.toString(), name: ssc.subCategory.name }))
            };
        } catch (error: any) {
            console.error('Get Service Details Error:', error);
            throw error;
        }
    }

    static async deleteService(id: bigint, businessId: bigint) {
        try {
            // Check if service belongs to business
            const service = await prisma.service.findFirst({ where: { id, businessId } });
            if (!service) return { success: false, message: 'Service not found' };

            // Manually delete relations first
            await prisma.serviceCategory.deleteMany({ where: { serviceId: id } });
            await prisma.serviceSubCategory.deleteMany({ where: { serviceId: id } });

            await prisma.service.delete({ where: { id } });

            return {
                success: true,
                message: 'Service deleted successfully'
            };
        } catch (error: any) {
            console.error('Delete Service Error:', error);
            throw error;
        }
    }
}
