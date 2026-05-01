import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    if (!country) {
      return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
    }

    const states = await prisma.$queryRaw`
      SELECT id, name, state_code, country_code, latitude, longitude 
      FROM states 
      WHERE country_code = ${country}
      ORDER BY name ASC
    `;
    return NextResponse.json(states);
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
  }
}
