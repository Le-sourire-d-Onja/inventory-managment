-- AlterTable
ALTER TABLE "Demand" DROP COLUMN "status",
DROP COLUMN "validated_at",
DROP COLUMN "containerized_at",
DROP COLUMN "distributed_at";

-- DropEnum
DROP TYPE "DemandStatus";
