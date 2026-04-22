import { NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { prisma } from './prisma';

/**
 * Validates the 'apikey' header against the API_KEY environment variable.
 */
export function validateApiKey(request: Request) {
  const apiKey = request.headers.get('apikey');
  const expectedApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    return {
      isValid: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid or missing API Key' },
        { status: 401 }
      ),
    };
  }

  return { isValid: true };
}

/**
 * Validates the Authorization token and checks for version mismatch.
 */
export async function validateAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      isValid: false,
      response: NextResponse.json({ success: false, message: 'Authorization token required' }, { status: 401 })
    };
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token) as { id: string; version: number; deviceId?: string };
  
  if (!decoded) {
    return {
      isValid: false,
      response: NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    };
  }

  // If deviceId was included in token, check version in DeviceToken table
  if (decoded.deviceId) {
    const device = await prisma.deviceToken.findUnique({
      where: { 
        userId_deviceId: { 
          userId: BigInt(decoded.id), 
          deviceId: decoded.deviceId 
        } 
      },
      select: { tokenVersion: true }
    });

    if (!device || device.tokenVersion !== decoded.version) {
      return {
        isValid: false,
        response: NextResponse.json({ success: false, message: 'Session expired or logged in from another device' }, { status: 401 })
      };
    }
  }

  return { isValid: true, userId: BigInt(decoded.id), deviceId: decoded.deviceId };
}
