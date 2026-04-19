/*
  Warnings:

  - A unique constraint covering the columns `[module_name,feature_key]` on the table `app_feature_flags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,type]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[category_id,type,name]` on the table `sub_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tier_key,permission_key]` on the table `subscription_permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "app_configs" ADD COLUMN     "free_trial_days" INTEGER DEFAULT 7;

-- AlterTable
ALTER TABLE "app_themes" ADD COLUMN     "is_active" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "audience_types" ADD COLUMN     "is_active" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "is_active" BOOLEAN DEFAULT true,
ADD COLUMN     "type" VARCHAR(50) NOT NULL DEFAULT 'business';

-- AlterTable
ALTER TABLE "cta_buttons" ADD COLUMN     "is_active" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "model_ethnicities" ADD COLUMN     "is_active" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "sub_categories" ADD COLUMN     "is_active" BOOLEAN DEFAULT true,
ADD COLUMN     "type" VARCHAR(50) NOT NULL DEFAULT 'business';

-- AlterTable
ALTER TABLE "target_age_groups" ADD COLUMN     "is_active" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "target_regions" ADD COLUMN     "is_active" BOOLEAN DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "app_feature_flags_module_name_feature_key_key" ON "app_feature_flags"("module_name", "feature_key");

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_type_key" ON "categories"("name", "type");

-- CreateIndex
CREATE INDEX "sub_categories_type_idx" ON "sub_categories"("type");

-- CreateIndex
CREATE INDEX "sub_categories_category_id_type_idx" ON "sub_categories"("category_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_category_id_type_name_key" ON "sub_categories"("category_id", "type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_permissions_tier_key_permission_key_key" ON "subscription_permissions"("tier_key", "permission_key");
