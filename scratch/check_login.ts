import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = "postgresql://neondb_owner:npg_JhAiItvzM23Z@ep-plain-snow-amll0gmg-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Checking user: admin@ai.com...");
    const user = await prisma.user.findUnique({
        where: { email: 'admin@ai.com' },
        include: { role: true }
    });

    if (!user) {
        console.log("Error: User NOT FOUND");
        return;
    }

    console.log("User Found:");
    console.log("- Name:", user.name);
    console.log("- Role:", user.role?.name);
    console.log("- Role Active:", user.role?.isActive);
    console.log("- Password Hash exists:", !!user.password);
    
    if (user.password) {
        const isMatch = await bcrypt.compare('12345', user.password);
        console.log("- Password '12345' compare result:", isMatch);
    }
}

main()
    .catch(console.error)
    .finally(() => {
        prisma.$disconnect();
        pool.end();
    });
