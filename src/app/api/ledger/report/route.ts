import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth-utils';
import { startOfWeek, startOfMonth, startOfYear, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response;

    const businessId = check.businessId;
    const type = req.nextUrl.searchParams.get('type'); // CUSTOMER | SUPPLIER
    const period = req.nextUrl.searchParams.get('period') || 'Monthly'; // Weekly | Monthly | Yearly

    let startDate = new Date();
    const endDate = endOfDay(new Date());

    if (period === 'Weekly') {
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    } else if (period === 'Monthly') {
      startDate = startOfMonth(new Date());
    } else if (period === 'Yearly') {
      startDate = startOfYear(new Date());
    }

    // Fetch transactions
    const transactions = await prisma.ledgerTransaction.findMany({
      where: {
        ledgerAccount: {
          businessId: businessId,
          ...(type ? { type } : {}),
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        service: true,
        product: true,
      },
    });

    let income = 0; // GET
    let expense = 0; // GIVE
    const breakdownMap: Record<string, { amount: number; name: string }> = {};

    transactions.forEach(tx => {
      const amount = Number(tx.amount);
      if (tx.type === 'GET') {
        income += amount;
      } else {
        expense += amount;
      }

      // Breakdown logic
      let categoryName = 'Others';
      if (tx.service) {
        categoryName = tx.service.name;
      } else if (tx.product) {
        categoryName = tx.product.name;
      }

      if (!breakdownMap[categoryName]) {
        breakdownMap[categoryName] = { name: categoryName, amount: 0 };
      }
      breakdownMap[categoryName].amount += amount;
    });

    const totalFlow = income + expense;
    
    // Sort and calculate percentages for breakdown
    const breakdown = Object.values(breakdownMap)
      .map(item => ({
        ...item,
        percentage: totalFlow > 0 ? Math.round((item.amount / totalFlow) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      res: "success",
      message: 'Report fetched successfully',
      data: {
        totalFlow,
        income,
        expense,
        breakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching ledger report:', error);
    return NextResponse.json({ res: "error", message: 'Internal server error' }, { status: 500 });
  }
}
