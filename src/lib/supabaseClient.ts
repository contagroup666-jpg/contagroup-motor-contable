import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Faltan las variables de entorno SUPABASE_URL / SUPABASE_ANON_KEY')
}

/**
 * Este servicio NUNCA usa la service_role key. Cada request debe traer el JWT
 * del usuario (el mismo que usa el frontend), y ese JWT se propaga al cliente
 * de Supabase para que las políticas RLS de la base de datos decidan qué puede
 * ver o tocar — el motor no tiene más acceso que el usuario que lo llama.
 */
export function supabaseParaRequest(jwt: string | undefined) {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : {},
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function extraerJwt(authHeader: string | undefined): string | undefined {
  if (!authHeader?.startsWith('Bearer ')) return undefined
  return authHeader.slice('Bearer '.length)
}
