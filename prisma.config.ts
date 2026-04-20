// @ts-nocheck
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://firozmohammad:@localhost:5432/ai_social?schema=public",
  },
  migrations: {
    seed: "npx -y tsx prisma/seed.ts"
  }
});
