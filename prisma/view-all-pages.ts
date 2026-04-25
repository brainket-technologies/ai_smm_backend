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
    const pages = await prisma.staticPage.findMany();
    for (const page of pages) {
      console.log(`--- SLUG: ${page.slug} ---`);
      console.log(`Title: ${page.title}`);
      console.log(`Content: ${page.content}`);
      console.log("\n");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
