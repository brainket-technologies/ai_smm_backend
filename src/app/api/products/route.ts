import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { validateRequest } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        const check = await validateRequest(request);
        if (!check.isValid) return check.response!;

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
                { res: "error", message: 'Missing required fields: name, price' },
                { status: 400 }
            );
        }

        const result = await ProductService.createProduct({
            businessId: check.businessId,
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
            { res: "error", message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const check = await validateRequest(request);
        if (!check.isValid) return check.response!;

        // Get search query
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;

        const products = await ProductService.getBusinessProducts(check.businessId, search);

        return NextResponse.json({
            res: "success",
            data: products
        });
    } catch (error: any) {
        console.error('Product GET Error:', error);
        return NextResponse.json(
            { res: "error", message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
