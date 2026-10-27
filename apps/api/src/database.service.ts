import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'
import { readConfig } from './config.js'

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg(
        {
          connectionString: readConfig().databaseUrl,
          connectionTimeoutMillis: 2000,
          query_timeout: 2000,
          max: 5,
        },
        { schema: 'finance' },
      ),
    })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
