import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, validateBusinessId } from '@/lib/auth-utils';

export async function DELETE(request: Request) {
  try {
    const auth = validateApiKey(request);
    if (!auth.isValid) return auth.response;

    const businessCheck = validateBusinessId(request);
    if (!businessCheck.isValid) return businessCheck.response;
    const businessId = businessCheck.businessId!;

    const { searchParams } = new URL(request.url);
    const platformNameKey = searchParams.get('platform');

    if (!platformNameKey) {
      return NextResponse.json({ success: false, message: 'Platform is required' }, { status: 400 });
    }

    const platform = await prisma.platform.findUnique({
      where: { nameKey: platformNameKey }
    });

    if (!platform) {
      return NextResponse.json({ success: false, message: 'Platform not found' }, { status: 404 });
    }

    // Delete the connection from the database
    await prisma.socialAccount.deleteMany({
      where: {
        businessId,
        platformId: platform.id
      }
    });

    return NextResponse.json({ success: true, message: 'Connection removed successfully' });
  } catch (error: any) {
    console.error('Error disconnecting platform:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
