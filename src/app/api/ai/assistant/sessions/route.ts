import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth-utils";
import { AIAssistantService } from "@/lib/services/ai-assistant-service";

export async function GET(request: Request) {
  try {
    const validation = await validateRequest(request);
    if (!validation.isValid) return (validation as any).response;

    const { userId, businessId } = validation;

    const sessions = await AIAssistantService.listSessions(userId, businessId);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(sessions, (k, v) => typeof v === 'bigint' ? v.toString() : v))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
