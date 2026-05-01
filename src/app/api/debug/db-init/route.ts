import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Starting DB initialization...');
    
    // Create ledger_accounts table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ledger_accounts" (
          "id" BIGSERIAL NOT NULL,
          "business_id" BIGINT NOT NULL,
          "type" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "phone" TEXT,
          "gst_no" TEXT,
          "flat_building" TEXT,
          "locality" TEXT,
          "pincode" TEXT,
          "city" TEXT,
          "state" TEXT,
          "country" TEXT DEFAULT 'India',
          "gender" TEXT DEFAULT 'male',
          "birthday" DATE,
          "media_id" BIGINT,
          "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
      );
    `);
    
    // Create ledger_transactions table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ledger_transactions" (
          "id" BIGSERIAL NOT NULL,
          "ledger_account_id" BIGINT NOT NULL,
          "type" TEXT NOT NULL,
          "amount" DECIMAL NOT NULL,
          "ref" TEXT,
          "product_id" BIGINT,
          "service_id" BIGINT,
          "note" TEXT,
          "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
          "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "ledger_transactions_pkey" PRIMARY KEY ("id")
      );
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Tables created or already exist',
    });
  } catch (error: any) {
    console.error('DB init error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
