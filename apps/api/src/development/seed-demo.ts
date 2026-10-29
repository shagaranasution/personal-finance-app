import type { PrismaClient } from '../generated/prisma/client.js'
import { getLocalDemoOwnerId } from './demo-owner.js'
import { demoBalance, demoPots, validateDemoAmounts } from './seed-data.js'

export async function seedDemo(database: PrismaClient): Promise<void> {
  const ownerId = getLocalDemoOwnerId()
  validateDemoAmounts()

  // Empty updates preserve user experiments. Any conflict/failure rolls back all inserts.
  await database.$transaction(async (transaction) => {
    await transaction.accountOwner.upsert({
      where: { id: ownerId },
      create: { id: ownerId, displayName: 'Local demo owner' },
      update: {},
    })
    await transaction.balanceSnapshot.upsert({
      where: { ownerId },
      create: { ...demoBalance, ownerId },
      update: {},
    })
    for (const pot of demoPots) {
      // Refuse to silently accept a seed ID that belongs to another owner.
      const existing = await transaction.pot.findUnique({ where: { id: pot.id } })
      if (existing && existing.ownerId !== ownerId) {
        throw new Error('Demo pot ID belongs to a different owner')
      }
      await transaction.pot.upsert({
        where: { id: pot.id },
        create: { ...pot, ownerId },
        update: {},
      })
    }
  })
}
