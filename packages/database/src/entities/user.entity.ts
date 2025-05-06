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

  @Column({ nullable: true, type: "varchar" })
  companyName?: string;

  @Column({ nullable: true, type: "varchar" })
  companySize?: string;

  @Column({ nullable: true, type: "varchar" })
  industry?: string;

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses!: Expense[];

  @OneToMany(() => Report, (report) => report.user)
  reports!: Report[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
