import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService } from '@/lib/services/payment-service';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('x-razorpay-signature');

    // Get Webhook Secret from DB
    const gateway = await prisma.paymentMethod.findUnique({ where: { name: 'razorpay' } });
    const config = (gateway?.config as any) || {};
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || config.webhookSecret;

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (sig !== expectedSig) {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    if (event === 'order.paid') {
      const orderId = payload.payload.order.entity.id;
      const notes = payload.payload.order.entity.notes;
      const userId = BigInt(notes.userId);
      const tierKey = notes.tierKey;

      await PaymentService.upgradeUser(userId, tierKey, orderId);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
