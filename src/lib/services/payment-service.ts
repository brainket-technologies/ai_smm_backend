import prisma from '@/lib/prisma';
import Razorpay from 'razorpay';
import Stripe from 'stripe';

export class PaymentService {
  /**
   * Fetches the default payment gateway configuration.
   */
  static async getDefaultGateway() {
    const paymentMethods = await prisma.paymentMethod.findMany({ where: { isActive: true } });
    return paymentMethods.find(p => p.isDefault) || paymentMethods[0];
  }

  /**
   * Creates an order/intent based on the active gateway.
   */
  static async createOrder(userId: bigint, tierKey: string, amount: number, currency: string = 'INR') {
    const gateway = await this.getDefaultGateway();
    if (!gateway) throw new Error('No payment gateway configured.');

    const config = (gateway.config as any) || {};

    if (gateway.name === 'razorpay') {
      const razorpay = new Razorpay({
        key_id: config.keyId,
        key_secret: process.env.RAZORPAY_SECRET_KEY || config.keySecret,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // In paise
        currency,
        receipt: `receipt_${userId}_${Date.now()}`,
        notes: { userId: userId.toString(), tierKey }
      });

      // Save pending transaction
      await prisma.subscriptionTransaction.create({
        data: {
          userId,
          tierKey,
          amount,
          currency,
          gateway: 'razorpay',
          gatewayOrderId: order.id,
          status: 'pending'
        }
      });

      return {
        gateway: 'razorpay',
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: config.keyId
      };
    } else if (gateway.name === 'stripe') {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || config.secretKey, {
        apiVersion: '2025-01-27' as any,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: `${tierKey} Subscription` },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
        metadata: { userId: userId.toString(), tierKey }
      });

      // Save pending transaction
      await prisma.subscriptionTransaction.create({
        data: {
          userId,
          tierKey,
          amount,
          currency,
          gateway: 'stripe',
          gatewayOrderId: session.id,
          status: 'pending'
        }
      });

      return {
        gateway: 'stripe',
        sessionId: session.id,
        publishableKey: config.publishableKey
      };
    }

    throw new Error('Unsupported payment gateway.');
  }

  /**
   * Upgrades user subscription after successful payment.
   */
  static async upgradeUser(userId: bigint, tierKey: string, transactionId: string) {
    const tier = await prisma.subscriptionTier.findUnique({ where: { tierKey } });
    if (!tier) throw new Error('Invalid tier key.');

    // Calculate end date based on price period (month/year)
    const endDate = new Date();
    if (tier.pricePeriod === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Use transaction for atomicity
    return await prisma.$transaction([
      // 1. Update/Create User Subscription
      prisma.userSubscription.upsert({
        where: { id: (await prisma.userSubscription.findFirst({ where: { userId } }))?.id || -1 },
        update: {
          tierKey,
          status: 'active',
          startDate: new Date(),
          endDate: endDate,
          createdAt: new Date()
        },
        create: {
          userId,
          tierKey,
          status: 'active',
          startDate: new Date(),
          endDate: endDate
        }
      }),
      // 2. Update Transaction Status
      prisma.subscriptionTransaction.update({
        where: { gatewayOrderId: transactionId },
        data: { status: 'success' }
      })
    ]);
  }
}
