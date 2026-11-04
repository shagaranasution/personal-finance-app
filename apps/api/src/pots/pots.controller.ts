import { Body, Controller, Get, Header, Post } from '@nestjs/common'
import { CreatePotDto } from './create-pot.dto.js'
import { PotsService } from './pots.service.js'

@Controller('pots')
export class PotsController {
  constructor(private readonly pots: PotsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list() {
    return this.pots.list()
  }

  @Post()
  @Header('Cache-Control', 'no-store')
  create(@Body() input: CreatePotDto) {
    return this.pots.create(input)
  }
}
