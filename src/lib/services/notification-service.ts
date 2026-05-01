import * as admin from 'firebase-admin';
import prisma from '../prisma';

export class NotificationService {
  private static isInitialized = false;

  private static async initialize() {
    if (this.isInitialized) return;

    if (!admin.apps.length) {
      try {
        console.log('[NotificationService] Initializing Firebase Admin...');
        const fcmConfig = await prisma.externalServiceConfig.findFirst({
          where: { 
            category: 'notifications',
            provider: 'firebase',
            isActive: true 
          }
        });

        if (fcmConfig && fcmConfig.config) {
          const config: any = fcmConfig.config;
          const projectId = config.project_id || config.projectId;
          const clientEmail = config.client_email || config.clientEmail;
          const privateKey = config.private_key || config.privateKey;

          console.log('[NotificationService] Using DB configuration for Project:', projectId);
          
          if (!projectId || !clientEmail || !privateKey) {
            throw new Error('Incomplete Firebase configuration in database (missing projectId, clientEmail or privateKey)');
          }

          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
          });
        } else {
          console.log('[NotificationService] No DB config found, using environment variables.');
          // Fallback to default initialization (expects GOOGLE_APPLICATION_CREDENTIALS or standard envs)
          admin.initializeApp();
        }
      } catch (error) {
        console.error('[NotificationService] Initialization error:', error);
        // If it fails, we don't set isInitialized to true so it can retry
        return;
      }
    }
    this.isInitialized = true;
    console.log('[NotificationService] Firebase Admin successfully initialized.');
  }

  /**
   * Send notification to a specific device token
   */
  static async sendToToken(token: string, title: string, body: string, imageUrl?: string, channelId?: string, data?: any, sound?: string) {
    await this.initialize();
    try {
      const message: admin.messaging.Message = {
        token,
        notification: { 
          title, 
          body,
          imageUrl: imageUrl || undefined 
        },
        data: {
          ...(data || {}),
          channelId: channelId || 'smm_post_alerts',
          sound: sound || 'default'
        },
        android: {
          priority: 'high',
          notification: {
            sound: sound || 'default',
            channelId: channelId || 'smm_post_alerts',
            imageUrl: imageUrl || undefined,
          },
        },
        apns: {
          payload: {
            aps: {
              mutableContent: imageUrl ? true : false,
              sound: sound ? `${sound}.caf` : 'default',
            },
          },
          fcmOptions: {
            imageUrl: imageUrl || undefined,
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log('[NotificationService] Successfully sent to token:', response);
      return { success: true, messageId: response };
    } catch (error: any) {
      console.error('[NotificationService] Error sending to token:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to a specific topic
   */
  static async sendToTopic(topic: string, title: string, body: string, imageUrl?: string, channelId?: string, data?: any, sound?: string) {
    await this.initialize();
    try {
      console.log(`[NotificationService] Sending topic notification to "${topic}"...`);
      const message: admin.messaging.Message = {
        topic,
        notification: { 
          title, 
          body,
          imageUrl: imageUrl || undefined
        },
        data: {
          ...(data || {}),
          channelId: channelId || 'smm_post_alerts',
          sound: sound || 'default',
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // Legacy but helpful
        },
        android: {
          priority: 'high',
          notification: {
            imageUrl: imageUrl || undefined,
            channelId: channelId || 'smm_post_alerts',
            sound: sound || 'default',
          }
        },
        apns: {
          payload: {
            aps: {
              sound: sound ? `${sound}.caf` : 'default',
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('[NotificationService] Successfully sent to topic:', response);
      return { success: true, messageId: response };
    } catch (error: any) {
      console.error('[NotificationService] Error sending to topic:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to ALL users (Broadcast)
   */
  static async broadcast(title: string, body: string, imageUrl?: string, channelId?: string, data?: any, sound?: string) {
    return await this.sendToTopic('all_users', title, body, imageUrl, channelId, data, sound);
  }

  /**
   * Send notification to a specific user (all their devices)
   */
  static async sendNotificationToUser(userId: bigint | string, title: string, body: string, imageUrl?: string, channelId?: string, data?: any, sound?: string) {
    await this.initialize();
    try {
      const tokens = await prisma.deviceToken.findMany({
        where: { 
          userId: typeof userId === 'string' ? BigInt(userId) : userId,
          isActive: true,
          fcmToken: { not: null }
        },
        distinct: ['fcmToken'],
        select: { fcmToken: true }
      });

      if (!tokens || tokens.length === 0) {
        console.log(`[NotificationService] No active tokens found for user: ${userId}`);
        return { success: false, error: 'No active tokens found' };
      }

      console.log(`[NotificationService] Sending notification to ${tokens.length} devices for user ${userId}`);
      
      const results = await Promise.all(
        tokens.map(t => this.sendToToken(t.fcmToken!, title, body, imageUrl, channelId, data, sound))
      );

      return { 
        success: results.some(r => r.success), 
        details: results 
      };
    } catch (error: any) {
      console.error(`[NotificationService] Error sending to user ${userId}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}
