import { Router } from 'express'
import { supabaseParaRequest, extraerJwt } from '../lib/supabaseClient.js'
import { validarTotalesFactura } from '../lib/validacionFacturas.js'

export const facturasRouter = Router()

facturasRouter.get('/:id/validar', async (req, res) => {
  const jwt = extraerJwt(req.headers.authorization)
  if (!jwt) return res.status(401).json({ error: 'Falta el token de sesión (Authorization: Bearer <jwt>)' })

  const supabase = supabaseParaRequest(jwt)

  // RLS decide si este usuario puede ver esta factura — si no puede, PostgREST simplemente
  // no devuelve la fila (mismo comportamiento que en el frontend).
  const { data: factura, error: errFactura } = await supabase
    .from('facturas')
    .select('empresa_id, items, subtotal, iva, total')
    .eq('id', req.params.id)
    .single()

  if (errFactura || !factura) {
    return res.status(404).json({ error: 'No se encontró la factura, o no tienes acceso a ella.' })
  }

  const { data: empresa, error: errEmpresa } = await supabase
    .from('empresas')
    .select('iva_porcentaje')
    .eq('id', factura.empresa_id)
    .single()

  if (errEmpresa || !empresa) {
    return res.status(404).json({ error: 'No se pudo leer el IVA de la empresa de esta factura.' })
  }

  const resultado = validarTotalesFactura(factura.items ?? [], Number(empresa.iva_porcentaje), {
    subtotal: factura.subtotal,
    iva: factura.iva,
    total: factura.total,
  })

  res.json(resultado)
})
