import prisma from "@/lib/prisma";
import { 
  Globe, 
  Settings, 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle,
  LayoutDashboard,
  Zap
} from "lucide-react";
import Link from "next/link";

async function getSocialAccounts() {
  const accounts = await prisma.socialAccount.findMany({
    include: {
      business: {
        select: { name: true, owner: { select: { name: true, email: true } } }
      },
      platform: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return accounts.map(a => ({
    ...a,
    id: a.id.toString(),
    businessId: a.businessId.toString(),
    platformId: a.platformId.toString()
  }));
}

export default async function SocialAccountsPage() {
  const accounts = await getSocialAccounts();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Connections</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Monitor and manage all social media platform connections across the system.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Platform</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Account Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Business</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Connected At</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">
                    No social accounts connected yet.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {account.platform.nameKey === 'facebook' && <Globe className="h-4 w-4 text-blue-600" />}
                          {account.platform.nameKey === 'instagram' && <LayoutDashboard className="h-4 w-4 text-pink-600" />}
                          {account.platform.nameKey === 'gmb' && <Globe className="h-4 w-4 text-red-500" />}
                          {!['facebook', 'instagram', 'gmb'].includes(account.platform.nameKey || '') && <Globe className="h-4 w-4 text-slate-400" />}
                        </div>
                        <span className="text-sm font-bold">{account.platform.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{account.accountName || "Unknown"}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">ID: {account.accountId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-3 w-3 text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{account.business.name}</span>
                          <span className="text-[10px] text-slate-500">{account.business.owner.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {account.isActive ? (
                        <div className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1 px-2 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-600 rounded-full text-[10px] font-bold">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Disconnected</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
