import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const pool = new Pool({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
    })
    super({ adapter: new PrismaPg(pool) })
  }

  async onModuleInit() {
    await this.$connect()
  }
}