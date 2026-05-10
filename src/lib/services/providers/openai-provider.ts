import axios from "axios";
import { BaseAIProvider, AIResponse } from "./base-provider";

export class OpenAIProvider extends BaseAIProvider {
  async generateText(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: this.model,
        messages: [
          ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      text: response.data.choices[0].message.content,
      usage: {
        inputTokens: response.data.usage.prompt_tokens,
        outputTokens: response.data.usage.completion_tokens,
      },
    };
  }

  async generateImage(prompt: string): Promise<AIResponse> {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      text: "Image generated successfully.",
      mediaUrl: response.data.data[0].url,
      usage: {
        inputTokens: 0, // DALL-E 3 doesn't use tokens in the same way for billing here
        outputTokens: 0,
      },
    };
  }
}
