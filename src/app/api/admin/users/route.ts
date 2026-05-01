import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
  // Use the standard utility for API key validation
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  try {
    // Fetch users who have at least one active device with an FCM token
    const users = await prisma.user.findMany({
      where: { 
        isDeleted: false,
        deviceTokens: {
          some: {
            isActive: true,
            fcmToken: { not: null }
          }
        }
      },
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

    return NextResponse.json({ res: "success", users: serializedUsers });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ res: "error", message: 'Internal Server Error' }, { status: 500 });
  }
}
