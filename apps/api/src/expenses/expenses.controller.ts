import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Logger,
  Query,
  Request,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { Expense } from "@cosmo/database";

@ApiTags("expenses")
@Controller("expenses")
export class ExpensesController {
  private readonly logger = new Logger(ExpensesController.name);

  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Obtener todos los gastos del usuario" })
  @ApiResponse({
    status: 200,
    description: "Lista de gastos del usuario",
    type: [Expense],
  })
  async findAll(@Request() req: any) {
    const userId = req.user.id;
    this.logger.log(`Buscando gastos para el usuario ${userId}`);
    return this.expensesService.findAllByUserId(userId);
  }

  @Post("sync")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Sincronizar gastos desde un sistema externo" })
  @ApiResponse({
    status: 201,
    description: "Gastos sincronizados correctamente",
    type: [Expense],
  })
  async syncExpenses(
    @Request() req: any,
    @Body() data: { expenses: any[]; sourceSystem: string }
  ) {
    const userId = req.user.id;
    this.logger.log(
      `Recibida petición para sincronizar ${data.expenses.length} gastos para el usuario ${userId}`
    );

    try {
      const syncedExpenses =
        await this.expensesService.syncExpensesFromExternalSystem(
          data.expenses,
          userId,
          data.sourceSystem
        );

      return {
        message: "Gastos sincronizados correctamente",
        count: syncedExpenses.length,
        expenses: syncedExpenses,
      };
    } catch (error: any) {
      this.logger.error(`Error en la sincronización: ${error.message}`);
      throw error;
    }
  }

  /**
   * Nuevo endpoint que simula la sincronización sin guardar en base de datos
   * Esta es una solución temporal para evitar guardar datos sensibles
   */
  @Post("sync-memory")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Simular sincronización sin guardar datos en la base de datos",
  })
  @ApiResponse({
    status: 200,
    description: "Simulación de sincronización exitosa",
  })
  async syncExpensesInMemory(
    @Request() req: any,
    @Body() data: { expenses: any[]; sourceSystem: string }
  ) {
    const userId = req.user.id;
    this.logger.log(
      `Recibida petición para sincronización en memoria de ${data.expenses.length} gastos para el usuario ${userId}`
    );

    try {
      // No guardamos nada en la base de datos, solo registramos la acción
      // y devolvemos una respuesta exitosa
      this.logger.log(
        `Simulando sincronización exitosa para ${data.expenses.length} gastos`
      );

      return {
        message: "Sincronización en memoria completada correctamente",
        count: data.expenses.length,
      };
    } catch (error: any) {
      this.logger.error(
        `Error en la simulación de sincronización: ${error.message}`
      );
      throw error;
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Crear un nuevo gasto" })
  @ApiResponse({
    status: 201,
    description: "El gasto ha sido creado correctamente",
    type: Expense,
  })
  async create(@Request() req: any, @Body() expenseData: Partial<Expense>) {
    const userId = req.user.id;
    return this.expensesService.create({
      ...expenseData,
      userId,
    });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Obtener un gasto por ID" })
  @ApiResponse({
    status: 200,
    description: "Detalles del gasto",
    type: Expense,
  })
  async findOne(@Param("id") id: string, @Request() req: any) {
    // En una implementación real, validaríamos que el gasto pertenece al usuario
    return this.expensesService.findOne(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Actualizar un gasto" })
  @ApiResponse({
    status: 200,
    description: "El gasto ha sido actualizado correctamente",
    type: Expense,
  })
  async update(
    @Param("id") id: string,
    @Body() expenseData: Partial<Expense>,
    @Request() req: any
  ) {
    // En una implementación real, validaríamos que el gasto pertenece al usuario
    return this.expensesService.update(id, expenseData);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Eliminar un gasto" })
  @ApiResponse({
    status: 200,
    description: "El gasto ha sido eliminado correctamente",
  })
  async remove(@Param("id") id: string, @Request() req: any) {
    // En una implementación real, validaríamos que el gasto pertenece al usuario
    await this.expensesService.remove(id);
    return { message: "Gasto eliminado correctamente" };
  }
}
