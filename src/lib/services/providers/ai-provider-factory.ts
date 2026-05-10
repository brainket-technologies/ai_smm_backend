import { prisma } from "@/lib/prisma";
import { OpenAIProvider } from "./openai-provider";
import { GeminiProvider } from "./gemini-provider";
import { BaseAIProvider } from "./base-provider";

export class AIProviderFactory {
  static async getProvider(modelKey: string): Promise<BaseAIProvider> {
    const model = await prisma.aIModel.findUnique({
      where: { modelKey }
    });

    if (!model || !model.apiKey) {
      throw new Error(`AI Model ${modelKey} not found or API key missing.`);
    }

    switch (model.provider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(model.apiKey, model.modelKey);
      case 'google':
      case 'gemini':
        return new GeminiProvider(model.apiKey, model.modelKey);
      default:
        throw new Error(`Provider ${model.provider} not supported.`);
    }
  }

  /**
   * Helper to get the default provider for a specific task.
   */
  static async getDefaultProvider(type: 'text' | 'image'): Promise<BaseAIProvider> {
    const model = await prisma.aIModel.findFirst({
      where: { modelType: type, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!model) {
      throw new Error(`No active AI model found for type: ${type}`);
    }

    return this.getProvider(model.modelKey);
  }
}
