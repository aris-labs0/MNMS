import { Hono ,type Context} from 'hono'
import { sign } from 'hono/jwt'
import { zkeysSchema } from "@mnms/db/zod-schemas"
import { validator } from 'hono/validator'
import { db } from "@mnms/db"
import { decrementMaxDevices } from "@mnms/db/mutations"
import { getKeyById } from "@mnms/db/queries"

const app = new Hono()
  .get('/:id',
    validator('param', (value, c) => {
      const parsed = zkeysSchema.idKeySchema.safeParse(value)
      if (!parsed.success) {
        return c.text('Invalid!', 401)
      }
      return parsed.data
    }), (ctx) => services.verifyToken(ctx))


export default app

const services = {
    verifyToken :async (ctx:Context)=>{
      try {
        const key_id = ctx.req.param("id");
        const key = await getKeyById(db, key_id);
    
        if (!key) {
          return new Response("Unauthorized",{ status: 401 })
        }
        
        if (key.expiration_time && Date.now() > key.expiration_time.getTime()){
          return new Response("Expired key, extend the duration or generate a new token from your controller",{ status: 401 })
        }
        
        if (key.max_devices === 0 ) {
          return new Response("Record limit exceeded, expand the limit or generate a new token from your controller",{ status: 401 })
        }
    
        if (key.max_devices !== null ){
          await decrementMaxDevices(db,key_id)
        }

    
        const token = await sign({
          exp: Math.floor(Date.now() / 1000) + 5,
        },
        process.env.JWT_SECRET!,
      )

      return ctx.text(`

        :global payload ("")
        :set payload (([tostr [interface/monitor-traffic [find] as-value once]])) 
        :set payload ($payload."|~*%|".([tostr  [interface/print from=[find] as-value]]))
        :set payload ($payload."|~*%|".([tostr [interface/ethernet/monitor [find] as-value once ]])) 
        :set payload ($payload."|~*%|".([tostr  [interface/ethernet/print from=[find] proplist=default-name as-value]]))
        :set payload ($payload."|~*%|".([tostr [system/health/print as-value detail]]))   
        :set payload ($payload."|~*%|".([tostr [system/resource/print as-value]]))  
        :set payload ($payload."|~*%|".([tostr [system/routerboard/print as-value]]))  
        :set payload ($payload."|~*%|".([tostr [system/identity/print as-value ]])) 

        :local response ([/tool/fetch url=${process.env.URL}/api/onboarding http-data=$payload http-method=post http-header-field="Authorization: bearer ${token}, Content-Type: application/json" as-value output=user]->"data");
        :local script [:parse $response]
        $script
      `)
      } catch (error) {
        return new Response("Unauthorized",{ status: 500 })
      }
    }
}
