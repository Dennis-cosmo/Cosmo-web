import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { TaxonomySector } from "./taxonomy-sector.entity";

@Entity()
export class TaxonomyActivity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  sectorId: number;

  @ManyToOne(() => TaxonomySector, (sector) => sector.activities)
  @JoinColumn({ name: "sectorId" })
  sector: TaxonomySector;

  @Column("simple-array", { nullable: true })
  naceCodes: string[];
}
