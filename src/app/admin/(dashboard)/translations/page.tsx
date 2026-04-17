import prisma from "@/lib/db";
import TranslationsManagementClient from "./TranslationsManagementClient";

async function getLanguages() {
  const languages = await prisma.appTranslation.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  return languages.map(lang => ({
    ...lang,
    id: lang.id.toString(),
    createdAt: lang.createdAt?.toISOString() || null,
    updatedAt: lang.updatedAt?.toISOString() || null,
  }));
}

export default async function TranslationsPage() {
  const languages = await getLanguages();

  return (
    <div className="animate-in fade-in duration-500">
      <TranslationsManagementClient initialLanguages={languages} />
    </div>
  );
}
