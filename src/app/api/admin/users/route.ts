import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apikey = request.headers.get('apikey');

  // Basic API key protection
  if (apikey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Handle BigInt conversion
    const serializedUsers = users.map(user => ({
      ...user,
      id: user.id.toString()
    }));

    return NextResponse.json({ success: true, users: serializedUsers });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
