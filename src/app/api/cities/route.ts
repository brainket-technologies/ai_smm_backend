import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const state = searchParams.get('state');

    if (!country || !state) {
      return NextResponse.json({ error: 'Country and state codes are required' }, { status: 400 });
    }

    const cities = await prisma.$queryRaw`
      SELECT id, name, city_code, state_code, country_code, latitude, longitude 
      FROM cities 
      WHERE country_code = ${country} AND state_code = ${state}
      ORDER BY name ASC
    `;
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
