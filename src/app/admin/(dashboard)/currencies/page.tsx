import prisma from "@/lib/db";
import CurrenciesManagementClient from "./CurrenciesManagementClient";

async function getCurrencies() {
  return await prisma.currency.findMany({
    orderBy: { isDefault: 'desc' }
  });
}

export default async function CurrenciesPage() {
  const currencies = await getCurrencies();

  // Convert BigInt to string for client component serialization
  const serializableCurrencies = currencies.map(c => ({
    ...c,
    id: c.id.toString(),
    exchangeRate: Number(c.exchangeRate),
    createdAt: c.createdAt?.toISOString() || null,
  }));

  return <CurrenciesManagementClient initialCurrencies={serializableCurrencies} />;
}
