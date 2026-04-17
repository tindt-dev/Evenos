-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "buyerEmail" TEXT,
ADD COLUMN     "buyerPhone" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT;
