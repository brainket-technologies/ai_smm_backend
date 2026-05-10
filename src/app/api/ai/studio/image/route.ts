import { NextResponse } from "next/server";
import { validateAuth, validateApiKey } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { AIContextBuilder } from "@/lib/services/ai-context-builder";
import { PromptBuilder } from "@/lib/services/prompt-builder";
import { AIProviderFactory } from "@/lib/services/providers/ai-provider-factory";
import { OverlayService } from "@/lib/services/overlay-service";
import { StorageEngine } from "@/lib/storage-engine";
import { AICreditService } from "@/lib/services/ai-credit-service";
import { registerMedia } from "@/lib/media";

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
      themeKey, 
      focusType, // 'business' | 'product' | 'service'
      focusId, 
      platform,
      switches, // { logo: bool, price: bool, watermark: bool }
      customInstructions 
    } = body;

    if (!businessId || !themeKey || !platform) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const bId = BigInt(businessId);
    const uId = auth.userId!;

    // 2. Check Credits/Access
    const access = await AICreditService.checkAccess(uId, 'ai_images_daily');
    if (!access.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: "Limit reached. Please upgrade your plan or watch an ad to continue.",
        code: "LIMIT_REACHED"
      }, { status: 403 });
    }

    // 3. Fetch Theme & Context
    const theme = await prisma.aIImageTheme.findUnique({ where: { nameKey: themeKey } });
    if (!theme) return NextResponse.json({ success: false, message: "Invalid theme selected." }, { status: 400 });

    const context = await AIContextBuilder.build(uId, bId);

    // 4. Build Prompt
    const prompt = PromptBuilder.buildImagePrompt({
      context,
      themePrompt: theme.prompt,
      focusType,
      focusId,
      platform,
      customInstructions
    });

    // 5. Generate Base Image
    const provider = await AIProviderFactory.getDefaultProvider('image');
    const aiRes = await provider.generateImage(prompt);

    if (!aiRes.mediaUrl) {
      throw new Error("AI failed to generate image URL.");
    }

    // 6. Apply Overlays
    let finalImageBuffer: Buffer;
    let logoUrl: string | undefined;
    let price: string | undefined;

    if (switches?.logo) {
        const businessWithLogo = await prisma.business.findUnique({
            where: { id: bId },
            include: { media: true }
        });
        logoUrl = businessWithLogo?.media?.fileUrl;
    }

    if (switches?.price && focusId) {
        if (focusType === 'product') {
            const p = context.offerings.products.find(x => x.name === focusId);
            price = p?.price;
        } else if (focusType === 'service') {
            const s = context.offerings.services.find(x => x.name === focusId);
            price = s?.price;
        }
    }

    const watermark = switches?.watermark ? "Social Suite" : undefined;

    if (switches?.logo || switches?.price || switches?.watermark) {
        finalImageBuffer = await OverlayService.applyOverlays({
            imageUrl: aiRes.mediaUrl,
            logoUrl,
            price,
            watermarkText: watermark
        });
    } else {
        const res = await fetch(aiRes.mediaUrl);
        finalImageBuffer = Buffer.from(await res.arrayBuffer());
    }

    // 7. Save Final Image
    const fileName = `ai_${Date.now()}.png`;
    const finalUrl = await StorageEngine.saveFile(finalImageBuffer, fileName, 'ai_generated', 'image/png');

    // 8. Register Media & Log Usage
    const mediaId = await registerMedia({
        fileUrl: finalUrl,
        fileType: 'image',
        mimeType: 'image/png',
        mediaCategory: 'ai_generated',
        userId: uId,
        businessId: bId,
    });

    await prisma.aIUsageLog.create({
        data: {
            userId: uId,
            businessId: bId,
            requestType: 'ai_images_daily',
            tokensUsed: 0,
            usageDate: new Date(),
        }
    });

    let newBalance = await AICreditService.getBalance(uId);
    if (access.method === 'credit') {
        const deducted = await AICreditService.deductCredits(uId, 1, "AI Image Generation");
        if (deducted !== null) newBalance = deducted;
    }

    return NextResponse.json({
        success: true,
        data: {
            id: mediaId.toString(),
            url: finalUrl,
            prompt: prompt,
            newBalance
        }
    });

  } catch (error: any) {
    console.error("AI Studio Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
