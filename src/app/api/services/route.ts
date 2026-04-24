import { NextRequest, NextResponse } from 'next/server';
import { ServiceService } from '@/lib/services/service-service';

export async function GET(req: NextRequest) {
    try {
        const businessId = req.headers.get('x-business-id');
        if (!businessId) {
            return NextResponse.json({ success: false, message: 'Business ID is required' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || undefined;

        const services = await ServiceService.getBusinessServices(BigInt(businessId), search);

        return NextResponse.json({
            success: true,
            data: services
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const businessId = req.headers.get('x-business-id');
        if (!businessId) {
            return NextResponse.json({ success: false, message: 'Business ID is required' }, { status: 400 });
        }

        const body = await req.json();
        const result = await ServiceService.createService({
            ...body,
            businessId: BigInt(businessId),
            mediaId: body.mediaId ? BigInt(body.mediaId) : undefined,
            categoryIds: body.categoryIds?.map((id: string) => BigInt(id)),
            subCategoryIds: body.subCategoryIds?.map((id: string) => BigInt(id))
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
