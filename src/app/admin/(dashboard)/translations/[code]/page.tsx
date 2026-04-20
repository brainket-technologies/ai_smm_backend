import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import TranslationEditor from "@/components/admin/TranslationEditor";

async function getLanguage(code: string) {
  const lang = await prisma.appTranslation.findUnique({
    where: { languageCode: code },
    select: {
      id: true,
      languageCode: true,
      displayName: true,
      translations: true
    }
  });

  if (!lang) return null;

  return {
    ...lang,
    id: lang.id.toString()
  };
}

async function saveTranslations(formData: FormData) {
  "use server";
  
  const languageCode = formData.get("languageCode") as string;
  const keys = formData.getAll("keys[]") as string[];
  const values = formData.getAll("values[]") as string[];

  const translationsJSON: Record<string, string> = {};
  keys.forEach((key, index) => {
    if (key.trim()) {
      translationsJSON[key.trim()] = values[index] || "";
    }
  });

  await prisma.appTranslation.update({
    where: { languageCode },
    data: { translations: translationsJSON }
  });

  revalidatePath(`/admin/translations/${languageCode}`);
  redirect("/admin/translations");
}

export default async function TranslationEditorPage({ 
  params 
}: { 
  params: Promise<{ code: string }> 
}) {
  const { code } = await params;
  const lang = await getLanguage(code);

  if (!lang) {
    return <div>Language not found.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/admin/translations" 
            className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
               Manage {lang.displayName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 uppercase text-xs font-bold tracking-widest">
               Language Code: {lang.languageCode}
            </p>
          </div>
        </div>
      </div>

      <TranslationEditor 
        initialTranslations={lang.translations as Record<string, string>} 
        languageCode={lang.languageCode}
        saveAction={saveTranslations}
      />
    </div>
  );
}
