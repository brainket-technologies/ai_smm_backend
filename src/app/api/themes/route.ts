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

    // Handle BigInt serialization and field naming sync with frontend (snake_case)
    const serializedThemes = themes.map((t) => ({
      id: t.id.toString(),
      name: t.name,
      primary_color: t.primaryColor,
      secondary_color: t.secondaryColor,
      dark_primary_color: t.darkPrimaryColor,
      dark_secondary_color: t.darkSecondaryColor,
      is_default: t.isDefault,
      is_active: t.isActive,
      media_id: t.mediaId?.toString(),
      background_image: t.media?.fileUrl || null,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      message: 'Themes fetched successfully',
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
