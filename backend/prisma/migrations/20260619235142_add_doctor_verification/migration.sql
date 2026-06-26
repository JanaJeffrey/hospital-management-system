-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "certificateUrl" TEXT,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "yearsExperience" INTEGER;
