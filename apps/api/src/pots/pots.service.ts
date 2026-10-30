import { Injectable, ServiceUnavailableException } from '@nestjs/common'
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
}
