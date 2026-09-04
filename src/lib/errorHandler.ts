import type { NextFunction, Request, Response } from 'express'

/**
 * Manejador de errores centralizado. Captura:
 * - Errores lanzados dentro de handlers async (Express 5 los reenvía solo
 *   a next(err), así que no hace falta try/catch en cada ruta async).
 * - Errores de parseo de JSON del body (express.json() los lanza como
 *   SyntaxError antes de llegar a ninguna ruta).
 *
 * Debe registrarse con app.use(manejadorErrores) al final, después de
 * montar todas las rutas — Express lo reconoce como manejador de errores
 * por tener 4 parámetros.
 */
export function manejadorErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return

  if (err instanceof SyntaxError && 'body' in (err as any)) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es JSON válido.' })
  }

  if (err instanceof Error && err.message === 'request entity too large') {
    return res.status(413).json({ error: 'La solicitud es demasiado grande.' })
  }

  console.error('[motor-contable] Error no controlado:', err)

  const mensaje = err instanceof Error ? err.message : 'Error interno del servidor'
  res.status(500).json({ error: mensaje })
}
