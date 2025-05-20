declare module "openai" {
  export class Configuration {
    constructor(options: { apiKey: string });
  }

  export class OpenAIApi {
    constructor(configuration: Configuration);

    createChatCompletion(options: {
      model: string;
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      messages: Array<{
        role: string;
        content: string;
      }>;
    }): Promise<{
      data: {
        choices: Array<{
          message?: {
            content?: string;
          };
        }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };
    }>;
  }
}
