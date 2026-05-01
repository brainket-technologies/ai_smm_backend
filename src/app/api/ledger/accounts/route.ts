import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const businessId = req.headers.get('x-business-id');
    const id = req.nextUrl.searchParams.get('id');
    const type = req.nextUrl.searchParams.get('type'); // CUSTOMER or SUPPLIER
    const search = req.nextUrl.searchParams.get('search');
    const filter = req.nextUrl.searchParams.get('filter'); // all, positive, negative
    const sort = req.nextUrl.searchParams.get('sort'); // newest, oldest, name, balance_high, balance_low

    if (!businessId) {
      return NextResponse.json({ error: 'x-business-id header is required' }, { status: 400 });
    }

    if (id) {
      const account = await prisma.ledgerAccount.findUnique({
        where: { id: BigInt(id) },
        include: {
          transactions: {
            select: { amount: true, type: true }
          },
          profileImage: true,
        }
      });

      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

      let balance = 0;
      account.transactions.forEach(tx => {
        if (tx.type === 'GET') balance += Number(tx.amount);
        else balance -= Number(tx.amount);
      });

      const serializedAccount = JSON.parse(JSON.stringify({ ...account, balance, transactions: undefined }, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return NextResponse.json({ success: true, message: 'Account fetched successfully', data: serializedAccount });
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

    const formattedAccounts = accounts.map(account => {
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
        balance,
        transactions: undefined,
      };
    });

    // Apply Balance Filter
    let filteredAccounts = [...formattedAccounts];
    if (filter === 'positive') {
      filteredAccounts = filteredAccounts.filter(a => a.balance > 0);
    } else if (filter === 'negative') {
      filteredAccounts = filteredAccounts.filter(a => a.balance < 0);
    }

    // Apply Manual Balance Sort if needed
    if (sort === 'balance_high') {
      filteredAccounts.sort((a, b) => b.balance - a.balance);
    } else if (sort === 'balance_low') {
      filteredAccounts.sort((a, b) => a.balance - b.balance);
    }

    // Stringify BigInts
    const serializedAccounts = JSON.parse(JSON.stringify(filteredAccounts, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json({
      success: true,
      message: 'Accounts fetched successfully',
      data: serializedAccounts,
    });
  } catch (error: any) {
    console.error('Error fetching ledger accounts:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const businessId = req.headers.get('x-business-id');
    const body = await req.json();
    const { 
      type, name, phone, gender, birthday, 
      gstNo, flatBuilding, locality, pincode, city, state, country, mediaId 
    } = body;

    if (!businessId || !type || !name) {
      return NextResponse.json({ error: 'Missing required fields: x-business-id header, type, name' }, { status: 400 });
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
      success: true,
      message: 'Account created successfully',
      data: {
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
      success: true,
      message: 'Account updated successfully',
      data: {
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

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting ledger account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
