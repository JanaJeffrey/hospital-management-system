-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'DEACTIVATED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rejectionReason" TEXT;
