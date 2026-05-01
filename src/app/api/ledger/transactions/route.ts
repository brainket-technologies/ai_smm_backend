import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response;

    const body = await req.json();
    const { ledgerAccountId, type, amount, note, date, ref, productId, serviceId } = body;

    if (!ledgerAccountId || !type || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await prisma.ledgerTransaction.create({
      data: {
        ledgerAccountId: BigInt(ledgerAccountId),
        type,
        amount: Number(amount),
        note,
        ref: ref || `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: date ? new Date(date) : new Date(),
        productId: productId ? BigInt(productId) : null,
        serviceId: serviceId ? BigInt(serviceId) : null,
      },
      include: {
        product: { select: { name: true } },
        service: { select: { name: true } },
      }
    });

    // Update account updatedAt
    await prisma.ledgerAccount.update({
      where: { id: BigInt(ledgerAccountId) },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction recorded successfully',
      data: {
        ...transaction,
        id: transaction.id.toString(),
        ledgerAccountId: transaction.ledgerAccountId.toString(),
        productId: transaction.productId?.toString(),
        serviceId: transaction.serviceId?.toString(),
      },
    });
  } catch (error) {
    console.error('Error recording ledger transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const check = await validateRequest(req);
    if (!check.isValid) return check.response;

    const ledgerAccountId = req.nextUrl.searchParams.get('ledgerAccountId');

    if (!ledgerAccountId) {
      return NextResponse.json({ error: 'ledgerAccountId is required' }, { status: 400 });
    }

    const transactions = await prisma.ledgerTransaction.findMany({
      where: { ledgerAccountId: BigInt(ledgerAccountId) },
      orderBy: { date: 'desc' },
      include: {
        product: { select: { name: true } },
        service: { select: { name: true } },
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Transactions fetched successfully',
      data: transactions.map(tx => ({
        ...tx,
        id: tx.id.toString(),
        ledgerAccountId: tx.ledgerAccountId.toString(),
        productId: tx.productId?.toString(),
        serviceId: tx.serviceId?.toString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching ledger transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
