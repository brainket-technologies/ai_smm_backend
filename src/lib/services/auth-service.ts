import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { SmsProvider } from './providers/sms-provider';
import { EmailProvider } from './providers/email-provider';
import { SocialProvider } from './providers/social-provider';

export class AuthService {
  /**
   * Sends OTP to the specified value (phone or email).
   */
  static async sendOtp(type: 'phone' | 'email', value: string) {
    // 1. Fetch Active Provider Configuration
    const category = type === 'phone' ? 'phone_otp' : 'email_otp';
    const activeConfig = await prisma.externalServiceConfig.findFirst({
      where: { category, isActive: true },
      orderBy: { isDefault: 'desc' },
    });

    if (!activeConfig) {
      throw new Error(`No active ${type} OTP provider configured.`);
    }

    // 2. Generate OTP based on provider
    // Firebase: 6 digits, others: 4 digits
    const isFirebase = activeConfig.provider.toLowerCase() === 'firebase';
    const otpLength = isFirebase ? 6 : 4;
    const min = Math.pow(10, otpLength - 1);
    const max = Math.pow(10, otpLength) - 1;
    const otp = Math.floor(min + Math.random() * (max - min + 1)).toString();
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
        include: { role: true, profileMedia: true },
      });
    } else {
      // Re-fetch user with role and profileMedia included
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true, profileMedia: true },
      }) as any;
    }

    // 4. Save OTP to Database
    await prisma.otpVerification.create({
      data: {
        [type]: value,
        otp,
        expiry,
      },
    });

    // 5. Send OTP via Provider
    if (type === 'phone') {
      await SmsProvider.send(activeConfig.provider, value, otp, activeConfig.config as any);
    } else {
      await EmailProvider.send(activeConfig.provider, value, otp, activeConfig.config as any);
    }

    // Return full user data, handling BigInt conversion and formatting response
    const userData = JSON.parse(JSON.stringify(user, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    // Format response: add image URL and remove redundant IDs/objects
    userData.image = user.profileMedia?.fileUrl || null;
    delete userData.roleId;
    delete userData.mediaId;
    delete userData.profileMedia;

    return { 
      success: true, 
      message: `OTP sent successfully to ${value}`,
      data: userData
    };
  }

  /**
   * Verifies OTP and returns user data with JWT and business status.
   */
  static async verifyOtp(type: 'phone' | 'email', value: string, otp: string) {
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

    // 3. Get User with Business count
    const user = await prisma.user.findUnique({
      where: type === 'phone' ? { phone: value } : { email: value },
      include: {
        businesses: { select: { id: true } }
      }
    });

    if (!user) throw new Error('User not found.');

    const isNewUser = !user.name; // Simple heuristic: if name is null, it's a new sign-up
    const hasBusiness = user.businesses.length > 0;

    // 4. Update user verification status if needed
    if (!user.isVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    // 5. Generate JWT
    const token = generateToken(user.id);

    return {
      success: true,
      otp_verified: true,
      is_new_user: isNewUser,
      has_business: hasBusiness,
      token,
      user: {
        id: user.id.toString(),
        name: user.name || null,
        email: user.email || null,
        phone: user.phone || null,
      },
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
  }) {
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

    // 3. Generate JWT
    const token = generateToken(user.id);

    return {
      success: true,
      token,
      isNewUser,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }
}
