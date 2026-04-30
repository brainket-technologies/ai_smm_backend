import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get('userId');
    const apikey = request.headers.get('x-api-key');

    if (!validateApiKey(apikey)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!userIdStr) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    const userId = BigInt(userIdStr);

    // 1. Get all notifications for this user or global
    // 2. Filter out deleted ones
    // 3. Get read status from UserNotificationState
    
    const notifications = await prisma.notifications.findMany({
      where: {
        OR: [
          { userId: userId },
          { isGlobal: true }
        ],
        states: {
          none: {
            userId: userId,
            isDeleted: true
          }
        }
      },
      include: {
        states: {
          where: {
            userId: userId
          },
          select: {
            isRead: true
          }
        },
        media: {
          select: {
            url: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 for performance
    });

    const formattedNotifications = notifications.map(n => ({
      id: n.id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      isGlobal: n.isGlobal,
      isRead: n.states.length > 0 ? n.states[0].isRead : false,
      createdAt: n.createdAt,
      imageUrl: n.media?.url || null,
      actionUrl: n.actionUrl
    }));

    return NextResponse.json({ 
      success: true, 
      notifications: formattedNotifications 
    });

  } catch (error: any) {
    console.error('[API Notifications] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
