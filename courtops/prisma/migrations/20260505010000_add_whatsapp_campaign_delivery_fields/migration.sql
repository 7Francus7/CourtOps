-- AlterTable
ALTER TABLE "WhatsAppCampaign"
ADD COLUMN "deliveryType" TEXT NOT NULL DEFAULT 'TEXT',
ADD COLUMN "templateLanguage" TEXT,
ADD COLUMN "templateName" TEXT;
