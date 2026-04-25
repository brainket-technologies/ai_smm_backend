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
  const deviceId = request.headers.get('device-id');
  const deviceType = request.headers.get('device-type');

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

  // Use deviceId from header or fallback to token
  const currentDeviceId = deviceId || decoded.deviceId;

  // For web sessions or devices not yet registered/tracked (version 0), allow access without device-id
  if (!currentDeviceId && decoded.version === 0) {
    return { 
      isValid: true, 
      userId: BigInt(decoded.id), 
      deviceId: null, 
      deviceType: deviceType 
    };
  }

  if (!currentDeviceId) {
    return {
      isValid: false,
      response: NextResponse.json({ success: false, message: 'device-id header is required for this session' }, { status: 401 })
    };
  }

  // Check version in DeviceToken table
  const device = await prisma.deviceToken.findUnique({
    where: { 
      userId_deviceId: { 
        userId: BigInt(decoded.id), 
        deviceId: currentDeviceId 
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

  return { 
    isValid: true, 
    userId: BigInt(decoded.id), 
    deviceId: currentDeviceId, 
    deviceType: deviceType 
  };
}

/**
 * Validates and extracts 'x-business-id' from headers.
 */
export function validateBusinessId(request: Request) {
  const businessId = request.headers.get('x-business-id');
  
  if (!businessId) {
    return {
      isValid: false,
      response: NextResponse.json(
        { success: false, message: 'x-business-id header is required' },
        { status: 400 }
      ),
    };
  }

  try {
    return {
      isValid: true,
      businessId: BigInt(businessId)
    };
  } catch (error) {
    return {
      isValid: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid x-business-id format' },
        { status: 400 }
      ),
    };
  }
}
