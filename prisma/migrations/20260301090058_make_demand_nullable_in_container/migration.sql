-- DropForeignKey
ALTER TABLE "Container" DROP CONSTRAINT "Container_demand_id_fkey";

-- AlterTable
ALTER TABLE "Container" ALTER COLUMN "demand_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "Demand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
