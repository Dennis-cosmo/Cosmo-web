import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiProvider } from "../interfaces/ai-provider.interface";
import { OpenAiProvider } from "../providers/openai.provider";
import { DeepSeekProvider } from "../providers/deepseek.provider";

/**
 * Tipos de proveedores de IA soportados
 */
export type AiProviderType = "openai" | "deepseek";

@Injectable()
export class AiProviderFactory {
  private readonly logger = new Logger(AiProviderFactory.name);
  private providers: Map<AiProviderType, AiProvider> = new Map();

  constructor(
    private configService: ConfigService,
    private openAiProvider: OpenAiProvider,
    private deepSeekProvider: DeepSeekProvider
  ) {
    // Inicializar y registrar proveedores disponibles
    this.providers.set("openai", this.openAiProvider);
    this.providers.set("deepseek", this.deepSeekProvider);
  }

  /**
   * Obtiene el proveedor de IA configurado por defecto
   */
  getDefaultProvider(): AiProvider {
    const defaultProviderType =
      this.configService.get<AiProviderType>("DEFAULT_AI_PROVIDER") || "openai";

    return this.getProvider(defaultProviderType);
  }

  /**
   * Obtiene un proveedor específico por su tipo
   * @param type Tipo de proveedor
   * @returns Instancia del proveedor
   */
  getProvider(type: AiProviderType): AiProvider {
    const provider = this.providers.get(type);

    if (!provider) {
      this.logger.warn(
        `Proveedor de IA '${type}' no encontrado, usando OpenAI como respaldo`
      );
      return this.providers.get("openai")!;
    }

    return provider;
  }

  /**
   * Verifica si un proveedor está disponible
   * @param type Tipo de proveedor
   * @returns true si está disponible
   */
  isProviderAvailable(type: AiProviderType): boolean {
    return this.providers.has(type);
  }

  /**
   * Obtiene una lista de todos los proveedores disponibles
   */
  getAvailableProviders(): AiProviderType[] {
    return Array.from(this.providers.keys());
  }
}
