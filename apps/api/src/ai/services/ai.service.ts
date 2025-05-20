import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AiMessage,
  AiProviderOptions,
  AiProviderResponse,
} from "../interfaces/ai-provider.interface";
import { AiProviderFactory, AiProviderType } from "./ai-provider.factory";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private configService: ConfigService,
    private aiProviderFactory: AiProviderFactory
  ) {}

  /**
   * Método genérico para procesar datos con IA
   * @param data Los datos a procesar
   * @param prompt El prompt base para procesar los datos
   * @param options Opciones adicionales
   * @param providerType Tipo de proveedor a utilizar (opcional)
   * @returns Respuesta procesada por la IA
   */
  async processWithAI<T, R>(
    data: T,
    prompt: string,
    options: AiProviderOptions = {},
    providerType?: AiProviderType
  ): Promise<R> {
    const startTime = Date.now();

    try {
      // Obtener el proveedor adecuado (el especificado o el predeterminado)
      const provider = providerType
        ? this.aiProviderFactory.getProvider(providerType)
        : this.aiProviderFactory.getDefaultProvider();

      this.logger.debug(`Usando proveedor de IA: ${provider.providerName}`);

      // Construir mensajes para el proveedor
      const messages: AiMessage[] = [
        {
          role: "system",
          content:
            options.systemInstruction ||
            "Analiza los siguientes datos y proporciona un resultado estructurado.",
        },
        {
          role: "user",
          content: `${prompt}\n\nDatos: ${JSON.stringify(data, null, 2)}`,
        },
      ];

      // Procesar con el proveedor seleccionado
      const response = await provider.processPrompt<R>(messages, options);

      const processingTime = Date.now() - startTime;
      this.logger.debug(
        `Procesamiento de IA con ${provider.providerName} completado en ${processingTime}ms`
      );

      return response.result;
    } catch (error: any) {
      this.logger.error(
        `Error al procesar datos con IA: ${error.message}`,
        error.stack
      );
      throw new Error(`Error en procesamiento de IA: ${error.message}`);
    }
  }

  /**
   * Obtiene la lista de proveedores disponibles
   */
  getAvailableProviders(): AiProviderType[] {
    return this.aiProviderFactory.getAvailableProviders();
  }

  /**
   * Cambia el proveedor de IA predeterminado temporalmente
   * @param callback Función a ejecutar con el proveedor temporal
   * @param providerType Tipo de proveedor a utilizar
   */
  async withProvider<T>(
    callback: (provider: any) => Promise<T>,
    providerType: AiProviderType
  ): Promise<T> {
    const provider = this.aiProviderFactory.getProvider(providerType);
    return callback(provider);
  }
}
