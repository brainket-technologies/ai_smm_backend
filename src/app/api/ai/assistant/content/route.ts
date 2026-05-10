import { NextResponse } from "next/server";
import { validateAuth, validateApiKey } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { AIContextBuilder } from "@/lib/services/ai-context-builder";
import { PromptBuilder } from "@/lib/services/prompt-builder";
import { AIProviderFactory } from "@/lib/services/providers/ai-provider-factory";
import { AICreditService } from "@/lib/services/ai-credit-service";

export async function POST(request: Request) {
  try {
    // 1. Validations
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json();
    const { 
      businessId, 
      type, // 'caption' | 'hashtags' | 'ideas' | 'calendar'
      platform,
      topic,
      language
    } = body;

    if (!businessId || !type || !platform) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const bId = BigInt(businessId);
    const uId = auth.userId!;

    // 2. Check Credits/Access
    const access = await AICreditService.checkAccess(uId, 'ai_chats_daily');
    if (!access.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: "Limit reached. Please upgrade your plan or watch an ad to continue.",
        code: "LIMIT_REACHED"
      }, { status: 403 });
    }

    // 3. Fetch Context
    const context = await AIContextBuilder.build(uId, bId);

    // 4. Build Prompt
    const prompt = PromptBuilder.buildContentPrompt({
      context,
      type,
      platform,
      topic,
      language
    });

    // 5. Generate Content
    const provider = await AIProviderFactory.getDefaultProvider('text');
    const aiRes = await provider.generateText(prompt, "You are a helpful social media marketing assistant.");

    // 6. Log Usage & Deduct Credits if applicable
    await prisma.aIUsageLog.create({
        data: {
            userId: uId,
            businessId: bId,
            requestType: 'ai_chats_daily',
            tokensUsed: aiRes.usage.inputTokens + aiRes.usage.outputTokens,
            inputTokens: aiRes.usage.inputTokens,
            outputTokens: aiRes.usage.outputTokens,
            usageDate: new Date(),
        }
    });

    let newBalance = await AICreditService.getBalance(uId);
    if (access.method === 'credit') {
        const deducted = await AICreditService.deductCredits(uId, 1, `AI ${type} Generation`);
        if (deducted !== null) newBalance = deducted;
    }

    return NextResponse.json({
        success: true,
        data: {
            text: aiRes.text,
            prompt: prompt,
            usage: aiRes.usage,
            newBalance
        }
    });

  } catch (error: any) {
    console.error("AI Content Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
