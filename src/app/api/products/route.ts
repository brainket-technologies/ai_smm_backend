import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        // Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // Validate Auth
        const authCheck = await validateAuth(request);
        if (!authCheck.isValid) return authCheck.response;

        const body = await request.json();
        const { 
            businessId, 
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

        if (!businessId || !name || price === undefined) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: businessId, name, price' },
                { status: 400 }
            );
        }

        const result = await ProductService.createProduct({
            businessId: BigInt(businessId),
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

        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json(
                { success: false, message: 'businessId is required' },
                { status: 400 }
            );
        }

        const products = await ProductService.getBusinessProducts(BigInt(businessId));

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
