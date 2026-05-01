import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const businessId = req.headers.get('x-business-id');
    const type = req.nextUrl.searchParams.get('type');
    
    if (!businessId) {
      return NextResponse.json({ error: 'x-business-id header is required' }, { status: 400 });
    }

    const transactions = await prisma.ledgerTransaction.findMany({
      where: {
        ledgerAccount: {
          businessId: BigInt(businessId),
          ...(type ? { type } : {}),
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
      success: true,
      message: 'Summary fetched successfully',
      data: {
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
