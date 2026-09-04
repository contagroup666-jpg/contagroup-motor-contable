import express from 'express'
import cors from 'cors'
import { nominaRouter } from './routes/nomina.js'
import { facturasRouter } from './routes/facturas.js'
import { analisisRouter } from './routes/analisis.js'
import { activosFijosRouter } from './routes/activosFijos.js'
import { limiterCalculo, limiterConsulta } from './lib/rateLimit.js'
import { manejadorErrores } from './lib/errorHandler.js'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.use(cors())
// Límite de tamaño de body: estos endpoints reciben objetos pequeños
// (sueldos, fechas, ids), 100kb es de sobra y evita payloads abusivos.
app.use(express.json({ limit: '100kb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', servicio: 'contagroup-motor-contable' })
})

// Rate limit por IP. Los endpoints de cálculo puro (nómina, activos fijos)
// son más baratos y se pueden llamar en ráfaga legítima (uno por empleado);
// los que consultan Supabase (facturas, análisis) son más pesados y se
// limitan más estricto.
app.use('/api/nomina', limiterCalculo, nominaRouter)
app.use('/api/activos-fijos', limiterCalculo, activosFijosRouter)
app.use('/api/facturas', limiterConsulta, facturasRouter)
app.use('/api/analisis', limiterConsulta, analisisRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Manejador de errores centralizado — debe ir al final, después de las rutas.
// Express 5 reenvía automáticamente las excepciones de handlers async aquí.
app.use(manejadorErrores)

app.listen(PORT, () => {
  console.log(`contagroup-motor-contable escuchando en el puerto ${PORT}`)
})
