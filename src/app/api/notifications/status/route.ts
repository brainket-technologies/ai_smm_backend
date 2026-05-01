import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';

export async function PATCH(request: Request) {
  try {
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const { userId, notificationId, markAll } = await request.json();
    const uId = auth.userId || (userId ? BigInt(userId) : null);

    if (!uId) {
      return NextResponse.json({ res: false, message: 'Missing userId' }, { status: 400 });
    }

    if (markAll) {
      // Mark all visible notifications as read for this user
      // We first find all notifications the user can see
      const visibleNotifications = await prisma.notifications.findMany({
        where: {
          OR: [{ userId: uId }, { isGlobal: true }],
          states: { none: { userId: uId, isDeleted: true } }
        },
        select: { id: true }
      });

      const promises = visibleNotifications.map(n => 
        prisma.userNotificationState.upsert({
          where: { userId_notificationId: { userId: uId, notificationId: n.id } },
          update: { isRead: true },
          create: { userId: uId, notificationId: n.id, isRead: true }
        })
      );
      
      await Promise.all(promises);

      return NextResponse.json({ res: true, message: 'All marked as read' });
    }

    if (!notificationId) {
      return NextResponse.json({ res: false, message: 'Missing notificationId' }, { status: 400 });
    }

    const nId = BigInt(notificationId);

    await prisma.userNotificationState.upsert({
      where: {
        userId_notificationId: {
          userId: uId,
          notificationId: nId
        }
      },
      update: { isRead: true },
      create: {
        userId: uId,
        notificationId: nId,
        isRead: true
      }
    });

    return NextResponse.json({ res: true, message: 'Marked as read' });

  } catch (error: any) {
    console.error('[API Notifications Patch] Error:', error);
    return NextResponse.json({ res: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const { userId, notificationId, clearAll } = await request.json();
    const uId = auth.userId || (userId ? BigInt(userId) : null);

    if (!uId) {
      return NextResponse.json({ res: false, message: 'Missing userId' }, { status: 400 });
    }

    if (clearAll) {
      const visibleNotifications = await prisma.notifications.findMany({
        where: {
          OR: [{ userId: uId }, { isGlobal: true }]
        },
        select: { id: true }
      });

      const promises = visibleNotifications.map(n => 
        prisma.userNotificationState.upsert({
          where: { userId_notificationId: { userId: uId, notificationId: n.id } },
          update: { isDeleted: true },
          create: { userId: uId, notificationId: n.id, isDeleted: true }
        })
      );
      
      await Promise.all(promises);
      return NextResponse.json({ res: true, message: 'All cleared' });
    }

    if (!notificationId) {
      return NextResponse.json({ res: false, message: 'Missing notificationId' }, { status: 400 });
    }

    await prisma.userNotificationState.upsert({
      where: { userId_notificationId: { userId: uId, notificationId: BigInt(notificationId) } },
      update: { isDeleted: true },
      create: { userId: uId, notificationId: BigInt(notificationId), isDeleted: true }
    });

    return NextResponse.json({ res: true, message: 'Notification cleared' });

  } catch (error: any) {
    return NextResponse.json({ res: false, message: error.message }, { status: 500 });
  }
}
