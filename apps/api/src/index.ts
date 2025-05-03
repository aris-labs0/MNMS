import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { jwt,sign } from 'hono/jwt'


import onboardingRoutes from "./routes/onboarding/routes"
import tasksRoutes from "./routes/tasks/routes"
import telemetryRoutes from "./routes/telemetry-ingest/routes"
import verifyTokenRoutes from "./routes/routes"
const app = new Hono()
app.use('*', logger())
app.use(
  '/api/*',
  jwt({
    secret: process.env.JWT_SECRET!,
  })
)
app.route('/', verifyTokenRoutes)
app.route('/api/tasks', tasksRoutes)
app.route('/api/telemetry', telemetryRoutes)
app.route('/api/onboarding', onboardingRoutes)

const port = 3001
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})