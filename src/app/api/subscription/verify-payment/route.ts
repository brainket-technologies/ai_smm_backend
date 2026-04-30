import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService } from '@/lib/services/payment-service';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // 1. Get Razorpay Secret
    const gateway = await prisma.paymentMethod.findUnique({ where: { name: 'razorpay' } });
    const config = (gateway?.config as any) || {};
    const secret = process.env.RAZORPAY_KEY_SECRET || config.key_secret || config.keySecret || config.live?.keySecret;

    if (!secret) {
      return NextResponse.json({ success: false, message: 'Razorpay secret not configured' }, { status: 500 });
    }

    // 2. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
    }

    // 3. Update Subscription (Find User from Transaction)
    // Find the order to get the tierKey and userId
    const transaction = await prisma.subscriptionTransaction.findFirst({
      where: { gatewayOrderId: razorpay_order_id },
      orderBy: { createdAt: 'desc' }
    });

    if (!transaction) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (!transaction.userId) {
        return NextResponse.json({ success: false, message: 'User not associated with order' }, { status: 400 });
    }

    await PaymentService.upgradeUser(
      BigInt(transaction.userId), 
      transaction.tierKey, 
      razorpay_order_id
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Payment verified and subscription activated' 
    });

  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
