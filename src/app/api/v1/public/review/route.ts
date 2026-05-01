import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { NotificationService } from "@/lib/services/notification-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, rating, customerName, comment, selectedTags } = body;

    if (!businessId || !rating) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Save review in DB
    const review = await prisma.review.create({
      data: {
        businessId: BigInt(businessId),
        rating: parseInt(rating),
        customerName: customerName || 'Anonymous',
        comment: comment || '',
        selectedTags: selectedTags || []
      }
    });

    // 2. Fetch business owner
    const business = await prisma.business.findUnique({
      where: { id: BigInt(businessId) },
      select: { 
        name: true, 
        ownerId: true 
      }
    });

    if (business) {
      // 3. Send Push Notification to owner
      // We use a custom type 'business_review' so the app can play a custom sound
      await NotificationService.sendNotificationToUser(
        business.ownerId,
        {
          title: "New Business Review! ⭐",
          body: `${customerName || 'A customer'} gave ${business.name} a ${rating}-star review.`,
          channelId: "smm_reviews",
          data: {
            reviewId: review.id.toString(),
            businessId: businessId.toString(),
            rating: rating.toString()
          }
        }
      );
    }

    return NextResponse.json({ 
      message: "Review submitted successfully", 
      reviewId: review.id.toString() 
    });

  } catch (error: any) {
    console.error("Review Submission Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
