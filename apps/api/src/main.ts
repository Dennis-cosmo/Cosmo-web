import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { getMetadataArgsStorage } from "typeorm";
import { TaxonomyService } from "./taxonomy/taxonomy.service";

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

  // Sincronizar datos de taxonomía si es necesario
  try {
    const taxonomyService = app.get(TaxonomyService);

    // Verificar si hay sectores en la base de datos
    const sectors = await taxonomyService.getSectors();

    // Si no hay sectores, iniciar sincronización
    if (!sectors || sectors.length === 0) {
      console.log(
        "No se encontraron datos de taxonomía, iniciando sincronización..."
      );
      await taxonomyService.syncTaxonomyData();
    } else {
      console.log(`Datos de taxonomía encontrados: ${sectors.length} sectores`);
    }
  } catch (error) {
    console.error("Error al verificar datos de taxonomía:", error.message);
  }

  // Iniciar el servidor en el puerto 4000
  await app.listen(4000);
  console.log(`La aplicación está corriendo en: http://localhost:4000`);
}

bootstrap();
