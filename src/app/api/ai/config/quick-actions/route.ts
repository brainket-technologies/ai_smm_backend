import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const validation = await validateRequest(request);
    if (!validation.isValid) return (validation as any).response;
    const actions = await prisma.aIQuickAction.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(actions, (k, v) => typeof v === 'bigint' ? v.toString() : v))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
