import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Globe, Plus, Trash2, Edit3, Save, TrendingUp } from "lucide-react";

async function getCurrencies() {
  return await prisma.currency.findMany({
    orderBy: { createdAt: 'asc' }
  });
}

async function addCurrency(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const symbol = formData.get("symbol") as string;
  const exchangeRate = parseFloat(formData.get("exchangeRate") as string);

  await prisma.currency.create({
    data: { name, code, symbol, exchangeRate, status: true }
  });

  revalidatePath("/admin/currencies");
}

export default async function CurrenciesPage() {
  const currencies = await getCurrencies();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Currency Master</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage global currencies and their exchange rates relative to the base currency.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
          <Plus className="h-5 w-5" />
          <span>Add Currency</span>
        </button>
      </div>

      <div className="bg-[var(--card-background)] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold uppercase tracking-widest text-gray-500">
              <th className="px-8 py-5">Currency</th>
              <th className="px-6 py-5">Code</th>
              <th className="px-6 py-5">Symbol</th>
              <th className="px-6 py-5">Exchange Rate</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currencies.map((curr) => (
              <tr key={curr.id.toString()} className="group hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-all">
                <td className="px-8 py-5">
                   <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold">
                         {curr.symbol}
                      </div>
                      <span className="font-bold">{curr.name}</span>
                   </div>
                </td>
                <td className="px-6 py-5 font-mono text-sm text-gray-500">{curr.code}</td>
                <td className="px-6 py-5 font-bold">{curr.symbol}</td>
                <td className="px-6 py-5">
                   <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{curr.exchangeRate?.toString()}</span>
                   </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={curr.status ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500 px-3 py-1 rounded-full text-xs font-bold" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500 px-3 py-1 rounded-full text-xs font-bold"}>
                    {curr.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                   <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
                         <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all">
                         <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {currencies.length === 0 && (
          <div className="p-20 text-center">
             <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Globe className="h-8 w-8" />
             </div>
             <p className="text-gray-400 font-medium italic">No currencies found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
