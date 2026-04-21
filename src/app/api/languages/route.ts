import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
  // Validate API Key
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  try {
    const languages = await prisma.appTranslation.findMany({
      where: { isActive: true },
      include: {
        media: {
          select: {
            fileUrl: true,
          },
        },
      },
      orderBy: { displayName: 'asc' },
    });

    // Map into the requested structure (snake_case)
    const languageList = languages.map((l) => ({
      "id": Number(l.id),
      "image_url": l.media?.fileUrl || "",
      "display_name": l.displayName,
      "language_code": l.languageCode,
      "country_code": l.countryCode,
      "is_default": l.isDefault,
    }));

    // Map translations into a dictionary keyed by language code
    const translationsMap: Record<string, any> = {};
    languages.forEach((l) => {
      translationsMap[l.languageCode] = l.translations;
    });

    return NextResponse.json({
      "success": true,
      "message": "Languages loaded successfully",
      "data": {
        "languages": languageList,
        "translations": translationsMap
      }
    });
  } catch (error: any) {
    console.error('Fetch languages error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
