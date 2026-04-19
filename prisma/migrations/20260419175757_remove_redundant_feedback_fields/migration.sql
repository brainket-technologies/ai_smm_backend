/*
  Warnings:

  - You are about to drop the column `email` on the `feedbacks` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `feedbacks` table. All the data in the column will be lost.
  - Made the column `user_id` on table `feedbacks` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_user_id_fkey";

-- AlterTable
ALTER TABLE "feedbacks" DROP COLUMN "email",
DROP COLUMN "name",
ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
