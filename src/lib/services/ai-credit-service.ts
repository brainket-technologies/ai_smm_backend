import { prisma } from "@/lib/prisma";

export class AICreditService {
  /**
   * Get user's current credit balance.
   * If wallet doesn't exist, create one with 0 balance.
   */
  static async getBalance(userId: bigint): Promise<number> {
    let wallet = await prisma.aICreditWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.aICreditWallet.create({
        data: { userId, balance: 0 },
      });
    }

    return wallet.balance;
  }

  /**
   * Add credits to user's wallet (e.g., from rewarded ads).
   */
  static async addCredits(userId: bigint, amount: number, reason: string): Promise<number> {
    const wallet = await prisma.aICreditWallet.upsert({
      where: { userId },
      update: { balance: { increment: amount } },
      create: { userId, balance: amount },
    });

    await prisma.aICreditTransaction.create({
      data: {
        userId,
        amount,
        reason,
      },
    });

    return wallet.balance;
  }

  /**
   * Deduct credits from user's wallet.
   */
  static async deductCredits(userId: bigint, amount: number, reason: string): Promise<number | null> {
    const balance = await this.getBalance(userId);
    if (balance < amount) return null;

    const wallet = await prisma.aICreditWallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });

    await prisma.aICreditTransaction.create({
      data: {
        userId,
        amount: -amount,
        reason,
      },
    });

    return wallet.balance;
  }

  /**
   * Check if user has enough credits or active subscription limit.
   * This is the CORE logic for monetization.
   */
  static async checkAccess(userId: bigint, featureKey: string): Promise<{ allowed: boolean; method: 'subscription' | 'credit' | 'none' }> {
    // 1. Check Subscription First
    const sub = await prisma.userSubscription.findFirst({
      where: { 
        userId, 
        status: 'active',
        endDate: { gte: new Date() }
      },
      include: { tier: true }
    });

    if (sub && sub.tier.limits) {
      const limits = sub.tier.limits as any;
      const limitForFeature = limits[featureKey]; // e.g., 'ai_chats_daily'
      
      if (limitForFeature) {
        // Count today's usage for this user
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const usageCount = await prisma.aIUsageLog.count({
          where: {
            userId,
            requestType: featureKey,
            usageDate: today,
          }
        });

        if (usageCount < limitForFeature) {
          return { allowed: true, method: 'subscription' };
        }
      }
    }

    // 2. Check Credits Second
    const balance = await this.getBalance(userId);
    if (balance > 0) {
      return { allowed: true, method: 'credit' };
    }

    return { allowed: false, method: 'none' };
  }
}
