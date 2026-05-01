import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, validateBusinessId } from '@/lib/auth-utils';

export async function DELETE(request: Request) {
  return handleDisconnect(request);
}

export async function POST(request: Request) {
  return handleDisconnect(request);
}

async function handleDisconnect(request: Request) {
  try {
    const auth = validateApiKey(request);
    if (!auth.isValid) return auth.response;

    const businessCheck = validateBusinessId(request);
    if (!businessCheck.isValid) return businessCheck.response;
    const businessId = businessCheck.businessId!;

    const { searchParams } = new URL(request.url);
    const platformNameKey = searchParams.get('platform') || request.headers.get('x-platform-id');

    if (!platformNameKey) {
      return NextResponse.json({ res: false, message: 'Platform is required' }, { status: 400 });
    }

    const platform = await prisma.platform.findFirst({
      where: { 
        OR: [
          { nameKey: platformNameKey },
          { nameKey: platformNameKey.toLowerCase() }
        ]
      }
    });

    if (!platform) {
      return NextResponse.json({ res: false, message: 'Platform not found' }, { status: 404 });
    }

    // Delete the connection from the database
    await prisma.socialAccount.deleteMany({
      where: {
        businessId,
        platformId: platform.id
      }
    });

    return NextResponse.json({ res: true, message: 'Connection removed successfully' });
  } catch (error: any) {
    console.error('Error disconnecting platform:', error);
    return NextResponse.json({ res: false, message: 'Internal server error' }, { status: 500 });
  }
}
