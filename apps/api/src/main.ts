import { createApp } from './app.js'
import { readConfig } from './config.js'

async function bootstrap() {
  const { port } = readConfig()
  const app = await createApp()
  await app.listen(port, '127.0.0.1')
}

bootstrap().catch(() => {
  console.error('API startup failed. Check server environment configuration and port availability.')
  process.exitCode = 1
})
