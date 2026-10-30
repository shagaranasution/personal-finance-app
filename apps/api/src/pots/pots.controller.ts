import { Controller, Get, Header } from '@nestjs/common'
import { PotsService } from './pots.service.js'

@Controller('pots')
export class PotsController {
  constructor(private readonly pots: PotsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list() {
    return this.pots.list()
  }
}
