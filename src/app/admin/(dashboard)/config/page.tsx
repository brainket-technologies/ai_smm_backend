import prisma from "@/lib/prisma";
import { 
  Settings, Save, AlertTriangle, Smartphone, Tablet, Globe, 
  ShieldAlert, Mail, Link as LinkIcon, Clock, Cpu, 
  CheckCircle2, Zap
} from "lucide-react";
import { getConfig, initConfig } from "./actions";
import ConfigForm from "./ConfigForm";

export const dynamic = 'force-dynamic';

export default async function ConfigPage() {
  const { config, platforms } = await getConfig();

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Configuration Missing</h2>
        <p className="text-slate-500 mt-2 max-w-sm">Please initialize the database config to start.</p>
        
        <form action={initConfig} className="mt-8">
          <button 
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Settings className="h-4 w-4" />
            <span>Initialize System Config</span>
          </button>
        </form>
      </div>
    );
  }

  return <ConfigForm config={config} platforms={platforms} />;
}
