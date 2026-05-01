import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const check = await validateRequest(request);
    if (!check.isValid) return check.response!;
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
    return NextResponse.json({
      res: true,
      message: 'States fetched successfully',
      data: states
    });
  } catch (error: any) {
    console.error('Error fetching states:', error);
    return NextResponse.json({ 
      res: false, 
      message: 'Failed to fetch states',
      error: error.message 
    }, { status: 500 });
  }
}
