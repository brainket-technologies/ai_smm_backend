import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { validateApiKey, validateAuth, validateBusinessId } from '@/lib/auth-utils';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const businessCheck = validateBusinessId(request);
        if (!businessCheck.isValid) return businessCheck.response;

        const product = await ProductService.getProductDetails(
            BigInt(id),
            businessCheck.businessId!
        );

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: product
        });
    } catch (error: any) {
        console.error('Product Details GET Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const authCheck = await validateAuth(request);
        if (!authCheck.isValid) return authCheck.response;

        const businessCheck = validateBusinessId(request);
        if (!businessCheck.isValid) return businessCheck.response;

        const body = await request.json();
        
        const result = await ProductService.updateProduct(BigInt(id), {
            businessId: businessCheck.businessId!,
            ...body,
            mediaId: body.mediaId ? BigInt(body.mediaId) : undefined,
            price: body.price !== undefined ? Number(body.price) : undefined,
            stock: body.stock !== undefined ? Number(body.stock) : undefined,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Product Update PATCH Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        const authCheck = await validateAuth(request);
        if (!authCheck.isValid) return authCheck.response;

        const businessCheck = validateBusinessId(request);
        if (!businessCheck.isValid) return businessCheck.response;

        const result = await ProductService.deleteProduct(
            BigInt(id),
            businessCheck.businessId!
        );

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Product DELETE Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
