import { NextRequest, NextResponse } from 'next/server';
import { ServiceService } from '@/lib/services/service-service';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const businessId = req.headers.get('x-business-id');
        if (!businessId) {
            return NextResponse.json({ success: false, message: 'Business ID is required' }, { status: 400 });
        }

        const service = await ServiceService.getServiceDetails(BigInt(id), BigInt(businessId));

        if (!service) {
            return NextResponse.json({ success: false, message: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: service
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const businessId = req.headers.get('x-business-id');
        if (!businessId) {
            return NextResponse.json({ success: false, message: 'Business ID is required' }, { status: 400 });
        }

        const body = await req.json();
        const result = await ServiceService.updateService(BigInt(id), BigInt(businessId), {
            ...body,
            mediaId: body.mediaId ? BigInt(body.mediaId) : undefined,
            categoryIds: body.categoryIds?.map((id: string) => BigInt(id)),
            subCategoryIds: body.subCategoryIds?.map((id: string) => BigInt(id))
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const businessId = req.headers.get('x-business-id');
        if (!businessId) {
            return NextResponse.json({ success: false, message: 'Business ID is required' }, { status: 400 });
        }

        const result = await ServiceService.deleteService(BigInt(id), BigInt(businessId));

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
