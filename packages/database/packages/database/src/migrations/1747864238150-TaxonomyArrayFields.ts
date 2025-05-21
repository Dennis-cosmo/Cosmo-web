import { MigrationInterface, QueryRunner } from "typeorm";

export class TaxonomyArrayFields1747864238150 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear las nuevas columnas de tipo array
    await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS "euTaxonomySectorIds" text,
            ADD COLUMN IF NOT EXISTS "euTaxonomySectorNames" text
        `);

    // 2. Migrar datos existentes de las columnas antiguas a las nuevas
    await queryRunner.query(`
            UPDATE users 
            SET "euTaxonomySectorIds" = ARRAY["euTaxonomySectorId"]::text
            WHERE "euTaxonomySectorId" IS NOT NULL
        `);

    await queryRunner.query(`
            UPDATE users 
            SET "euTaxonomySectorNames" = ARRAY["euTaxonomySectorName"]::text
            WHERE "euTaxonomySectorName" IS NOT NULL
        `);

    // 3. Eliminar las columnas antiguas
    await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN IF EXISTS "euTaxonomySectorId",
            DROP COLUMN IF EXISTS "euTaxonomySectorName"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear las columnas antiguas
    await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS "euTaxonomySectorId" int,
            ADD COLUMN IF NOT EXISTS "euTaxonomySectorName" varchar
        `);

    // 2. Migrar datos existentes (solo el primer elemento del array)
    await queryRunner.query(`
            UPDATE users 
            SET "euTaxonomySectorId" = (string_to_array("euTaxonomySectorIds", ','))[1]::int
            WHERE "euTaxonomySectorIds" IS NOT NULL
        `);

    await queryRunner.query(`
            UPDATE users 
            SET "euTaxonomySectorName" = (string_to_array("euTaxonomySectorNames", ','))[1]
            WHERE "euTaxonomySectorNames" IS NOT NULL
        `);

    // 3. Eliminar las nuevas columnas
    await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN IF EXISTS "euTaxonomySectorIds",
            DROP COLUMN IF EXISTS "euTaxonomySectorNames"
        `);
  }
}
