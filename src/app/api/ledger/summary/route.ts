import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const businessIdHeader = req.headers.get('x-business-id');
    const businessId = businessIdHeader || req.nextUrl.searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'x-business-id header or businessId query param is required' }, { status: 400 });
    }

    const transactions = await prisma.ledgerTransaction.findMany({
      where: {
        ledgerAccount: {
          businessId: BigInt(businessId),
        },
      },
      select: {
        amount: true,
        type: true,
      },
    });

    let totalGet = 0;
    let totalGive = 0;

    transactions.forEach(tx => {
      if (tx.type === 'GET') {
        totalGet += Number(tx.amount);
      } else {
        totalGive += Number(tx.amount);
      }
    });

    return NextResponse.json({
      summary: {
        totalGet,
        totalGive,
        netBalance: totalGet - totalGive,
      },
    });
  } catch (error) {
    console.error('Error fetching ledger summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
