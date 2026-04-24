import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { validateApiKey, validateAuth, validateBusinessId } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        // Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // Validate Auth
        const authCheck = await validateAuth(request);
        if (!authCheck.isValid) return authCheck.response;

        // Validate Business Id from Header
        const businessCheck = validateBusinessId(request);
        if (!businessCheck.isValid) return businessCheck.response;

        const body = await request.json();
        const { 
            name, 
            price, 
            stock, 
            description, 
            mediaId, 
            categories, 
            subCategories, 
            tags, 
            visibilityStatus 
        } = body;

        if (!name || price === undefined) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: name, price' },
                { status: 400 }
            );
        }

        const result = await ProductService.createProduct({
            businessId: businessCheck.businessId!,
            name,
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            description,
            mediaId: mediaId ? BigInt(mediaId) : undefined,
            categories: categories || [],
            subCategories: subCategories || [],
            tags: tags || [],
            visibilityStatus: visibilityStatus || 'active'
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Product POST Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // Validate Business Id from Header
        const businessCheck = validateBusinessId(request);
        if (!businessCheck.isValid) return businessCheck.response;

        // Get search query
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;

        const products = await ProductService.getBusinessProducts(businessCheck.businessId!, search);

        return NextResponse.json({
            success: true,
            data: products
        });
    } catch (error: any) {
        console.error('Product GET Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
