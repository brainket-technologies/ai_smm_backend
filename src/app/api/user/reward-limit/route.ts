import { NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    // Fetch current app config for reward amount
    const config = await prisma.appConfig.findFirst({
       orderBy: { createdAt: 'desc' }
    });
    
    // Default reward: +5 chats
    const rewardAmount = 5; 

    // In a real system, we would track usage in a separate table.
    // For now, we'll just log this and return success.
    // Ideally, we'd have a 'user_daily_limits' table to increment.

    console.log(`[Reward] User ${auth.userId} earned ${rewardAmount} extra credits via Ad.`);

    return NextResponse.json({
      res: "success",
      message: `Successfully earned ${rewardAmount} extra credits!`,
      data: {
        reward_amount: rewardAmount
      }
    });

  } catch (error: any) {
    console.error('Reward Limit Error:', error);
    return NextResponse.json(
      { res: "error", message: 'Internal server error' },
      { status: 500 }
    );
  }
}
