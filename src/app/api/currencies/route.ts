import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
  // Validate API Key
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  try {
    const currencies = await prisma.currency.findMany({
      where: { status: true },
      orderBy: { name: 'asc' },
    });

    // Handle BigInt serialization
    const serializedCurrencies = currencies.map((c) => ({
      ...c,
      id: c.id.toString(),
    }));

    return NextResponse.json({
      success: true,
      message: 'Currencies fetched successfully',
      data: serializedCurrencies,
    });
  } catch (error: any) {
    console.error('Fetch currencies error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
