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
export async function POST(request: Request) {
  // 1. Security Check (Using API Key for Admin tools)
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  try {
    const { title, body, imageUrl, channelId, target, topic, userId, data } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ success: false, message: 'Title and Body are required' }, { status: 400 });
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
        return NextResponse.json({ success: false, message: 'No active device tokens found for this user' }, { status: 404 });
      }

      // Send to all tokens of this user
      const promises = tokens.map(t => NotificationService.sendToToken(t.fcmToken!, title, body, imageUrl, channelId, data));
      const results = await Promise.all(promises);
      
      const successCount = results.filter(r => r.success).length;
      result = { success: successCount > 0, details: results };
    } 
    else {
      return NextResponse.json({ success: false, message: 'Invalid target or missing parameters' }, { status: 400 });
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Notification sent successfully' : 'Failed to send notification',
      details: result
    });

  } catch (error: any) {
    console.error('[AdminNotificationAPI] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
