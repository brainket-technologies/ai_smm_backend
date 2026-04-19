import { NextResponse } from 'next/server';
import prisma from "@/lib/db";

export async function GET() {
  const keys = Object.keys(prisma);
  return NextResponse.json({ keys });
}
