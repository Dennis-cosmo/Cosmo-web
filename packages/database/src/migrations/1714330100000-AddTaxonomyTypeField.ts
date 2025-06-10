import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaxonomyTypeField1714330100000 implements MigrationInterface {
  name = "AddTaxonomyTypeField1714330100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "taxonomyType" VARCHAR NULL,
      ADD CONSTRAINT "CHK_users_taxonomy_type" 
      CHECK ("taxonomyType" IN ('EU', 'LATAM') OR "taxonomyType" IS NULL)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP CONSTRAINT IF EXISTS "CHK_users_taxonomy_type",
      DROP COLUMN IF EXISTS "taxonomyType"
    `);
  }
}
