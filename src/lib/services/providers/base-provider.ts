export interface AIResponse {
  text: string;
  mediaUrl?: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export abstract class BaseAIProvider {
  protected apiKey: string;
  protected model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  abstract generateText(prompt: string, systemInstruction?: string): Promise<AIResponse>;
  abstract generateImage(prompt: string): Promise<AIResponse>;
}
