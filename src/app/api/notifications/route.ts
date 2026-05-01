import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateRequest } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const check = await validateRequest(request);
    if (!check.isValid) return check.response!;

    const userId = check.userId;

    const { searchParams } = new URL(request.url);

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
            fileUrl: true
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
      imageUrl: n.media?.fileUrl || null,
      actionUrl: n.actionUrl
    }));

    return NextResponse.json({ 
      res: "success", 
      notifications: formattedNotifications 
    });

  } catch (error: any) {
    console.error('[API Notifications] Error:', error);
    return NextResponse.json({ res: "error", message: error.message }, { status: 500 });
  }
}
