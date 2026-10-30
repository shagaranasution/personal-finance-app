import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database.module.js'
import { PotsController } from './pots.controller.js'
import { PotsService } from './pots.service.js'

@Module({
  imports: [DatabaseModule],
  controllers: [PotsController],
  providers: [PotsService],
})
export class PotsModule {}
