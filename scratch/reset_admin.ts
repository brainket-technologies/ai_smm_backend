import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Force resetting password for admin@ai.com...");
    const newPassword = '12345';
    const hash = await bcrypt.hash(newPassword, 10);
    
    const user = await prisma.user.update({
        where: { email: 'admin@ai.com' },
        data: { password: hash }
    });

    console.log("Password reset successful for:", user.email);
    console.log("New Hash:", hash);
    
    // Verify once more
    const isMatch = await bcrypt.compare(newPassword, hash);
    console.log("Verification check (12345):", isMatch);
}

main()
    .catch(console.error)
    .finally(() => {
        prisma.$disconnect();
        pool.end();
    });
