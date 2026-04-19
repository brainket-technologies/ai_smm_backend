import { getAIPrompts } from "./actions";
import AIPromptManagementClient from "./AIPromptManagementClient";

export default async function AIPromptsPage() {
  const res = await getAIPrompts();
  const initialPrompts = res.success ? res.data : [];

  return (
    <div className="container mx-auto py-6">
      <AIPromptManagementClient initialPrompts={initialPrompts as any} />
    </div>
  );
}
