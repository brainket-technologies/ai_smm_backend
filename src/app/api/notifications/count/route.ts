import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateRequest } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const check = await validateRequest(request);
    if (!check.isValid) return check.response!;

    const userId = check.userId;

    const { searchParams } = new URL(request.url);

    // Count notifications where:
    // 1. (userId = current OR isGlobal = true)
    // 2. State doesn't exist (means unread) OR State exists but isRead = false
    // 3. State doesn't have isDeleted = true

    const count = await prisma.notifications.count({
      where: {
        OR: [{ userId: userId }, { isGlobal: true }],
        states: {
          none: {
            userId: userId,
            OR: [
              { isRead: true },
              { isDeleted: true }
            ]
          }
        }
      }
    });

    return NextResponse.json({ res: "success", message: 'Notification count fetched successfully', data: { count } });

  } catch (error: any) {
    return NextResponse.json({ res: "error", message: error.message }, { status: 500 });
  }
}
