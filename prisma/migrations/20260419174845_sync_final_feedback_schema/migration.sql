/*
  Warnings:

  - You are about to drop the column `business_id` on the `feedbacks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_business_id_fkey";

-- AlterTable
ALTER TABLE "feedbacks" DROP COLUMN "business_id",
ADD COLUMN     "user_id" BIGINT;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
