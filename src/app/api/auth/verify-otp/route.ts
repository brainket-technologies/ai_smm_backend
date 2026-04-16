import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateToken } from '@/lib/jwt';

export async function POST(request: Request) {
    try {
        const { phone, otp } = await request.json();

        if (!phone || !otp) {
            return NextResponse.json(
                { success: false, message: 'Phone and OTP are required' },
                { status: 400 }
            );
        }

        // Search for user
        const user = await prisma.user.findUnique({
            where: { phone },
            include: { role: true }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Logic check: Since we can't store OTP in DB (strict schema),
        // we check for our hardcoded test OTP as per original backend logic.
        if (otp !== '123456') {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired OTP' },
                { status: 400 }
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
                    name: user.name,
                    role: user.role?.name,
                },
            },
        });
    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
