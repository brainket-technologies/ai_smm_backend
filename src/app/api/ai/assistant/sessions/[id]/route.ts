import { NextResponse } from "next/server";
import { validateAuth, validateApiKey } from "@/lib/auth-utils";
import { AIAssistantService } from "@/lib/services/ai-assistant-service";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
  try {
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    await AIAssistantService.deleteSession(BigInt(params.id), auth.userId!);

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully."
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
