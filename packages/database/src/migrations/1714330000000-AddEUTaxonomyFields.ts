import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEUTaxonomyFields1714330000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Añadir columnas para la taxonomía de la UE en la tabla de usuarios
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "euTaxonomySectorId" INTEGER NULL,
      ADD COLUMN IF NOT EXISTS "euTaxonomySectorName" VARCHAR NULL,
      ADD COLUMN IF NOT EXISTS "euTaxonomyActivities" JSONB NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar las columnas añadidas
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "euTaxonomyActivities",
      DROP COLUMN IF EXISTS "euTaxonomySectorName",
      DROP COLUMN IF EXISTS "euTaxonomySectorId"
    `);
  }
}
