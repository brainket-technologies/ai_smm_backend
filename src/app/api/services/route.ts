import { NextRequest, NextResponse } from 'next/server';
import { ServiceService } from '@/lib/services/service-service';
import { validateRequest } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
    try {
        const check = await validateRequest(req);
        if (!check.isValid) return check.response!;

        const businessId = check.businessId;

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || undefined;

        const services = await ServiceService.getBusinessServices(businessId, search);

        return NextResponse.json({
            res: true,
            data: services
        });
    } catch (error: any) {
        return NextResponse.json({ res: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const check = await validateRequest(req);
        if (!check.isValid) return check.response!;

        const businessId = check.businessId;

        const body = await req.json();
        const result = await ServiceService.createService({
            ...body,
            businessId: businessId,
            mediaId: body.mediaId ? BigInt(body.mediaId) : undefined,
            categoryIds: body.categoryIds?.map((id: string) => BigInt(id)),
            subCategoryIds: body.subCategoryIds?.map((id: string) => BigInt(id))
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ res: false, message: error.message }, { status: 500 });
    }
}
