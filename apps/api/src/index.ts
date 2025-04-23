import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import {db} from "@mnms/db"

const app = new Hono()

app.get('/', async (c) => {
  const data = await db.query.keys.findFirst()
  console.log(data)
  return c.json(data)
})

serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
