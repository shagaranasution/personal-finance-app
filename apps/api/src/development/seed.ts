import { DatabaseService } from '../database.service.js'
import { readConfig } from '../config.js'
import { assertLocalSeedDatabase } from './demo-owner.js'
import { seedDemo } from './seed-demo.js'

async function main() {
  assertLocalSeedDatabase(readConfig().databaseUrl)
  const database = new DatabaseService()
  try {
    await seedDemo(database)
    console.log(
      'Local demo owner, IDR balance, and pots are ready. Existing values were preserved.',
    )
  } finally {
    await database.$disconnect()
  }
}

main().catch(() => {
  console.error(
    'Demo seed failed. Check local configuration, migration status, and seed constraints.',
  )
  process.exitCode = 1
})
