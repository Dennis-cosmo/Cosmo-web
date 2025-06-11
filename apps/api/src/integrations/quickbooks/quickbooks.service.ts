import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@cosmo/database";

@Injectable()
export class QuickBooksService {
  private readonly logger = new Logger(QuickBooksService.name);
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService
  ) {
    this.apiUrl = this.configService.get<string>("QUICKBOOKS_API_URL") || "";
    this.clientId =
      this.configService.get<string>("QUICKBOOKS_CLIENT_ID") || "";
    this.clientSecret =
      this.configService.get<string>("QUICKBOOKS_CLIENT_SECRET") || "";
  }

  /**
   * Obtiene los gastos de QuickBooks para un usuario
   */
  async getExpenses(
    user: User,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      // Verificar que el usuario tenga un token de acceso válido
      if (!user.quickbooksAccessToken) {
        throw new Error("No hay token de acceso de QuickBooks");
      }

      // Construir la URL para obtener los gastos
      const url = `${this.apiUrl}/v3/company/${user.quickbooksCompanyId}/reports/ProfitAndLoss`;

      // Realizar la petición a QuickBooks
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.quickbooksAccessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error al obtener gastos de QuickBooks: ${response.statusText}`
        );
      }

      const data = await response.json();
      return this.transformExpenses(data);
    } catch (error: any) {
      this.logger.error(
        `Error al obtener gastos de QuickBooks: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Transforma los datos de QuickBooks al formato de nuestra aplicación
   */
  private transformExpenses(data: any): any[] {
    // Aquí implementaríamos la lógica para transformar los datos
    // de QuickBooks al formato que espera nuestra aplicación
    return [];
  }

  /**
   * Actualiza el token de acceso de QuickBooks para un usuario
   */
  async updateAccessToken(
    user: User,
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    try {
      await this.userRepository.update(user.id, {
        quickbooksAccessToken: accessToken,
        quickbooksRefreshToken: refreshToken,
      });
    } catch (error: any) {
      this.logger.error(
        `Error al actualizar token de QuickBooks: ${error.message}`
      );
      throw error;
    }
  }
}
