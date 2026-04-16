import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Search for user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Verify Role: Only Admins can login to the dashboard
        if (user.role?.name !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized. Admin access only.' },
                { status: 403 }
            );
        }

        // Verify Password
        if (!user.password) {
             return NextResponse.json(
                { success: false, message: 'Account not set up for password login' },
                { status: 400 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Success: Generate JWT
        const token = generateToken(user.id);

        return NextResponse.json({
            success: true,
            message: 'Logged in successfully',
            data: {
                token,
                user: {
                    id: user.id.toString(),
                    phone: user.phone,
                    email: user.email,
                    name: user.name,
                    role: user.role?.name,
                },
            },
        });
    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
