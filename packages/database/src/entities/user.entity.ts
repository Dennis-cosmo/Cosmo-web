import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Expense } from "./expense.entity";
import { Report } from "./report.entity";

export enum CompanySize {
  MICRO = "1-10",
  SMALL = "11-50",
  MEDIUM = "51-200",
  LARGE = "201-1000",
  ENTERPRISE = "1000+",
}

export enum SustainabilityLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  LEADER = "leader",
}

// Interfaz para almacenar información de actividades económicas según la taxonomía de la UE
export interface EconomicActivity {
  id: number; // ID de la actividad
  name: string; // Nombre de la actividad
  naceCodes?: string[]; // Códigos NACE asociados
  sectorId: number; // ID del sector al que pertenece
  sectorName?: string; // Nombre del sector al que pertenece
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, type: "varchar" })
  email!: string;

  @Column({ type: "varchar" })
  passwordHash!: string;

  @Column({ nullable: true, type: "varchar" })
  firstName?: string;

  @Column({ nullable: true, type: "varchar" })
  lastName?: string;

  @Column({ default: false, type: "boolean" })
  isAdmin!: boolean;

  @Column({ default: "active", type: "varchar" })
  status!: "active" | "inactive" | "suspended";

  // Información de la empresa
  @Column({ nullable: true, type: "varchar" })
  companyName?: string;

  @Column({ nullable: true, type: "varchar" })
  companyLegalName?: string;

  @Column({ nullable: true, type: "varchar" })
  taxId?: string;

  @Column({ nullable: true, type: "varchar" })
  companySize?: string;

  @Column({ nullable: true, type: "varchar" })
  industry?: string;

  @Column({ nullable: true, type: "varchar" })
  website?: string;

  @Column({ nullable: true, type: "varchar" })
  country?: string;

  @Column({ nullable: true, type: "varchar" })
  address?: string;

  // Taxonomía de la UE
  @Column({ nullable: true, type: "simple-array" })
  euTaxonomySectorIds?: number[];

  @Column({ nullable: true, type: "simple-array" })
  euTaxonomySectorNames?: string[];

  @Column({ nullable: true, type: "json" })
  euTaxonomyActivities?: EconomicActivity[];

  // Información de sostenibilidad
  @Column({
    nullable: true,
    type: "varchar",
    default: SustainabilityLevel.BEGINNER,
  })
  sustainabilityLevel?: string;

  @Column({ nullable: true, type: "simple-array" })
  sustainabilityGoals?: string[];

  @Column({ nullable: true, type: "simple-array" })
  certifications?: string[];

  @Column({ nullable: true, type: "varchar" })
  sustainabilityBudgetRange?: string;

  @Column({ nullable: true, type: "text" })
  sustainabilityNotes?: string;

  // Configuración y verificación
  @Column({ default: false, type: "boolean" })
  emailVerified!: boolean;

  @Column({ nullable: true, type: "varchar" })
  verificationToken?: string;

  @Column({ nullable: true, type: "timestamp" })
  verificationTokenExpiry?: Date;

  @Column({ default: false, type: "boolean" })
  onboardingCompleted!: boolean;

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses!: Expense[];

  @OneToMany(() => Report, (report) => report.user)
  reports!: Report[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
