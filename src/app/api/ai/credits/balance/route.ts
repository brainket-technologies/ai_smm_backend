import { NextResponse } from "next/server";
import { validateAuth, validateApiKey } from "@/lib/auth-utils";
import { AICreditService } from "@/lib/services/ai-credit-service";

export async function GET(request: Request) {
  try {
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const userId = auth.userId!;
    const balance = await AICreditService.getBalance(userId);

    return NextResponse.json({
      success: true,
      data: { balance }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
