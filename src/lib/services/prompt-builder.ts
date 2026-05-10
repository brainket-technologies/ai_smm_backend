import { AIContext, AIContextBuilder } from "./ai-context-builder";

export class PromptBuilder {
  /**
   * Builds a high-quality prompt for AI Image Generation.
   */
  static buildImagePrompt(params: {
    context: AIContext;
    themePrompt: string;
    focusType: 'business' | 'product' | 'service';
    focusId?: string;
    platform: string;
    customInstructions?: string;
  }): string {
    const businessContext = AIContextBuilder.toContextString(params.context);
    
    let focusDetail = "";
    if (params.focusType === 'product' && params.focusId) {
      const product = params.context.offerings.products.find(p => p.name === params.focusId);
      if (product) focusDetail = `Specifically feature the product: "${product.name}" (${product.description}).`;
    } else if (params.focusType === 'service' && params.focusId) {
      const service = params.context.offerings.services.find(s => s.name === params.focusId);
      if (service) focusDetail = `Specifically feature the service: "${service.name}" (${service.description}).`;
    }

    return `
      Task: Generate a high-quality marketing image for ${params.platform}.
      Style Theme: ${params.themePrompt}
      
      Business Context:
      ${businessContext}
      
      Visual Focus:
      ${focusDetail || "General brand imagery for the business."}
      
      Platform Context: The image should be optimized for ${params.platform} visual standards.
      
      Additional Instructions:
      ${params.customInstructions || "Make it eye-catching and professional."}
      
      IMPORTANT: Do not include any placeholder text. The image should be aesthetically pleasing and ready for social media.
    `.trim();
  }

  /**
   * Builds a prompt for AI Content (Captions/Hashtags).
   */
  static buildContentPrompt(params: {
    context: AIContext;
    type: 'caption' | 'hashtags' | 'ideas' | 'calendar';
    platform: string;
    topic?: string;
    language?: string;
  }): string {
    const businessContext = AIContextBuilder.toContextString(params.context);
    const lang = params.language || "English";

    let taskDescription = "";
    switch (params.type) {
      case 'caption':
        taskDescription = `Write a viral, engaging caption for ${params.platform} about ${params.topic || "our offerings"}. Use a tone that fits ${params.context.business.name}. Language: ${lang}.`;
        break;
      case 'hashtags':
        taskDescription = `Generate 20 trending and niche-specific hashtags for ${params.platform} related to ${params.topic || "our business category"}.`;
        break;
      case 'ideas':
        taskDescription = `Provide 5 viral content ideas for ${params.platform} that would appeal to our target audience.`;
        break;
      case 'calendar':
        taskDescription = `Create a 7-day social media content calendar for ${params.platform}. Include post topics, best times to post, and brief caption ideas for each day.`;
        break;
    }

    return `
      You are a professional social media manager and copywriter.
      
      Business Context:
      ${businessContext}
      
      Task:
      ${taskDescription}
      
      Requirements:
      - Be creative and engaging.
      - Align with the brand's personality.
      - Use appropriate emojis for ${params.platform}.
      - Output should be in ${lang}.
    `.trim();
  }
}
