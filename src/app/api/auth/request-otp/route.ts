import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json(
                { success: false, message: 'Phone number is required' },
                { status: 400 }
            );
        }

        const otp = '123456'; // Default OTP as per existing logic
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Using upsert to match previous logic
        const user = await prisma.user.upsert({
            where: { phone },
            update: { isVerified: false }, // Reset verification on new request
            create: { phone, isVerified: false },
        });

        // We also need to store OTP somewhere. 
        // Note: The provided schema doesn't have otp/otpExpiry fields in User table, 
        // unlike the previous Express app schema preview. 
        // I will check the schema again.
        
        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully (local: 123456)',
            phone: user.phone
        });
    } catch (error: any) {
        console.error('Request OTP Error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
