import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PaymentService } from '@/lib/services/payment-service';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;

    // Get Webhook Secret from DB
    const gateway = await prisma.paymentMethod.findUnique({ where: { name: 'stripe' } });
    const config = (gateway?.config as any) || {};
    const secret = process.env.STRIPE_WEBHOOK_SECRET || config.webhookSecret;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || config.secretKey, {
      apiVersion: '2025-01-27' as any,
    });

    const event = stripe.webhooks.constructEvent(body, sig, secret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = BigInt(session.metadata!.userId);
      const tierKey = session.metadata!.tierKey;
      const orderId = session.id;

      await PaymentService.upgradeUser(userId, tierKey, orderId);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Stripe Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
