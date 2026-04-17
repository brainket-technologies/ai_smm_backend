import prisma from "@/lib/db";
import PaymentsManagementClient from "./PaymentsManagementClient";

export const dynamic = 'force-dynamic';

async function getPaymentMethods() {
  return await prisma.paymentMethod.findMany({
    orderBy: { isDefault: 'desc' }
  });
}

export default async function PaymentsPage() {
  const payments = await getPaymentMethods();

  // Convert BigInt to string for client component serialization
  const serializablePayments = payments.map(p => ({
    ...p,
    id: p.id.toString(),
    createdAt: p.createdAt?.toISOString() || null,
    updatedAt: p.updatedAt?.toISOString() || null,
  }));

  // Debug: log image URLs to server console
  serializablePayments.forEach(p => console.log(`[PAYMENT] ${p.name}: image="${p.image}"`))

  return <PaymentsManagementClient initialPaymentMethods={serializablePayments} />;
}
