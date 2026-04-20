import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const config = await prisma.appConfig.findFirst({
      where: { id: BigInt(1) }
    });
    
    if (config) {
      console.log("Configuration Found:", {
        id: config.id.toString(),
        appName: config.appName
      });
    } else {
      console.log("Configuration NOT Found. Initializing...");
      const created = await prisma.appConfig.create({
        data: {
          id: BigInt(1),
          appName: 'BrandBoost AI',
          maintenanceMode: false,
          globalAiEnabled: true
        }
      });
      console.log("Configuration Created:", created.id.toString());
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
