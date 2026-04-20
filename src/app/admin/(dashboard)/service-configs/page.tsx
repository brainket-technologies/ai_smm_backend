 import { Metadata } from 'next';
import ExternalServiceManagement from './ExternalServiceManagement';
import { getExternalServiceConfigs } from './service-actions';

export const metadata: Metadata = {
  title: '3rd Party Config | Admin Dashboard',
  description: 'Manage external service providers for OTP, Mail, Storage, and Notifications.',
};

export default async function ServiceConfigsPage() {
  let initialConfigs: any[] = [];
  try {
    const result = await getExternalServiceConfigs();
    initialConfigs = result.success ? result.data : [];
  } catch (e) {
    console.error("ServiceConfigsPage load error:", e);
  }

  return (
    <div className="p-6 pb-20">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">3rd Party Configuration</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium italic">Manage external service providers and API keys</p>
        </div>
      </div>

      <ExternalServiceManagement initialConfigs={initialConfigs as any} />
    </div>
  );
}
