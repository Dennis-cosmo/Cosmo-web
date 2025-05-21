import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  TaxonomyService,
  TaxonomySector,
  TaxonomyActivity,
} from "./taxonomy.service";

@ApiTags("taxonomia")
@Controller("taxonomy")
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get("sectors")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Obtiene todos los sectores de la taxonomía UE" })
  @ApiQuery({
    name: "objective",
    required: false,
    type: Number,
    description:
      "ID del objetivo (por defecto: 41 - mitigación del cambio climático)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de sectores obtenida correctamente",
  })
  async getSectors(
    @Query("objective") objective?: number
  ): Promise<TaxonomySector[]> {
    return this.taxonomyService.getSectors(objective || 41);
  }

  @Get("activities/sector/:sectorId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Obtiene actividades económicas por sector" })
  @ApiParam({ name: "sectorId", type: Number, description: "ID del sector" })
  @ApiResponse({
    status: 200,
    description: "Lista de actividades obtenida correctamente",
  })
  async getActivitiesBySector(
    @Param("sectorId", ParseIntPipe) sectorId: number
  ): Promise<TaxonomyActivity[]> {
    return this.taxonomyService.getActivitiesBySector(sectorId);
  }

  @Get("activities/:activityId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Obtiene detalles de una actividad específica" })
  @ApiParam({
    name: "activityId",
    type: Number,
    description: "ID de la actividad",
  })
  @ApiResponse({
    status: 200,
    description: "Detalles de la actividad obtenidos correctamente",
  })
  async getActivityDetails(
    @Param("activityId", ParseIntPipe) activityId: number
  ): Promise<TaxonomyActivity | null> {
    return this.taxonomyService.getActivityDetails(activityId);
  }

  @Get("activities/search")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Busca actividades económicas por texto" })
  @ApiQuery({
    name: "query",
    required: true,
    type: String,
    description: "Texto a buscar",
  })
  @ApiResponse({
    status: 200,
    description: "Resultados de búsqueda obtenidos correctamente",
  })
  async searchActivities(
    @Query("query") query: string
  ): Promise<TaxonomyActivity[]> {
    return this.taxonomyService.searchActivities(query);
  }
}
