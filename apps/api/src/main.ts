import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { getMetadataArgsStorage } from "typeorm";

async function bootstrap() {
  // Verificar metadatos de entidades
  const metadataStorage = getMetadataArgsStorage();
  console.log(
    `Inicializando API con ${metadataStorage.tables.length} entidades registradas.`
  );

  const app = await NestFactory.create(AppModule);

  // Seguridad
  app.use(helmet());

  // Habilitar CORS
  app.enableCors();

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Permitir conversiones implícitas
      },
    })
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle("Cosmo API")
    .setDescription(
      "API para la plataforma Cosmo de seguimiento de gastos con enfoque en sostenibilidad"
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Iniciar el servidor en el puerto 4000
  await app.listen(4000);
  console.log(`La aplicación está corriendo en: http://localhost:4000`);
}

bootstrap();
