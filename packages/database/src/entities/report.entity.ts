import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("reports")
export class Report {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: "date" })
  endDate!: Date;

  @Column({ default: "draft", type: "varchar" })
  status!: "draft" | "generated" | "published";

  @Column({ nullable: true, type: "varchar" })
  pdfUrl?: string;

  @Column({ nullable: true, type: "varchar" })
  reportType?: "sustainability" | "expense" | "summary";

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: "float", nullable: true })
  sustainabilityScore?: number;

  @Column({ type: "float", nullable: true })
  totalGreenExpenses?: number;

  @Column({ type: "float", nullable: true })
  totalNonGreenExpenses?: number;

  @Column({ type: "float", nullable: true })
  carbonFootprint?: number;

  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  userId!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
