import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { LessThan } from "typeorm";
import { AiCache } from "../entities/ai-cache.entity";
import * as crypto from "crypto";

@Injectable()
export class AiCacheService {
  private readonly logger = new Logger(AiCacheService.name);

  constructor(
    @InjectRepository(AiCache)
    private cacheRepository: Repository<AiCache>
  ) {}

  /**
   * Genera una clave hash para el caché basada en los datos y el prompt
   */
  private generateCacheKey(data: any, prompt: string): string {
    const content = JSON.stringify({ data, prompt });
    return crypto.createHash("md5").update(content).digest("hex");
  }

  /**
   * Intenta obtener un resultado cacheado
   * @returns El resultado cacheado o null si no existe o ha expirado
   */
  async getCachedResult<T>(data: any, prompt: string): Promise<T | null> {
    try {
      const cacheKey = this.generateCacheKey(data, prompt);
      const cached = await this.cacheRepository.findOne({
        where: { key: cacheKey },
      });

      if (cached && cached.expiresAt > new Date()) {
        this.logger.debug(
          `Resultado encontrado en caché para la clave: ${cacheKey}`
        );
        return JSON.parse(cached.result) as T;
      }

      // Si el resultado existe pero está expirado, lo eliminamos
      if (cached) {
        await this.cacheRepository.remove(cached);
        this.logger.debug(
          `Eliminado resultado expirado para la clave: ${cacheKey}`
        );
      }

      return null;
    } catch (error: any) {
      this.logger.error(
        `Error al obtener resultado de caché: ${error.message}`
      );
      // En caso de error, simplemente retornamos null para continuar con la solicitud normal
      return null;
    }
  }

  /**
   * Guarda un resultado en caché
   * @param ttlHours Tiempo de vida en horas
   */
  async cacheResult<T>(
    data: any,
    prompt: string,
    result: T,
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
      model?: string;
    },
    ttlHours = 24
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(data, prompt);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);

      // Eliminar entrada anterior si existe
      await this.cacheRepository.delete({ key: cacheKey });

      // Guardar nueva entrada
      await this.cacheRepository.save({
        key: cacheKey,
        result: JSON.stringify(result),
        createdAt: new Date(),
        expiresAt,
        promptTokens: usage?.promptTokens,
        completionTokens: usage?.completionTokens,
        totalTokens: usage?.totalTokens,
        model: usage?.model,
      });

      this.logger.debug(
        `Resultado guardado en caché para la clave: ${cacheKey}`
      );
    } catch (error: any) {
      this.logger.error(
        `Error al guardar resultado en caché: ${error.message}`
      );
      // No lanzamos excepción para evitar interrumpir el flujo principal
    }
  }

  /**
   * Limpia las entradas expiradas del caché
   */
  async cleanExpiredCache(): Promise<number> {
    try {
      const now = new Date();
      const result = await this.cacheRepository.delete({
        expiresAt: LessThan(now),
      });
      this.logger.debug(
        `Se eliminaron ${result.affected} entradas expiradas del caché`
      );
      return result.affected || 0;
    } catch (error: any) {
      this.logger.error(`Error al limpiar caché expirado: ${error.message}`);
      return 0;
    }
  }
}
