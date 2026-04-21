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
      select: {
        id: true,
        languageCode: true,
        countryCode: true,
        displayName: true,
        isDefault: true,
      },
      orderBy: { displayName: 'asc' },
    });

    // Handle BigInt serialization
    const serializedLanguages = languages.map((l) => ({
      ...l,
      id: l.id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedLanguages,
    });
  } catch (error: any) {
    console.error('Fetch languages error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
