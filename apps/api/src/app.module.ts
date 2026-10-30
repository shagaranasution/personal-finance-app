import { PotsModule } from './pots/pots.module.js'
import { Module } from '@nestjs/common'
import { DatabaseModule } from './database.module.js'
import { HealthController } from './health.controller.js'

@Module({ imports: [DatabaseModule, PotsModule], controllers: [HealthController] })
export class AppModule {}
