import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Req() req) {
    const userId = req.user.id;
    return this.usersService.findOneById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("dashboard-profile")
  async getDashboardProfile(@Req() req) {
    const userId = req.user.id;
    return this.usersService.getUserProfile(userId);
  }
}
