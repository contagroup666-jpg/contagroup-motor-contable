import express from 'express'
import cors from 'cors'
import { nominaRouter } from './routes/nomina.js'
import { facturasRouter } from './routes/facturas.js'
import { analisisRouter } from './routes/analisis.js'
import { activosFijosRouter } from './routes/activosFijos.js'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', servicio: 'contagroup-motor-contable' })
})

app.use('/api/nomina', nominaRouter)
app.use('/api/facturas', facturasRouter)
app.use('/api/analisis', analisisRouter)
app.use('/api/activos-fijos', activosFijosRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
  console.log(`contagroup-motor-contable escuchando en el puerto ${PORT}`)
})
