import axios from "axios";
import { BaseAIProvider, AIResponse } from "./base-provider";

export class GeminiProvider extends BaseAIProvider {
  async generateText(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const response = await axios.post(url, {
      contents: [
        {
          parts: [{ text: `${systemInstruction ? systemInstruction + "\n\n" : ""}${prompt}` }]
        }
      ]
    });

    // Gemini token count logic usually requires a separate call or is in metadata
    // For now we'll approximate or use provided metadata if available
    const text = response.data.candidates[0].content.parts[0].text;
    
    return {
      text,
      usage: {
        inputTokens: response.data.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  }

  async generateImage(prompt: string): Promise<AIResponse> {
    // Note: Gemini doesn't have a direct image gen API in the same way OpenAI does yet
    // Usually people use Imagen 2 via Vertex AI, but for Google AI Studio it's limited.
    // We'll mark it as not supported or use a fallback if needed.
    throw new Error("Gemini Image Generation not implemented via standard REST API yet. Please use OpenAI for images.");
  }
}
