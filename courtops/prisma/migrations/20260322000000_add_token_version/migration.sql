-- AlterTable: add tokenVersion to User for server-side session revocation
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
