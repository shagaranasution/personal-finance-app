import 'dotenv/config'

export function readConfig() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) throw new Error('DATABASE_URL is required in apps/api/.env')

  let url: URL

  try {
    url = new URL(databaseUrl)
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URL')
  }

  if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must use PostgreSQL')
  }

  const rawPort = process.env.PORT ?? '3000'
  const port = Number(rawPort)

  if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535')
  }

  return { databaseUrl, port }
}
