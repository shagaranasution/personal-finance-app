// Temporary local identity. FIN-23+ must resolve ownership from authenticated sessions.
const DEMO_OWNER_ID = '00000000-0000-4000-8000-000000000001'

export function getLocalDemoOwnerId(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo ownership is disabled in production')
  }
  return DEMO_OWNER_ID
}

export function assertLocalSeedDatabase(databaseUrl: string): void {
  getLocalDemoOwnerId()
  const host = new URL(databaseUrl).hostname
  if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) {
    throw new Error('Demo seeding requires a localhost database')
  }
}
