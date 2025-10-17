/*
  Warnings:

  - You are about to drop the column `donationID` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `typeID` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ArticleType` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Association` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Association` table. All the data in the column will be lost.
  - You are about to drop the column `demandID` on the `Container` table. All the data in the column will be lost.
  - You are about to drop the column `containerID` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `typeID` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `associationID` on the `Demand` table. All the data in the column will be lost.
  - You are about to drop the column `containerizedAt` on the `Demand` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Demand` table. All the data in the column will be lost.
  - You are about to drop the column `distributedAt` on the `Demand` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Demand` table. All the data in the column will be lost.
  - You are about to drop the column `validatedAt` on the `Demand` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Donation` table. All the data in the column will be lost.
  - Added the required column `donation_id` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_id` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Association` table without a default value. This is not possible if the table is not empty.
  - Added the required column `demand_id` to the `Container` table without a default value. This is not possible if the table is not empty.
  - Added the required column `container_id` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_id` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `association_id` to the `Demand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Demand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Article" DROP CONSTRAINT "Article_donationID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Article" DROP CONSTRAINT "Article_typeID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Container" DROP CONSTRAINT "Container_demandID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Content" DROP CONSTRAINT "Content_containerID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Content" DROP CONSTRAINT "Content_typeID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Demand" DROP CONSTRAINT "Demand_associationID_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "donationID",
DROP COLUMN "price",
DROP COLUMN "typeID",
ADD COLUMN     "donation_id" TEXT NOT NULL,
ADD COLUMN     "type_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ArticleType" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Association" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Container" DROP COLUMN "demandID",
ADD COLUMN     "demand_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "containerID",
DROP COLUMN "typeID",
ADD COLUMN     "container_id" TEXT NOT NULL,
ADD COLUMN     "type_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Demand" DROP COLUMN "associationID",
DROP COLUMN "containerizedAt",
DROP COLUMN "createdAt",
DROP COLUMN "distributedAt",
DROP COLUMN "updatedAt",
DROP COLUMN "validatedAt",
ADD COLUMN     "association_id" TEXT NOT NULL,
ADD COLUMN     "containerized_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "distributed_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "ArticleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "Donation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "ArticleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "Container"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "Demand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "Association"("id") ON DELETE CASCADE ON UPDATE CASCADE;
