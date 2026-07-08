/*
  Warnings:

  - Added the required column `accountId` to the `RecurringTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `RecurringTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecurringTransaction" ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "merchant" TEXT,
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
