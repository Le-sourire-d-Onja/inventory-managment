/*
  Warnings:

  - The values [DONE] on the enum `DemandStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `type` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Content` table. All the data in the column will be lost.
  - Added the required column `price` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeID` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeID` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DemandStatus_new" AS ENUM ('IN_PROGRESS', 'VALIDATED', 'CONTAINERIZED', 'DISTRIBUTED');
ALTER TABLE "Demand" ALTER COLUMN "status" TYPE "DemandStatus_new" USING ("status"::text::"DemandStatus_new");
ALTER TYPE "DemandStatus" RENAME TO "DemandStatus_old";
ALTER TYPE "DemandStatus_new" RENAME TO "DemandStatus";
DROP TYPE "DemandStatus_old";
COMMIT;

-- AlterEnum
ALTER TYPE "PackagingType" ADD VALUE 'NAKED';

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "type",
DROP COLUMN "value",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "typeID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "type",
ADD COLUMN     "typeID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Demand" ADD COLUMN     "containerizedAt" TIMESTAMP(3),
ADD COLUMN     "distributedAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "ArticleType";

-- CreateTable
CREATE TABLE "ArticleType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ArticleType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleType_name_key" ON "ArticleType"("name");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_typeID_fkey" FOREIGN KEY ("typeID") REFERENCES "ArticleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_typeID_fkey" FOREIGN KEY ("typeID") REFERENCES "ArticleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
