import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { FileText, Plus, Trash2, Edit3, Eye, Calendar } from "lucide-react";
import Link from "next/link";

async function getPages() {
  return await prisma.staticPage.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export default async function PagesManagement() {
  const pages = await getPages();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Static Content (CMS)</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage legal documents, terms of service, and informational static pages.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
          <Plus className="h-5 w-5" />
          <span>Create Page</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pages.map((page) => (
          <div key={page.id.toString()} className="bg-[var(--card-background)] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
            <div className="flex items-center space-x-6">
               <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-600/10 transition-all">
                  <FileText className="h-7 w-7" />
               </div>
               <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-bold text-lg">{page.title}</h3>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400 px-2 py-0.5 rounded text-[10px] font-mono uppercase">/{page.slug}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                     <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Last updated {page.updatedAt?.toLocaleDateString()}
                     </span>
                     <span className={page.isActive ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                        {page.isActive ? "● Live" : "● Draft"}
                     </span>
                  </div>
               </div>
            </div>

            <div className="flex items-center space-x-3">
               <button className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
               </button>
               <button className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all">
                  <Edit3 className="h-4 w-4" />
               </button>
               <button className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 className="h-4 w-4" />
               </button>
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
             <div className="h-20 w-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-slate-300" />
             </div>
             <p className="text-gray-400 font-medium italic">No static pages found. Start by creating a Terms of Service or Privacy Policy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
