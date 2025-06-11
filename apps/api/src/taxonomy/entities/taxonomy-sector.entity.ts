import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { TaxonomyActivity } from "./taxonomy-activity.entity";

@Entity()
export class TaxonomySector {
  @PrimaryColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  originalName!: string;

  @OneToMany(() => TaxonomyActivity, (activity) => activity.sector)
  activities!: TaxonomyActivity[];
}
