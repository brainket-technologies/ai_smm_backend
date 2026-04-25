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

    const sequence = ['instagram', 'facebook', 'gmb', 'linkedin', 'threads', 'whatsapp', 'twitter', 'tiktok', 'pinterest'];

    let formattedPlatforms = platforms.map(p => {
      let logoUrl = p.media?.fileUrl || null;
      // Override Google logo to 'G' only logo
      if (p.nameKey === 'gmb') {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg';
      }

      return {
        id: p.id.toString(),
        name: p.name,
        url: p.url,
        nameKey: p.nameKey,
        isActive: p.isActive,
        logo: logoUrl,
        isConnected: p.socialAccounts ? p.socialAccounts.length > 0 : false,
        accountName: p.socialAccounts && p.socialAccounts.length > 0 ? p.socialAccounts[0].accountName : null,
      };
    });

    // Sort by requested sequence
    formattedPlatforms.sort((a, b) => {
      const indexA = sequence.indexOf(a.nameKey);
      const indexB = sequence.indexOf(b.nameKey);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

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
