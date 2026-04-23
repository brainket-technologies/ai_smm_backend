import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, getAuthUser } from '@/lib/auth-utils';

export async function POST(request: Request) {
  // 1. Validate API Key
  const auth = validateApiKey(request);
  if (!auth.isValid) return auth.response;

  // 2. Get Authenticated User
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { type, value } = await request.json();

    if (!type || value === undefined) {
      return NextResponse.json(
        { success: false, message: 'Type and value are required' },
        { status: 400 }
      );
    }

    const validTypes = ['push', 'email', 'sms', 'whatsapp'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid toggle type' },
        { status: 400 }
      );
    }

    const fieldMap: Record<string, string> = {
      push: 'pushEnabled',
      email: 'emailEnabled',
      sms: 'smsEnabled',
      whatsapp: 'whatsappEnabled'
    };

    const updateData: any = {};
    updateData[fieldMap[type]] = value;

    await prisma.user.update({
      where: { id: BigInt(user.id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} notification setting updated`
    });

  } catch (error: any) {
    console.error('Toggle setting error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
