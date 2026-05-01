import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth-utils';
import { NotificationService } from '@/lib/services/notification-service';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/notifications
 * Body: {
 *   title: string,
 *   body: string,
 *   target: 'all' | 'topic' | 'user',
 *   topic?: string,
 *   userId?: string,
 *   data?: any
 * }
 */

export async function GET(request: Request) {
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  try {
    const history = await prisma.notifications.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        media: true
      }
    });

    const serializedHistory = history.map(item => ({
      ...item,
      id: item.id.toString(),
      mediaId: item.mediaId?.toString()
    }));

    return NextResponse.json({ res: "success", history: serializedHistory });
  } catch (error: any) {
    console.error('[AdminNotificationHistoryAPI] Error:', error);
    return NextResponse.json({ res: "error", message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // 1. Security Check (Using API Key for Admin tools)
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  try {
    const { title, body, imageUrl, channelId, target, topic, userId, data } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ res: "error", message: 'Title and Body are required' }, { status: 400 });
    }

    let result;

    if (target === 'all') {
      // Broadcast to all users
      result = await NotificationService.broadcast(title, body, imageUrl, channelId, data);
    } 
    else if (target === 'topic' && topic) {
      // Send to specific topic
      result = await NotificationService.sendToTopic(topic, title, body, imageUrl, channelId, data);
    } 
    else if (target === 'user' && userId) {
      // Send to specific user (Fetch their tokens)
      const tokens = await prisma.deviceToken.findMany({
        where: { 
          userId: BigInt(userId),
          isActive: true,
          fcmToken: { not: null }
        },
        select: { fcmToken: true }
      });

      if (tokens.length === 0) {
        return NextResponse.json({ res: "error", message: 'No active device tokens found for this user' }, { status: 404 });
      }

      // Send to all tokens of this user
      const promises = tokens.map(t => NotificationService.sendToToken(t.fcmToken!, title, body, imageUrl, channelId, data));
      const results = await Promise.all(promises);
      
      const successCount = results.filter(r => r.success).length;
      result = { res: successCount > 0, details: results };
    } 
    else {
      return NextResponse.json({ res: "error", message: 'Invalid target or missing parameters' }, { status: 400 });
    }

    // 4. Save to History (Optional but good for tracking)
    if (result.success) {
      try {
        await prisma.notifications.create({
          data: {
            title,
            message: body,
            type: channelId || 'general',
            isGlobal: target === 'all',
            // Store target info in metadata if needed, but the basic fields are enough for now
          }
        });
      } catch (saveError) {
        console.error('Failed to save notification to history:', saveError);
        // We don't fail the request if saving history fails, as the notification was sent
      }
    }

    return NextResponse.json({
      res: result.success,
      message: result.success ? 'Notification sent successfully' : 'Failed to send notification',
      details: result
    });

  } catch (error: any) {
    console.error('[AdminNotificationAPI] Error:', error);
    return NextResponse.json({ res: "error", message: error.message }, { status: 500 });
  }
}
