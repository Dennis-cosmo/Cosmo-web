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

@Entity("sync_logs")
export class SyncLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  companyId!: string;

  @Column({ type: "varchar" })
  sourceSystem!: string;

  @Column({ type: "timestamp" })
  syncDate!: Date;

  @Column({ type: "json" })
  syncStats!: {
    totalItems: number;
    newItems: number;
    updatedItems: number;
    failedItems: number;
    duration: number; // en milisegundos
  };

  @Column({ type: "varchar", nullable: true })
  error?: string;

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: "varchar", default: "completed" })
  status!: "pending" | "in_progress" | "completed" | "failed";

  @ManyToOne(() => User, (user) => user.syncLogs)
  @JoinColumn({ name: "userId" })
  user!: User;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
