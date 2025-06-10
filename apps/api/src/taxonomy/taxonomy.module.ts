import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";

import { TaxonomyService } from "./taxonomy.service";
import { TaxonomyController } from "./taxonomy.controller";
import { TaxonomySector } from "./entities/taxonomy-sector.entity";
import { TaxonomyActivity } from "./entities/taxonomy-activity.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxonomySector, TaxonomyActivity]),
    ConfigModule,
    AuthModule,
  ],
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}
