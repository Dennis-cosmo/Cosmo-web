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

export type ExpenseStatus = "pending" | "approved" | "rejected" | "archived";

@Entity("expenses")
export class Expense {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: "varchar" })
  description!: string;

  @Column({ type: "date" })
  date!: Date;

  @Column({ nullable: true, type: "varchar" })
  category?: string;

  @Column({ default: "pending", type: "varchar" })
  status!: ExpenseStatus;

  @Column({ default: false, type: "boolean" })
  isGreen!: boolean;

  @Column({ nullable: true, type: "float" })
  confidenceScore?: number;

  @Column({ nullable: true, type: "varchar" })
  greenCategory?: string;

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true, type: "varchar" })
  receipt?: string;

  @Column({ nullable: true, type: "varchar" })
  tags?: string;

  @Column({ nullable: true, type: "varchar" })
  vendor?: string;

  @ManyToOne(() => User, (user) => user.expenses)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  userId!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
