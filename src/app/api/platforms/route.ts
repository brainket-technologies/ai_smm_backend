import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
  // 1. Validate API Key
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  try {
    const platforms = await prisma.platform.findMany({
      include: {
        media: {
          select: {
            fileUrl: true,
          }
        }
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
