import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.headers.get('x-business-id');

    if (!businessId) {
      return NextResponse.json({ message: "Business ID is required in 'x-business-id' header" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        businessId: BigInt(businessId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const serializedReviews = reviews.map(review => ({
      ...review,
      id: review.id.toString(),
      businessId: review.businessId.toString()
    }));

    return NextResponse.json({
      success: true,
      data: serializedReviews
    });

  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
