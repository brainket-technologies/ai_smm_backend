import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { phone, email } = await request.json();

        if (!phone && !email) {
            return NextResponse.json(
                { success: false, message: 'Phone number or email is required' },
                { status: 400 }
            );
        }

        const otp = '123456'; // Default OTP as per existing logic
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Search for user by email or phone
        let user;
        if (email) {
             user = await prisma.user.upsert({
                where: { email },
                update: { isVerified: false },
                create: { email, isVerified: false },
            });
        } else {
             user = await prisma.user.upsert({
                where: { phone: phone! },
                update: { isVerified: false },
                create: { phone: phone!, isVerified: false },
            });
        }

        return NextResponse.json({
            success: true,
            message: `OTP sent successfully to ${email ? 'email' : 'phone'} (local: 123456)`,
            data: {
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error: any) {
        console.error('Request OTP Error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
