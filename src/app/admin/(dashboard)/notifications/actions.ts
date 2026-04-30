"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NotificationService } from "@/lib/services/notification-service";

export async function getUsersWithTokens() {
  try {
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

    return {
      success: true,
      users: users.map(u => ({
        ...u,
        id: u.id.toString()
      }))
    };
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return { success: false, message: error.message };
  }
}

export async function getNotificationHistory() {
  try {
    const history = await prisma.notifications.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        media: true
      }
    });

    return {
      success: true,
      history: history.map(item => ({
        ...item,
        id: item.id.toString(),
        mediaId: item.mediaId?.toString(),
        createdAt: item.createdAt?.toISOString() || new Date().toISOString()
      }))
    };
  } catch (error: any) {
    console.error("Error fetching notification history:", error);
    return { success: false, message: error.message };
  }
}

export async function sendNotification(formData: any) {
  try {
    const { title, body, imageUrl, channelId, target, userId, sound } = formData;

    if (!title || !body) {
      return { success: false, message: 'Title and Body are required' };
    }

    // 4. Handle MediaId if imageUrl exists
    let mediaId = null;
    if (imageUrl) {
      const media = await prisma.mediaFile.findFirst({
        where: { fileUrl: imageUrl }
      });
      
      if (media) {
        mediaId = media.id;
      } else {
        const newMedia = await prisma.mediaFile.create({
          data: {
            fileUrl: imageUrl,
            fileType: 'image',
            mediaCategory: 'notification'
          }
        });
        mediaId = newMedia.id;
      }
    }

    // 5. Save to History
    let notification;
    try {
      notification = await prisma.notifications.create({
        data: {
          title,
          message: body,
          type: channelId || 'general',
          isGlobal: target === 'all',
          mediaId: mediaId,
        }
      });
      revalidatePath("/admin/notifications");
    } catch (saveError) {
      console.error('Failed to save notification to history:', saveError);
    }

    let result;
    const data = { channelId, sound };

    if (target === 'all') {
      result = await NotificationService.broadcast(title, body, imageUrl, channelId, data);
    } 
    else if (target === 'user' && userId) {
      const tokens = await prisma.deviceToken.findMany({
        where: { 
          userId: BigInt(userId),
          isActive: true,
          fcmToken: { not: null }
        },
        select: { fcmToken: true }
      });

      if (tokens.length === 0) {
        return { 
          success: false, 
          message: 'No active device tokens found for this user. The attempt was logged in history.' 
        };
      }

      const promises = tokens.map(t => NotificationService.sendToToken(t.fcmToken!, title, body, imageUrl, channelId, data));
      const results = await Promise.all(promises);
      
      const successCount = results.filter(r => r.success).length;
      result = { success: successCount > 0, details: results };
    } 
    else if (target === 'token' && formData.directToken) {
      result = await NotificationService.sendToToken(formData.directToken, title, body, imageUrl, channelId, data);
    }
    else {
      return { success: false, message: 'Invalid target or missing parameters' };
    }

    return { 
      success: result.success, 
      message: result.success ? 'Sent successfully' : 'Failed to send to FCM. Check Firebase configuration.' 
    };
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return { success: false, message: error.message };
  }
}
