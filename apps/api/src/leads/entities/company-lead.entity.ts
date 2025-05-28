import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class CompanyLead {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  companyName: string;

  @Column()
  contactEmail: string;

  @Column()
  contactName: string;

  @Column({ nullable: true })
  message?: string;

  @CreateDateColumn()
  createdAt: Date;
}
