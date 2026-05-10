import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const themes = await prisma.aIImageTheme.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(themes, (k, v) => typeof v === 'bigint' ? v.toString() : v))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
