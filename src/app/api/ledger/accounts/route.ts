import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const businessIdHeader = req.headers.get('x-business-id');
    const businessId = businessIdHeader || req.nextUrl.searchParams.get('businessId');
    const type = req.nextUrl.searchParams.get('type'); // CUSTOMER or SUPPLIER
    const search = req.nextUrl.searchParams.get('search');
    const filter = req.nextUrl.searchParams.get('filter'); // all, positive, negative
    const sort = req.nextUrl.searchParams.get('sort'); // newest, oldest, name, balance_high, balance_low

    if (!businessId) {
      return NextResponse.json({ error: 'x-business-id header or businessId query param is required' }, { status: 400 });
    }

    let orderBy: any = { updatedAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    const accounts = await prisma.ledgerAccount.findMany({
      where: {
        businessId: BigInt(businessId),
        ...(type ? { type } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
          },
        },
        profileImage: true,
      },
      orderBy,
    });

    let formattedAccounts = accounts.map(account => {
      let balance = 0;
      account.transactions.forEach(tx => {
        if (tx.type === 'GET') {
          balance += Number(tx.amount);
        } else {
          balance -= Number(tx.amount);
        }
      });

      return {
        ...account,
        id: account.id.toString(),
        businessId: account.businessId.toString(),
        balance,
        transactions: undefined,
        mediaId: account.mediaId?.toString(),
      };
    });

    // Apply Balance Filter
    if (filter === 'positive') {
      formattedAccounts = formattedAccounts.filter(a => a.balance > 0);
    } else if (filter === 'negative') {
      formattedAccounts = formattedAccounts.filter(a => a.balance < 0);
    }

    // Apply Manual Balance Sort if needed
    if (sort === 'balance_high') {
      formattedAccounts.sort((a, b) => b.balance - a.balance);
    } else if (sort === 'balance_low') {
      formattedAccounts.sort((a, b) => a.balance - b.balance);
    }

    return NextResponse.json({
      accounts: formattedAccounts,
    });
  } catch (error) {
    console.error('Error fetching ledger accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const businessIdHeader = req.headers.get('x-business-id');
    const { 
      businessId: bodyBusinessId, type, name, phone, gender, birthday, 
      gstNo, flatBuilding, locality, pincode, city, state, country, mediaId 
    } = body;

    const businessId = businessIdHeader || bodyBusinessId;

    if (!businessId || !type || !name) {
      return NextResponse.json({ error: 'Missing required fields: businessId, type, name' }, { status: 400 });
    }

    const account = await prisma.ledgerAccount.create({
      data: {
        businessId: BigInt(businessId),
        type,
        name,
        phone,
        gender,
        birthday: birthday ? new Date(birthday) : null,
        gstNo,
        flatBuilding,
        locality,
        pincode,
        city,
        state,
        country,
        mediaId: mediaId ? BigInt(mediaId) : null,
      },
    });

    return NextResponse.json({
      message: 'Account created successfully',
      account: {
        ...account,
        id: account.id.toString(),
        businessId: account.businessId.toString(),
        mediaId: account.mediaId?.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating ledger account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      id, name, phone, gender, birthday, 
      gstNo, flatBuilding, locality, pincode, city, state, country, mediaId, type
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const account = await prisma.ledgerAccount.update({
      where: { id: BigInt(id) },
      data: {
        name,
        phone,
        gender,
        birthday: birthday ? new Date(birthday) : undefined,
        gstNo,
        flatBuilding,
        locality,
        pincode,
        city,
        state,
        country,
        type,
        mediaId: mediaId ? BigInt(mediaId) : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Account updated successfully',
      account: {
        ...account,
        id: account.id.toString(),
        businessId: account.businessId.toString(),
        mediaId: account.mediaId?.toString(),
      },
    });
  } catch (error) {
    console.error('Error updating ledger account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // Delete transactions first (or Prisma will handle if cascade is on)
    await prisma.ledgerTransaction.deleteMany({
      where: { ledgerAccountId: BigInt(id) }
    });

    await prisma.ledgerAccount.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting ledger account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
