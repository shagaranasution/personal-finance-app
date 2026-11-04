import { ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client.js'
import type { CreatePotDto } from './create-pot.dto.js'
import { DatabaseService } from '../database.service.js'
import { getLocalDemoOwnerId } from '../development/demo-owner.js'

@Injectable()
export class PotsService {
  constructor(private readonly database: DatabaseService) {}

  async list() {
    // Never take this identity from query parameters or a request body.
    const ownerId = getLocalDemoOwnerId()
    try {
      return await this.database.pot.findMany({
        where: { ownerId },
        select: { id: true, name: true, theme: true, total: true, target: true },
        orderBy: { id: 'asc' },
      })
    } catch {
      throw new ServiceUnavailableException('Pots are temporarily unavailable')
    }
  }

  async create(input: CreatePotDto) {
    const ownerId = getLocalDemoOwnerId()
    try {
      return await this.database.pot.create({
        data: { ownerId, name: input.name, target: input.target, theme: input.theme, total: 0 },
        select: { id: true, name: true, theme: true, total: true, target: true },
      })
    } catch (error) {
      // The unique (ownerId, theme) key arbitrates even simultaneous submissions.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This theme is already used by one of your pots')
      }
      throw new ServiceUnavailableException('Unable to create a pot right now')
    }
  }
}
