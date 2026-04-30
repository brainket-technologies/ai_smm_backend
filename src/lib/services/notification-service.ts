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
          console.log('[NotificationService] Using DB configuration for Project:', config.projectId);
          
          if (!config.projectId || !config.clientEmail || !config.privateKey) {
            throw new Error('Incomplete Firebase configuration in database');
          }

          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: config.projectId,
              clientEmail: config.clientEmail,
              privateKey: config.privateKey.replace(/\\n/g, '\n'),
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
  static async sendToToken(token: string, title: string, body: string, imageUrl?: string, channelId?: string, data?: any) {
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
          channelId: channelId || 'smm_post_alerts'
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: channelId || 'smm_post_alerts',
            imageUrl: imageUrl || undefined,
          },
        },
        apns: {
          payload: {
            aps: {
              mutableContent: imageUrl ? true : false,
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
  static async sendToTopic(topic: string, title: string, body: string, imageUrl?: string, channelId?: string, data?: any) {
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
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // Legacy but helpful
        },
        android: {
          priority: 'high',
          notification: {
            imageUrl: imageUrl || undefined,
            channelId: channelId || 'smm_post_alerts',
            sound: 'default',
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
  static async broadcast(title: string, body: string, imageUrl?: string, channelId?: string, data?: any) {
    return await this.sendToTopic('all_users', title, body, imageUrl, channelId, data);
  }
}
