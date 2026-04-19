import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log("Starting Migration...");
    // 1. Add 'type' columns
    await prisma.$executeRawUnsafe(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'business' NOT NULL`);
    await prisma.$executeRawUnsafe(`ALTER TABLE sub_categories ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'business' NOT NULL`);
    
    console.log("Columns added. Enforcing constraints...");
    // 2. Check Constraints (if they don't exist)
    try { await prisma.$executeRawUnsafe(`ALTER TABLE categories ADD CONSTRAINT chk_category_type CHECK (type IN ('business', 'product', 'service'))`); } catch (e) { console.log("Constraint already exists or error: ", e.message); }
    try { await prisma.$executeRawUnsafe(`ALTER TABLE sub_categories ADD CONSTRAINT chk_subcategory_type CHECK (type IN ('business', 'product', 'service'))`); } catch (e) { console.log("Constraint already exists or error: ", e.message); }

    console.log("Replacing Unique Constraints...");
    // 3. Unique Constraints
    try { await prisma.$executeRawUnsafe(`ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key`); } catch (e) { console.log(e.message); }
    try { await prisma.$executeRawUnsafe(`ALTER TABLE categories ADD CONSTRAINT categories_name_type_key UNIQUE (name, type)`); } catch (e) { console.log(e.message); }
    try { await prisma.$executeRawUnsafe(`ALTER TABLE sub_categories ADD CONSTRAINT sub_categories_category_type_name_key UNIQUE (category_id, type, name)`); } catch (e) { console.log(e.message); }

    // 4. Indexes
    console.log("Building Indexes...");
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_subcat_type ON sub_categories(type)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_subcat_cat_type ON sub_categories(category_id, type)`);
    
    console.log("Migration Successful.");
  } catch(error) {
    console.error("Migration Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}
runMigration();
