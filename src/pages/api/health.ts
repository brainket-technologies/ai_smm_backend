import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Backend Pages API is live',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({ 
      status: 'error', 
      message: 'Backend is live but Database connection failed',
      error: error.message
    });
  }
}
