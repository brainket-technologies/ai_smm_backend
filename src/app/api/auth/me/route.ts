import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

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
      image: user.image,
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
    if (image !== undefined) updateData.image = image;
    
    if (password) {
      updateData.password = await bcrypt.compare(password, ''); // This is just a placeholder to use bcrypt if needed, actually I should hash it
      updateData.password = await bcrypt.hash(password, 10);
    }

    updateData.updatedAt = new Date();

    const updatedUser = await prisma.user.update({
      where: { id: BigInt(decoded.id) },
      data: updateData,
      include: { role: true }
    });

    const userData = {
      id: updatedUser.id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      image: updatedUser.image,
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
