import { NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const transactions = await prisma.subscriptionTransaction.findMany({
      where: { userId: auth.userId! },
      orderBy: { createdAt: 'desc' }
    });

    // Format for Flutter
    const serializedTransactions = transactions.map(t => ({
      id: t.id.toString(),
      plan_key: t.tierKey,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      gateway: t.gateway,
      order_id: t.gatewayOrderId,
      date: t.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: serializedTransactions
    });

  } catch (error: any) {
    console.error('Fetch Transactions Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
