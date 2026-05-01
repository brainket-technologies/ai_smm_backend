import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response!;
    // Using raw query as these tables might not be in Prisma schema yet
    const countries = await prisma.$queryRaw`
      SELECT id, name, iso2, iso3, phonecode, capital, currency, latitude, longitude 
      FROM countries 
      ORDER BY name ASC
    `;
    return NextResponse.json({
      success: true,
      message: 'Countries fetched successfully',
      data: countries
    });
  } catch (error: any) {
    console.error('Error fetching countries:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch countries',
      error: error.message 
    }, { status: 500 });
  }
}
