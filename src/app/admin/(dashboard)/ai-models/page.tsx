import { getAIModels } from "./actions";
import AIModelManagementClient from "./AIModelManagementClient";

export default async function AIModelsPage() {
  const res = await getAIModels();
  const initialModels = res.success ? res.data : [];

  return (
    <div className="container mx-auto py-6">
      <AIModelManagementClient initialModels={initialModels as any} />
    </div>
  );
}
