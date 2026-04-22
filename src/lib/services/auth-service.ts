import prisma from '../prisma';
import { generateToken } from '@/lib/jwt';
import { SmsProvider } from './providers/sms-provider';
import { EmailProvider } from './providers/email-provider';
import { SocialProvider } from './providers/social-provider';

export class AuthService {
  /**
   * Sends OTP to the specified value (phone or email).
   */
  static async sendOtp(type: 'phone' | 'email', value: string) {
    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 2. Fetch Active Provider Configuration
    const category = type === 'phone' ? 'phone_otp' : 'email_otp';
    const activeConfig = await prisma.externalServiceConfig.findFirst({
      where: { category, isActive: true },
      orderBy: { isDefault: 'desc' },
    });

    if (!activeConfig) {
      throw new Error(`No active ${type} OTP provider configured.`);
    }

    // 3. Save OTP to Database
    await prisma.otpVerification.create({
      data: {
        [type]: value,
        otp,
        expiry,
      },
    });

    // 4. Send OTP via Provider
    if (type === 'phone') {
      await SmsProvider.send(activeConfig.provider, value, otp, activeConfig.config as any);
    } else {
      await EmailProvider.send(activeConfig.provider, value, otp, activeConfig.config as any);
    }

    return { success: true, message: `OTP sent via ${activeConfig.provider}` };
  }

  /**
   * Verifies OTP and returns user data with JWT.
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

    // 2. Clear used OTP (optional but recommended)
    await prisma.otpVerification.delete({ where: { id: verification.id } });

    // 3. Find or Create User
    let user = await prisma.user.findUnique({
      where: type === 'phone' ? { phone: value } : { email: value },
    });

    let isNewUser = false;
    if (!user) {
      const userRole = await prisma.role.findUnique({ where: { name: 'User' } });
      user = await prisma.user.create({
        data: {
          [type]: value,
          isVerified: true,
          roleId: userRole?.id,
        },
      });
      isNewUser = true;
    } else if (!user.isVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    // 4. Generate JWT
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
