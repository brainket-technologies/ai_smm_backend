import { NextResponse } from "next/server";
import { validateAuth, validateApiKey } from "@/lib/auth-utils";
import { AIAssistantService } from "@/lib/services/ai-assistant-service";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
  try {
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const messages = await AIAssistantService.getMessages(BigInt(params.id), auth.userId);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(messages, (k, v) => typeof v === 'bigint' ? v.toString() : v))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
