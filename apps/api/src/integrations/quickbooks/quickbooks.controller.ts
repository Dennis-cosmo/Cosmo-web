import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { QuickBooksService } from "./quickbooks.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { Request } from "express";
import { User } from "@cosmo/database";

interface RequestWithUser extends Request {
  user: User;
}

@Controller("integrations/quickbooks")
@UseGuards(JwtAuthGuard)
export class QuickBooksController {
  constructor(private readonly quickBooksService: QuickBooksService) {}

  @Post("sync")
  async syncExpenses(@Req() req: RequestWithUser) {
    const user = req.user;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Últimos 30 días
    const endDate = new Date();

    const expenses = await this.quickBooksService.getExpenses(
      user,
      startDate,
      endDate
    );

    return {
      success: true,
      data: expenses,
    };
  }

  @Post("token")
  async updateToken(
    @Req() req: RequestWithUser,
    @Body() body: { accessToken: string; refreshToken: string }
  ) {
    await this.quickBooksService.updateAccessToken(
      req.user,
      body.accessToken,
      body.refreshToken
    );

    return {
      success: true,
      message: "Token actualizado correctamente",
    };
  }
}
