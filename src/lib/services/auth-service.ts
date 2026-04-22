import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { SmsProvider } from './providers/sms-provider';
import { EmailProvider } from './providers/email-provider';
import { SocialProvider } from './providers/social-provider';

export class AuthService {
  /**
   * Sends OTP to the specified value (phone or email).
   */
  static async sendOtp(type: 'phone' | 'email', value: string, deviceId?: string, deviceType?: string) {
    try {
      // 1. Fetch Active Provider Configuration
      const category = type === 'phone' ? 'phone_otp' : 'email_otp';
      const activeConfig = await prisma.externalServiceConfig.findFirst({
        where: { category, isActive: true },
        orderBy: { isDefault: 'desc' },
      });

      if (!activeConfig) {
        throw new Error(`No active ${type} OTP provider configured.`);
      }

      // 2. Generate OTP based on provider (Static for now as requested)
      const provider = activeConfig.provider.toLowerCase();
      const isFirebase = provider === 'firebase';
      const isSmtp = provider === 'smtp';
      
      // Use 6 digits OTP for all providers
      let otp = '123456';
      const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // 3. Find or Create User (Upsert)
      let user = await prisma.user.findUnique({
        where: type === 'phone' ? { phone: value } : { email: value },
      });

      if (!user) {
        const userRole = await prisma.role.findUnique({ where: { name: 'User' } });
        user = await prisma.user.create({
          data: {
            [type]: value,
            isVerified: false,
            roleId: userRole?.id,
          },
          include: { role: true, profileMedia: true, deviceTokens: true },
        });
      } else {
        // Re-fetch user with relations
        user = await prisma.user.findUnique({
          where: { id: user.id },
          include: { role: true, profileMedia: true, deviceTokens: true },
        }) as any;
      }

      // 4. Handle Device Linkage if deviceId is provided
      if (deviceId && user) {
        await prisma.deviceToken.upsert({
          where: { userId_deviceId: { userId: user.id, deviceId: deviceId } },
          update: { 
            lastLoggedIn: new Date(), 
            isActive: true,
            deviceType: deviceType || undefined 
          },
          create: {
            userId: user.id,
            deviceId: deviceId,
            deviceType: deviceType || null,
            isActive: true,
            lastLoggedIn: new Date(),
          },
        });
        // Refresh user with new device info
        user = await prisma.user.findUnique({
          where: { id: user.id },
          include: { role: true, profileMedia: true, deviceTokens: true },
        }) as any;
      }

      // 5. Save OTP to Database
      await prisma.otpVerification.create({
        data: {
          [type]: value,
          otp,
          expiry,
        },
      });

      // 6. Send OTP via Provider
      if (type === 'phone') {
        await SmsProvider.send(activeConfig.provider, value, otp, activeConfig.config as any);
      } else {
        await EmailProvider.send(activeConfig.provider, value, otp, activeConfig.config as any);
      }

      // Return full user data, handling BigInt conversion and formatting response
      const userData = JSON.parse(JSON.stringify(user, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      // Format response: add image URL, block status, devices and remove redundant IDs/objects
      const blockCount = await prisma.userBlock.count({ where: { userId: user!.id } });
      
      userData.image = (user as any)!.profileMedia?.fileUrl || null;
      userData.is_blocked = blockCount > 0;
      userData.devices = userData.deviceTokens || [];
      
      delete userData.roleId;
      delete userData.mediaId;
      delete userData.profileMedia;
      delete userData.deviceTokens;
      userData.otp = otp;

      return { 
        success: true, 
        message: `OTP sent successfully to ${value}`,
        data: userData
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) throw new Error('Email already in use by another account.');
        if (error.meta?.target?.includes('phone')) throw new Error('Phone number already in use by another account.');
      }
      throw error;
    }
  }

  /**
   * Verifies OTP and returns user data with JWT and business status.
   */
  static async verifyOtp(type: 'phone' | 'email', value: string, otp: string, deviceId?: string, deviceType?: string) {
    // 1. Find the latest OTP for this value
    const verification = await prisma.otpVerification.findFirst({
      where: { [type]: value },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) throw new Error('OTP not requested.');
    if (verification.otp !== otp) throw new Error('Invalid OTP.');
    if (new Date() > verification.expiry) throw new Error('OTP expired.');

    // 2. Clear used OTP
    await prisma.otpVerification.delete({ where: { id: verification.id } });

    // 3. Get User
    const user = await prisma.user.findUnique({
      where: type === 'phone' ? { phone: value } : { email: value },
    });

    if (!user) throw new Error('User not found.');

    const isNewUser = !user.name;

    // 4. Handle Device Token and Versioning
    let currentVersion = 0;
    if (deviceId) {
      const deviceToken = await prisma.deviceToken.upsert({
        where: { userId_deviceId: { userId: user.id, deviceId } },
        update: { 
          tokenVersion: { increment: 1 },
          deviceType: deviceType || undefined,
          lastLoggedIn: new Date(),
          isActive: true
        },
        create: {
          userId: user.id,
          deviceId,
          deviceType: deviceType || null,
          tokenVersion: 1,
          isActive: true,
          lastLoggedIn: new Date(),
        },
      });
      currentVersion = deviceToken.tokenVersion;
    }

    // 5. Update user verification status
    if (!user.isVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    // 6. Generate JWT
    const token = generateToken(user.id, currentVersion, deviceId);

    // 7. Return full user data
    const userData = await this.getFormattedUserData(user.id);
    const businessExists = await prisma.business.count({ where: { ownerId: user.id } }) > 0;

    return {
      is_new_user: isNewUser,
      has_business: businessExists,
      token,
      user: userData,
    };
  }

  /**
   * Handles Social Login (Google/Apple).
   */
  static async socialLogin(payload: {
    loginType: 'google' | 'apple';
    token: string;
    name?: string;
    email?: string;
    image?: string;
    deviceId?: string;
    deviceType?: string;
  }) {
    try {
      // 1. Verify Social Token
      const activeConfig = await prisma.externalServiceConfig.findFirst({
        where: { category: 'social_login', provider: payload.loginType, isActive: true },
      });

      if (!activeConfig) {
        throw new Error(`Social login via ${payload.loginType} is currently disabled.`);
      }

      const socialData = await SocialProvider.verify(
        payload.loginType,
        payload.token,
        activeConfig.config as any
      );

      const email = payload.email || socialData.email;
      const socialId = socialData.id;

      if (!email) {
        throw new Error('Email is required for social login but was not provided by the provider.');
      }

      // 2. Account Linking Logic
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { [payload.loginType === 'google' ? 'googleId' : 'appleId']: socialId }
          ]
        }
      });

      let isNewUser = false;
      if (!user) {
        const userRole = await prisma.role.findUnique({ where: { name: 'User' } });
        user = await prisma.user.create({
          data: {
            email,
            name: payload.name || socialData.name,
            isVerified: true,
            [payload.loginType === 'google' ? 'googleId' : 'appleId']: socialId,
            roleId: userRole?.id,
          },
        });
        isNewUser = true;
      } else {
        // Link the account if not already linked
        const updateData: any = { isVerified: true };
        if (payload.loginType === 'google' && !user.googleId) updateData.googleId = socialId;
        if (payload.loginType === 'apple' && !user.appleId) updateData.appleId = socialId;
        
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }

      // 3. Handle Device Token and Versioning
      let currentVersion = 0;
      if (payload.deviceId) {
        const deviceToken = await prisma.deviceToken.upsert({
          where: { userId_deviceId: { userId: user.id, deviceId: payload.deviceId } },
          update: { 
            tokenVersion: { increment: 1 },
            deviceType: payload.deviceType || undefined,
            lastLoggedIn: new Date(),
            isActive: true
          },
          create: {
            userId: user.id,
            deviceId: payload.deviceId,
            deviceType: payload.deviceType || null,
            tokenVersion: 1,
            isActive: true,
            lastLoggedIn: new Date(),
          },
        });
        currentVersion = deviceToken.tokenVersion;
      }

      // 4. Generate JWT
      const token = generateToken(user.id, currentVersion, payload.deviceId);

      const userData = await this.getFormattedUserData(user.id);
      const businessExists = await prisma.business.count({ where: { ownerId: user.id } }) > 0;

      // User is considered new until they complete their profile (e.g. have a phone number)
      const isActuallyNew = !user.phone;

      return {
        is_new_user: isActuallyNew,
        has_business: businessExists,
        token,
        user: userData,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        const message = error.message || '';
        if (target.includes('email') || message.includes('email')) {
          throw new Error('Email already in use by another account.');
        }
        if (target.includes('phone') || message.includes('phone')) {
          throw new Error('Phone number already in use by another account.');
        }
      }
      throw error;
    }
  }

  /**
   * Updates user profile (name and email).
   */
  static async updateProfile(userId: bigint, data: { name?: string; email?: string; phone?: string }) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
      });

      const userData = await this.getFormattedUserData(userId);
      const hasBusiness = await prisma.business.count({ where: { ownerId: userId } }) > 0;

      return {
        success: true,
        message: 'Profile updated successfully',
        data: {
          is_new_user: false,
          has_business: hasBusiness,
          user: userData,
        }
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        const message = error.message || '';
        if (target.includes('email') || message.includes('email')) {
          throw new Error('Email already in use by another account.');
        }
        if (target.includes('phone') || message.includes('phone')) {
          throw new Error('Phone number already in use by another account.');
        }
      }
      throw error;
    }
  }

  /**
   * Helper to fetch and format user data with relations.
   */
  static async getFormattedUserData(userId: bigint) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, profileMedia: true, deviceTokens: true },
    }) as any;

    if (!user) return null;

    const userData = JSON.parse(JSON.stringify(user, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    const blockCount = await prisma.userBlock.count({ where: { userId } });
    
    userData.image = user.profileMedia?.fileUrl || null;
    userData.is_blocked = blockCount > 0;
    userData.devices = userData.deviceTokens || [];
    
    delete userData.roleId;
    delete userData.mediaId;
    delete userData.profileMedia;
    delete userData.deviceTokens;

    return userData;
  }
}
