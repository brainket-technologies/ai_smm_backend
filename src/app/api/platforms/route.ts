import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, validateBusinessId } from '@/lib/auth-utils';

export async function GET(request: Request) {
  // 1. Validate API Key
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  // 2. Get Business ID from Header (Optional for this API, but use the utility if present)
  const businessIdHeader = request.headers.get('x-business-id');
  let businessId: bigint | null = null;
  if (businessIdHeader) {
      const businessCheck = validateBusinessId(request);
      if (businessCheck.isValid) {
          businessId = businessCheck.businessId!;
      }
  }

  try {
    const platforms = await prisma.platform.findMany({
      include: {
        media: {
          select: {
            fileUrl: true,
          }
        },
        socialAccounts: businessId ? {
          where: {
            businessId: businessId
          }
        } : false
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedPlatforms = platforms.map(p => ({
      id: p.id.toString(),
      name: p.name,
      url: p.url,
      nameKey: p.nameKey,
      isActive: p.isActive,
      logo: p.media?.fileUrl || null,
      isConnected: p.socialAccounts ? p.socialAccounts.length > 0 : false,
      accountName: p.socialAccounts && p.socialAccounts.length > 0 ? p.socialAccounts[0].accountName : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedPlatforms
    });
  } catch (error: any) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
