import { Router } from 'express'
import { supabaseParaRequest, extraerJwt } from '../lib/supabaseClient.js'
import { analizarBalance } from '../lib/analisisBalance.js'

export const analisisRouter = Router()

analisisRouter.get('/plan-cuentas/:empresaId', async (req, res) => {
  const jwt = extraerJwt(req.headers.authorization)
  if (!jwt) return res.status(401).json({ error: 'Falta el token de sesión (Authorization: Bearer <jwt>)' })

  const supabase = supabaseParaRequest(jwt)

  // Igual que en el frontend: no hace falta validar el acceso a mano, RLS ya limita
  // esta consulta a las empresas que el usuario puede ver. Si no tiene acceso, vendrá vacío.
  const { data: cuentas, error } = await supabase
    .from('plan_cuentas')
    .select('clase, saldo, es_detalle')
    .eq('empresa_id', req.params.empresaId)

  if (error) {
    return res.status(500).json({ error: error.message })
  }
  if (!cuentas || cuentas.length === 0) {
    return res.status(404).json({ error: 'No hay cuentas para esta empresa, o no tienes acceso a ella.' })
  }

  const resultado = analizarBalance(cuentas)
  res.json(resultado)
})
