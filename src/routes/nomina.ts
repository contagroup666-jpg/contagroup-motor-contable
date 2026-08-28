import { Router } from 'express'
import { calcularNominaMensual, calcularDecimos } from '../lib/nomina.js'

export const nominaRouter = Router()

nominaRouter.post('/calcular', (req, res) => {
  try {
    const { sueldoMensual, mesesAntiguedad, horasExtra50, horasExtra100, comisiones } = req.body ?? {}
    if (typeof sueldoMensual !== 'number' || typeof mesesAntiguedad !== 'number') {
      return res.status(400).json({ error: 'sueldoMensual y mesesAntiguedad son requeridos y deben ser números' })
    }
    const resultado = calcularNominaMensual({ sueldoMensual, mesesAntiguedad, horasExtra50, horasExtra100, comisiones })
    res.json(resultado)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error al calcular la nómina' })
  }
})

nominaRouter.post('/decimos', (req, res) => {
  try {
    const { sumaIngresosAnuales, mesesTrabajadosEnPeriodo } = req.body ?? {}
    if (typeof sumaIngresosAnuales !== 'number') {
      return res.status(400).json({ error: 'sumaIngresosAnuales es requerido y debe ser número' })
    }
    const resultado = calcularDecimos(sumaIngresosAnuales, mesesTrabajadosEnPeriodo)
    res.json(resultado)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error al calcular los décimos' })
  }
})
