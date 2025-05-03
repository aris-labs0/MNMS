import { Hono ,type Context} from 'hono'
import { decode, sign, verify } from 'hono/jwt'

const app = new Hono()
  .get('/', (ctx) => services.readTasks(ctx))

export default app


const services = {
    readTasks :async (ctx:Context)=>{
      const jwtPayload = ctx.get('jwtPayload') 

      const token = await sign({
        device_id:jwtPayload.id,
        exp: Math.floor(Date.now() / 1000) + 5,
      },
      process.env.JWT_SECRET!
    )
     return ctx.text(`
      :global payload (\\"\\")
      :set payload (([tostr [interface/monitor-traffic [find] as-value once]])) 
      :set payload (\\$payload.\\"|~*%|\\".([tostr  [interface/print from=[find] as-value]]))
      :set payload (\\$payload.\\"|~*%|\\".([tostr [interface/ethernet/monitor [find] as-value once ]])) 
      :set payload (\\$payload.\\"|~*%|\\".([tostr  [interface/ethernet/print from=[find] proplist=default-name as-value]]))
      :set payload (\\$payload.\\"|~*%|\\".([tostr [system/health/print as-value detail]]))   
      :set payload (\\$payload.\\"|~*%|\\".([tostr [system/resource/print as-value]]))  
      :set payload (\\$payload.\\"|~*%|\\".([tostr [system/routerboard/print as-value]]))  
      :set payload (\\$payload.\\"|~*%|\\".([tostr [system/identity/print as-value ]])) 
      :tool/fetch url=${process.env.URL}/api/telemetry http-method=post http-data=\\$payload http-header-field=\\"Authorization:Bearer ${token} \\" as-value output=user 
      `)
    },
}

