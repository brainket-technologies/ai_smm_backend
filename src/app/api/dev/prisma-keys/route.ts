import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  const keys = Object.keys(prisma);
  return NextResponse.json({ keys });
}
