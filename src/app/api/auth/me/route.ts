import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth-service';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';
import { BusinessService } from '@/lib/services/business-service';
import { registerMedia } from '@/lib/media';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    // 1. Validate API Key (Optional for Web Admin with JWT)
    // const apiCheck = validateApiKey(request);
    // if (!apiCheck.isValid) return apiCheck.response;

    // 2. Authenticate User
    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const userData = await AuthService.getFormattedUserData(auth.userId!);
    const hasBusiness = await BusinessService.hasBusiness(auth.userId!);

    return NextResponse.json({
      success: true,
      data: {
        has_business: hasBusiness,
        user: userData
      }
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // 1. Validate API Key (Optional for Web Admin with JWT)
    // const apiCheck = validateApiKey(request);
    // if (!apiCheck.isValid) return apiCheck.response;

    // 2. Authenticate User
    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json();
    const { name, email, phone, bio, image, password } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    
    if (image && (image.startsWith('http') || image.startsWith('data:image'))) {
      const mediaId = await registerMedia({
        fileUrl: image,
        fileType: 'image',
        mediaCategory: 'avatar',
        relatedType: 'user'
      });
      if (mediaId) {
        updateData.mediaId = mediaId;
      }
    }
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    updateData.updatedAt = new Date();

    await prisma.user.update({
      where: { id: auth.userId! },
      data: updateData,
    });

    const userData = await AuthService.getFormattedUserData(auth.userId!);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: userData
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}
