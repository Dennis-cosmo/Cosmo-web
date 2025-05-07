import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1714249800000 implements MigrationInterface {
  name = "CreateInitialSchema1714249800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabla de usuarios
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "firstName" character varying,
        "lastName" character varying,
        "isAdmin" boolean NOT NULL DEFAULT false,
        "status" character varying NOT NULL DEFAULT 'active',
        
        -- Información de la empresa
        "companyName" character varying,
        "companyLegalName" character varying,
        "taxId" character varying,
        "companySize" character varying,
        "industry" character varying,
        "website" character varying,
        "country" character varying,
        "address" character varying,
        
        -- Información de sostenibilidad
        "sustainabilityLevel" character varying DEFAULT 'beginner',
        "sustainabilityGoals" text,
        "certifications" text,
        "sustainabilityBudgetRange" character varying,
        "sustainabilityNotes" text,
        
        -- Verificación y configuración
        "emailVerified" boolean NOT NULL DEFAULT false,
        "verificationToken" character varying,
        "verificationTokenExpiry" TIMESTAMP,
        "onboardingCompleted" boolean NOT NULL DEFAULT false,
        
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Tabla de gastos
    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "amount" numeric NOT NULL,
        "description" character varying NOT NULL,
        "date" TIMESTAMP NOT NULL,
        "category" character varying NOT NULL,
        "sustainabilityScore" integer,
        "sustainabilityNotes" character varying,
        "userId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expenses" PRIMARY KEY ("id")
      )
    `);

    // Tabla de reportes
    await queryRunner.query(`
      CREATE TABLE "reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" character varying,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "type" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'draft',
        "data" jsonb,
        "userId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports" PRIMARY KEY ("id")
      )
    `);

    // Relaciones
    await queryRunner.query(`
      ALTER TABLE "expenses" 
      ADD CONSTRAINT "FK_expenses_users" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "reports" 
      ADD CONSTRAINT "FK_reports_users" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reports" DROP CONSTRAINT "FK_reports_users"
    `);
    await queryRunner.query(`
      ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_users"
    `);
    await queryRunner.query(`DROP TABLE "reports"`);
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
