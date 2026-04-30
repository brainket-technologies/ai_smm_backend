import { validateApiKey, validateAuth } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get('userId');
    const userId = auth.userId || (userIdStr ? BigInt(userIdStr) : null);

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

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
