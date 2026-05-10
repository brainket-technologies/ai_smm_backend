import { NextResponse } from "next/server";
import { validateAuth, validateApiKey } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { AIContextBuilder } from "@/lib/services/ai-context-builder";
import { AIProviderFactory } from "@/lib/services/providers/ai-provider-factory";
import { AICreditService } from "@/lib/services/ai-credit-service";
import { AIAssistantService } from "@/lib/services/ai-assistant-service";

export async function POST(request: Request) {
  try {
    // 1. Validations
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json();
    const { 
      sessionId, 
      businessId, 
      message,
      actionKey // Optional: triggered from a quick action card
    } = body;

    if (!message && !actionKey) {
      return NextResponse.json({ success: false, message: "No message provided." }, { status: 400 });
    }

    const uId = auth.userId!;
    const bId = businessId ? BigInt(businessId) : null;

    // 2. Check Credits/Access
    const access = await AICreditService.checkAccess(uId, 'ai_chats_daily');
    if (!access.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: "Limit reached. Please upgrade your plan or watch an ad to continue.",
        code: "LIMIT_REACHED"
      }, { status: 403 });
    }

    // 3. Manage Session
    let currentSessionId: bigint;
    if (sessionId) {
      currentSessionId = BigInt(sessionId);
    } else {
      const session = await AIAssistantService.createSession(uId, bId || undefined, message?.substring(0, 30) || "AI Assistant Chat");
      currentSessionId = session.id;
    }

    // 4. Fetch History & Context
    const history = await AIAssistantService.getMessages(currentSessionId, uId);
    let contextStr = "";
    if (bId) {
      const context = await AIContextBuilder.build(uId, bId);
      contextStr = AIContextBuilder.toContextString(context);
    }

    // 5. Build AI Prompt with History
    const chatHistory = history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    // If it's a quick action, append specific instructions
    let userPrompt = message;
    if (actionKey) {
        const action = await prisma.aIQuickAction.findUnique({ where: { actionKey } });
        if (action) {
            userPrompt = `Quick Action: ${action.title}. ${action.description}. ${message || ""}`;
        }
    }

    // 6. Generate AI Response
    const provider = await AIProviderFactory.getDefaultProvider('text');
    const systemPrompt = `
      You are a specialized SMM (Social Media Marketing) AI Assistant.
      ${contextStr ? `Your primary focus is the following business:\n${contextStr}` : "Provide general marketing advice."}
      Keep your responses professional, actionable, and creative.
    `;

    // Note: Our current providers don't handle full history array yet in their generateText, 
    // I'll update the OpenAI provider to handle it or just concatenate for now.
    // For now, I'll concatenate for simplicity in the prompt.
    const fullPrompt = chatHistory.length > 0 
        ? `Previous conversation:\n${chatHistory.map(h => `${h.role}: ${h.content}`).join("\n")}\n\nUser: ${userPrompt}`
        : userPrompt;

    const aiRes = await provider.generateText(fullPrompt, systemPrompt);

    // 7. Save Messages & Log Usage
    await AIAssistantService.saveMessage(currentSessionId, 'user', userPrompt);
    await AIAssistantService.saveMessage(currentSessionId, 'assistant', aiRes.text);

    await prisma.aIUsageLog.create({
        data: {
            userId: uId,
            businessId: bId,
            requestType: 'ai_chats_daily',
            tokensUsed: aiRes.usage.inputTokens + aiRes.usage.outputTokens,
            usageDate: new Date(),
        }
    });

    let newBalance = await AICreditService.getBalance(uId);
    if (access.method === 'credit') {
        const deducted = await AICreditService.deductCredits(uId, 1, "AI Assistant Chat");
        if (deducted !== null) newBalance = deducted;
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: currentSessionId.toString(),
        response: aiRes.text,
        history: [...chatHistory, { role: 'user', content: userPrompt }, { role: 'assistant', content: aiRes.text }],
        newBalance
      }
    });

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
