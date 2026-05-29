import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InsightController } from './insight.controller';
import { InsightService } from './insight.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [InsightController],
  providers: [InsightService],
})
export class InsightModule {}
