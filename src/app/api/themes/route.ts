import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
  // Validate API Key
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  try {
    const themes = await prisma.appTheme.findMany({
      where: { isActive: true },
      include: {
        media: {
          select: {
            fileUrl: true,
          },
        },
      },
    });

    // Handle BigInt serialization
    const serializedThemes = themes.map((t) => ({
      ...t,
      id: t.id.toString(),
      mediaId: t.mediaId?.toString(),
      backgroundImage: t.media?.fileUrl || null,
    }));

    return NextResponse.json({
      success: true,
      data: serializedThemes,
    });
  } catch (error: any) {
    console.error('Fetch themes error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
