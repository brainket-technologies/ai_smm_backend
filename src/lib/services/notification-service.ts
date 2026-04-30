import * as admin from 'firebase-admin';
import prisma from '../prisma';

export class NotificationService {
  private static isInitialized = false;

  private static async initialize() {
    if (this.isInitialized) return;

    if (!admin.apps.length) {
      try {
        const fcmConfig = await prisma.externalServiceConfig.findFirst({
          where: { 
            category: 'notifications',
            provider: 'firebase',
            isActive: true 
          }
        });

        if (fcmConfig && fcmConfig.config) {
          const config: any = fcmConfig.config;
          
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: config.projectId,
              clientEmail: config.clientEmail,
              privateKey: config.privateKey?.replace(/\\n/g, '\n'),
            }),
          });
          console.log('[NotificationService] Firebase Admin initialized from DB config.');
        } else {
          admin.initializeApp();
          console.log('[NotificationService] Firebase Admin initialized with default credentials.');
        }
      } catch (error) {
        console.error('[NotificationService] Initialization error:', error);
      }
    }
    this.isInitialized = true;
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
      return { success: true, response };
    } catch (error) {
      console.error('[NotificationService] Error sending to token:', error);
      return { success: false, error };
    }
  }

  /**
   * Send notification to a specific topic
   */
  static async sendToTopic(topic: string, title: string, body: string, imageUrl?: string, channelId?: string, data?: any) {
    await this.initialize();
    try {
      const message: admin.messaging.Message = {
        topic,
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
          notification: {
            imageUrl: imageUrl || undefined,
            channelId: channelId || 'smm_post_alerts',
          }
        }
      };

      const response = await admin.messaging().send(message);
      return { success: true, response };
    } catch (error) {
      console.error('[NotificationService] Error sending to topic:', error);
      return { success: false, error };
    }
  }

  /**
   * Send notification to ALL users (Broadcast)
   */
  static async broadcast(title: string, body: string, imageUrl?: string, channelId?: string, data?: any) {
    return await this.sendToTopic('all_users', title, body, imageUrl, channelId, data);
  }
}
