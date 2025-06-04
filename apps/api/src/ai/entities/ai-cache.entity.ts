import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from "typeorm";

/**
 * Entidad para almacenar en caché las respuestas de la IA
 * para reducir costos y mejorar el rendimiento
 */
@Entity("ai_cache")
export class AiCache {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  key: string;

  @Column({ type: "text" })
  result: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  promptTokens?: number;

  @Column({ nullable: true })
  completionTokens?: number;

  @Column({ nullable: true })
  totalTokens?: number;

  @Column({ nullable: true })
  model?: string;
}
