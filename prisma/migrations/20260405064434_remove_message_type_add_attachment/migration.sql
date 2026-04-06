/*
  Warnings:

  - You are about to drop the column `mediaType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrl` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `messageType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "mediaType",
DROP COLUMN "mediaUrl",
DROP COLUMN "messageType",
DROP COLUMN "metadata";

-- DropEnum
DROP TYPE "MessageType";

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "content" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_messageId_key" ON "Attachment"("messageId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
