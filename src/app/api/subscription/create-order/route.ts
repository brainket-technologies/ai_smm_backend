import { NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth-utils';
import { PaymentService } from '@/lib/services/payment-service';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const { tierKey } = await request.json();
    if (!tierKey) {
      return NextResponse.json({ success: false, message: 'tierKey is required' }, { status: 400 });
    }

    // Fetch Tier Price
    const tier = await prisma.subscriptionTier.findUnique({
      where: { tierKey }
    });

    if (!tier || tier.tierKey === 'free') {
      return NextResponse.json({ success: false, message: 'Invalid or free tier selected' }, { status: 400 });
    }

    const orderData = await PaymentService.createOrder(
      auth.userId!,
      tierKey,
      Number(tier.priceAmount),
      'INR' // Default to INR, can be dynamic
    );

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: orderData
    });

  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
