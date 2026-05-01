import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.headers.get('x-business-id');
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const ratingFilter = searchParams.get('rating'); // Filter by rating (e.g. '5')
    const skip = (page - 1) * limit;

    if (!businessId) {
      return NextResponse.json({ message: "Business ID is required in 'x-business-id' header" }, { status: 400 });
    }

    const where: any = {
      businessId: BigInt(businessId)
    };

    if (ratingFilter) {
      where.rating = parseInt(ratingFilter);
    }

    // Fetch reviews with pagination
    const [reviews, totalCount, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where: { businessId: BigInt(businessId) },
        _avg: { rating: true },
        _count: { _all: true }
      })
    ]);

    const serializedReviews = reviews.map(review => ({
      ...review,
      id: review.id.toString(),
      businessId: review.businessId.toString()
    }));

    return NextResponse.json({
      res: "success",
      data: serializedReviews,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      },
      summary: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count._all || 0
      }
    });

  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
