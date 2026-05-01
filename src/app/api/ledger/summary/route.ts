import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response;

    const businessId = check.businessId;
    const type = req.nextUrl.searchParams.get('type');

    const transactions = await prisma.ledgerTransaction.findMany({
      where: {
        ledgerAccount: {
          businessId: businessId,
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
      res: true,
      message: 'Summary fetched successfully',
      data: {
        totalGet,
        totalGive,
        netBalance: totalGet - totalGive,
      },
    });
  } catch (error) {
    console.error('Error fetching ledger summary:', error);
    return NextResponse.json({ res: false, message: 'Internal server error' }, { status: 500 });
  }
}
