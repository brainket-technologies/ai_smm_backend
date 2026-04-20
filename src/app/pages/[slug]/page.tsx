import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.staticPage.findUnique({
    where: { slug, isActive: true },
  });

  if (!page) return { title: "Page Not Found" };

  return {
    title: `${page.title} | Ai Social`,
    description: `Read our ${page.title} for more information about Ai Social.`,
  };
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params;
  
  const page = await prisma.staticPage.findUnique({
    where: { slug, isActive: true },
  });

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-16 sm:py-24">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px] opacity-40" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400 rounded-full blur-[120px] opacity-20" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-5 duration-700">
            {page.title}
          </h1>
          <div className="mt-4 flex items-center justify-center space-x-2 text-slate-400 text-sm font-medium">
             <span>Updated {new Date(page.updatedAt || new Date()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24 animate-in fade-in duration-1000">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12">
            <article 
              className="prose prose-slate dark:prose-invert max-w-none 
                         prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                         prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed
                         prose-a:text-primary dark:prose-a:text-primary prose-a:font-semibold
                         prose-strong:text-slate-900 dark:prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: page.content || "" }}
            />
        </div>
        
        {/* Footer info */}
        <div className="mt-12 text-center text-slate-500 text-xs">
           <p>© {new Date().getFullYear()} Ai Social. All rights reserved.</p>
           <p className="mt-1 italic">This is an official informational page.</p>
        </div>
      </div>
    </main>
  );
}
