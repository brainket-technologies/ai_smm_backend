import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Using raw query as these tables might not be in Prisma schema yet
    const countries = await prisma.$queryRaw`
      SELECT id, name, iso2, iso3, phonecode, capital, currency, latitude, longitude 
      FROM countries 
      ORDER BY name ASC
    `;
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}
