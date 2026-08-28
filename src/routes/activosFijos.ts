import { Router } from 'express'
import { calcularDepreciacion } from '../lib/depreciacion.js'

export const activosFijosRouter = Router()

activosFijosRouter.post('/depreciacion', (req, res) => {
  try {
    const { valorCompra, valorResidual, vidaUtilAnios, fechaCompra, fechaCorte } = req.body ?? {}
    if (
      typeof valorCompra !== 'number' ||
      typeof valorResidual !== 'number' ||
      typeof vidaUtilAnios !== 'number' ||
      typeof fechaCompra !== 'string'
    ) {
      return res.status(400).json({
        error: 'valorCompra, valorResidual, vidaUtilAnios (números) y fechaCompra (string) son requeridos',
      })
    }
    const resultado = calcularDepreciacion({ valorCompra, valorResidual, vidaUtilAnios, fechaCompra, fechaCorte })
    res.json(resultado)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error al calcular la depreciación' })
  }
})
