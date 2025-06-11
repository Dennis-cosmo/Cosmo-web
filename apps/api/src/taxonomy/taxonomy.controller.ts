import { Controller, Get, Query, Post, Logger } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TaxonomyService } from "./taxonomy.service";
import { Public } from "../auth/decorators/public.decorator";
import { AdminOnly } from "../auth/decorators/admin-only.decorator";
import { TaxonomySector } from "./entities/taxonomy-sector.entity";
import { TaxonomyActivity } from "./entities/taxonomy-activity.entity";

@ApiTags("taxonomia")
@Controller("taxonomy")
export class TaxonomyController {
  private readonly logger = new Logger(TaxonomyController.name);

  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Public()
  @Get("sectors")
  @ApiOperation({ summary: "Obtener todos los sectores de taxonomía" })
  @ApiResponse({
    status: 200,
    description: "Lista de sectores de taxonomía",
    type: TaxonomySector,
    isArray: true,
  })
  async getSectors(): Promise<TaxonomySector[]> {
    return this.taxonomyService.getSectors();
  }

  @Public()
  @Get("activities/all")
  @ApiOperation({ summary: "Obtener todas las actividades de taxonomía" })
  @ApiResponse({
    status: 200,
    description: "Lista de todas las actividades de taxonomía",
    type: TaxonomyActivity,
    isArray: true,
  })
  async getAllActivities(): Promise<TaxonomyActivity[]> {
    return this.taxonomyService.getAllActivities();
  }

  @Public()
  @Get("activities/search")
  @ApiOperation({ summary: "Buscar actividades por término" })
  @ApiQuery({
    name: "query",
    required: true,
    description: "Término de búsqueda",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de actividades que coinciden con la búsqueda",
    type: TaxonomyActivity,
    isArray: true,
  })
  async searchActivities(
    @Query("query") query: string
  ): Promise<TaxonomyActivity[]> {
    return this.taxonomyService.searchActivities(query);
  }

  @AdminOnly()
  @Post("sync")
  @ApiOperation({
    summary: "Sincronizar datos de taxonomía desde la API externa",
    description:
      "Actualiza la base de datos local con los datos más recientes de la API de taxonomía EU. Solo administradores.",
  })
  @ApiResponse({
    status: 200,
    description: "Sincronización completada correctamente",
  })
  async syncTaxonomyData(): Promise<{ message: string }> {
    try {
      await this.taxonomyService.syncTaxonomyData();
      return { message: "Datos de taxonomía sincronizados correctamente" };
    } catch (error: any) {
      this.logger.error(
        `Error en sincronización de taxonomía: ${error.message}`
      );
      throw error;
    }
  }
}
