import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth-utils';
import { FestivalService } from '@/lib/services/festival-service';

export async function GET(req: NextRequest) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response;

    const { searchParams } = req.nextUrl;
    let country = searchParams.get('country');
    let state = searchParams.get('state');
    let yearParam = searchParams.get('year');
    let year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    let upcomingOnly = searchParams.get('upcomingOnly') === 'true';

    // Fetch business location regardless to ensure we have the context
    const businessId = check.businessId;
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { countryId: true, stateId: true }
    });
    
    if (business) {
      if (!country && business.countryId) {
        const countryData = await prisma.country.findUnique({
          where: { id: parseInt(business.countryId) }
        });
        country = countryData?.iso2 || null;
      }
      
      if (!state && business.stateId) {
        const stateData = await prisma.state.findUnique({
          where: { id: parseInt(business.stateId) }
        });
        state = stateData?.stateCode || null;
      }
    }

    // Default to 'IN' if still not found
    if (!country) country = 'IN';

    // Fetch festivals using the service (lazy loading + caching logic)
    const festivals = await FestivalService.getFestivals(country, year, state || undefined, upcomingOnly);

    // Filter results if state was provided to include both national and state festivals
    // (The service already does this, but we ensure it here)
    const data = festivals.map(f => ({
      ...f,
      id: f.id.toString() // Stringify BigInt
    }));

    return NextResponse.json({
      res: "success",
      message: 'Festivals fetched successfully',
      data: data
    });
  } catch (error: any) {
    console.error('Error in festivals route:', error);
    return NextResponse.json({ 
      res: "error", 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 });
  }
}
