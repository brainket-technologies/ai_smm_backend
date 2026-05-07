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

    // Fetch business location as fallback
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
        if (countryData) country = countryData.iso2;
      }
      
      if (!state && business.stateId) {
        const stateData = await prisma.state.findUnique({
          where: { id: parseInt(business.stateId) }
        });
        if (stateData) state = stateData.stateCode;
      }
    }

    if (!country) country = 'IN';

    // Fetch festivals using the service (lazy loading + caching logic)
    const festivals = await FestivalService.getFestivals(country, year, state || undefined, upcomingOnly);

    // Fetch posts for this business to show in the planner
    const posts = await prisma.post.findMany({
      where: {
        businessId: businessId,
        status: {
          in: ['SCHEDULED', 'PUBLISHED', 'PARTIAL']
        }
      },
      include: {
        media: {
          include: {
            media: true
          }
        },
        platformStatus: {
          include: {
            platform: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    const festivalData = festivals.map(f => ({
      ...f,
      id: f.id.toString()
    }));

    const postData = posts.map(p => ({
      ...p,
      id: p.id.toString(),
      businessId: p.businessId.toString(),
      ctaButtonId: p.ctaButtonId?.toString(),
      media: p.media.map(m => ({
        ...m,
        id: m.id.toString(),
        postId: m.postId.toString(),
        mediaId: m.mediaId.toString(),
        media: {
          ...m.media,
          id: m.media.id.toString(),
          userId: m.media.userId?.toString(),
          businessId: m.media.businessId?.toString(),
          relatedId: m.media.relatedId?.toString()
        }
      })),
      platformStatus: p.platformStatus.map(ps => ({
        ...ps,
        id: ps.id.toString(),
        postId: ps.postId.toString(),
        platformId: ps.platformId.toString(),
        platform: {
          ...ps.platform,
          id: ps.platform.id.toString(),
          mediaId: ps.platform.mediaId?.toString()
        }
      }))
    }));

    return NextResponse.json({
      res: "success",
      message: 'Planner data fetched successfully',
      data: {
        festivals: festivalData,
        posts: postData
      }
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
