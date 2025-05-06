import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello(): { message: string } {
    return { message: "Bienvenido a la API de Cosmo" };
  }

  @Get("health")
  getHealth(): { status: string; timestamp: string } {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
