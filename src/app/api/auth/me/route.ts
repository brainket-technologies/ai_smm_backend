import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { registerMedia } from '@/lib/media';

import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.id) },
      include: {
        role: true,
        profileMedia: { select: { fileUrl: true } }
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Prepare serializable data (convert BigInt to string)
    const userData = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.profileMedia?.fileUrl || null,
      role: user.role ? {
        id: user.role.id.toString(),
        name: user.role.name,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

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

    const updatedUser = await prisma.user.update({
      where: { id: BigInt(decoded.id) },
      data: updateData,
      include: { 
        role: true,
        profileMedia: { select: { fileUrl: true } }
      }
    });

    const userData = {
      id: updatedUser.id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      image: updatedUser.profileMedia?.fileUrl || null,
      role: updatedUser.role ? {
        id: updatedUser.role.id.toString(),
        name: updatedUser.role.name,
      } : null,
    };

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
