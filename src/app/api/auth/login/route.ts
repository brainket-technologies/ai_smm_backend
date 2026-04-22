import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';
import { validateApiKey } from '@/lib/auth-utils';
import { AuthService } from '@/lib/services/auth-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, deviceId, deviceType } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // 2. Find User
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // 3. Verify Password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // 4. Handle Device Token and Versioning (If device info provided)
        let currentVersion = 0;
        if (deviceId) {
            const deviceToken = await prisma.deviceToken.upsert({
                where: { userId_deviceId: { userId: user.id, deviceId } },
                update: { 
                    tokenVersion: { increment: 1 },
                    deviceType: deviceType || undefined,
                    lastLoggedIn: new Date(),
                    isActive: true
                },
                create: {
                    userId: user.id,
                    deviceId,
                    deviceType: deviceType || null,
                    tokenVersion: 1,
                    isActive: true,
                    lastLoggedIn: new Date(),
                },
            });
            currentVersion = deviceToken.tokenVersion;
        }

        // 5. Generate JWT
        const token = generateToken(user.id, currentVersion, deviceId);

        // 6. Format Response
        const userData = await AuthService.getFormattedUserData(user.id);

        return NextResponse.json({
            success: true,
            message: 'Logged in successfully',
            data: {
                token,
                user: userData
            }
        });

    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
