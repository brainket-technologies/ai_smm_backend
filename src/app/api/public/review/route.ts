import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { NotificationService } from "@/lib/services/notification-service";
import { EmailProvider } from "@/lib/services/providers/email-provider";

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

    // 2. Fetch business owner details
    const business = await prisma.business.findUnique({
      where: { id: BigInt(businessId) },
      include: {
        owner: {
          select: {
            email: true,
            id: true
          }
        }
      }
    });

    if (business && business.owner) {
      const ownerEmail = business.owner.email;
      const customer = customerName || 'A customer';

      // 3. Send Push Notification to owner with custom sound
      const notificationTitle = "New Business Review! ⭐";
      const notificationBody = `${customer} gave ${business.name} a ${rating}-star review.`;

      await NotificationService.sendNotificationToUser(
        business.ownerId,
        notificationTitle,
        notificationBody,
        undefined,
        "smm_reviews_v3",
        {
          reviewId: review.id.toString(),
          businessId: businessId.toString(),
          rating: rating.toString()
        },
        "review_notification" // Custom sound filename
      );

      // 4. Save to Database Notifications Table
      await prisma.notifications.create({
        data: {
          userId: business.ownerId,
          title: notificationTitle,
          message: notificationBody,
          type: "business_review",
          actionUrl: `/reviews/${review.id}` // Example action URL
        }
      });

      // 5. Send Email Alert to owner if email exists
      if (ownerEmail) {
        // Fetch SMTP config from DB (same as OTP/Invoice)
        const smtpConfigRecord = await prisma.externalServiceConfig.findFirst({
          where: { category: 'email_otp', provider: 'smtp', isActive: true }
        });

        const appConfig = await prisma.appConfig.findFirst({ 
          orderBy: { createdAt: 'desc' } 
        });

        if (smtpConfigRecord) {
          const smtpConfig = smtpConfigRecord.config as any;
          const stars = "⭐".repeat(parseInt(rating));
          const tagsHtml = (selectedTags || []).map((tag: string) => 
            `<span style="background:#f1f5f9; color:#475569; padding:4px 10px; border-radius:100px; font-size:12px; margin-right:5px; margin-bottom:5px; display:inline-block;">${tag}</span>`
          ).join('');

          await EmailProvider.sendEmail(
            ownerEmail,
            `New ${rating}-Star Review for ${business.name}`,
            `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #0f172a; margin-bottom: 8px;">New Business Review</h2>
                <div style="font-size: 24px; margin-bottom: 16px;">${stars}</div>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase;">Customer</p>
                <p style="margin: 0 0 20px 0; font-size: 18px; color: #0f172a; font-weight: bold;">${customer}</p>
                
                ${comment ? `
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase;">Comment</p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #334155; line-height: 1.5; font-style: italic;">"${comment}"</p>
                ` : ''}
                
                ${selectedTags && selectedTags.length > 0 ? `
                  <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase;">Feedback Tags</p>
                  <div style="margin-bottom: 8px;">${tagsHtml}</div>
                ` : ''}
              </div>
              
              <div style="text-align: center;">
                <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">This review was submitted via your public Social Suite review page.</p>
                <a href="${appConfig?.adminPanelUrl || '#'}" style="background: #0f172a; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">View in Dashboard</a>
              </div>
            </div>
            `,
            undefined,
            smtpConfig
          );
        } else {
          console.warn('[ReviewAPI] No active SMTP configuration found in DB. Email skipped.');
        }
      }
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
