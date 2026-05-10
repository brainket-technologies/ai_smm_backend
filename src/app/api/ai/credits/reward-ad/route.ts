import { NextResponse } from "next/server";
import { validateAuth, validateApiKey } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { AICreditService } from "@/lib/services/ai-credit-service";

export async function POST(request: Request) {
  try {
    // 1. Validations
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const uId = auth.userId;

    // 2. Check if Rewarded Ads are enabled in Global Config
    const featureFlag = await prisma.appFeatureFlag.findUnique({
      where: { 
        moduleName_featureKey: {
          moduleName: 'ai_module',
          featureKey: 'ai_rewarded_ads'
        }
      }
    });

    if (featureFlag && featureFlag.isEnabled === false) {
      return NextResponse.json({ 
        success: false, 
        message: "Rewarded ads are currently disabled by the administrator." 
      }, { status: 403 });
    }

    // 3. Grant Credit
    // In a production app, we would verify the 'ad_token' here.
    const newBalance = await AICreditService.addCredits(uId, 1, "Rewarded Ad View");

    return NextResponse.json({
      success: true,
      message: "Reward granted! You earned 1 AI generation credit.",
      data: {
        balance: newBalance
      }
    });

  } catch (error: any) {
    console.error("Ad Reward Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
