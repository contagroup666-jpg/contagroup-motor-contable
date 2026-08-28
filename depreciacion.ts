export interface EntradaDepreciacion {
  valorCompra: number
  valorResidual: number
  vidaUtilAnios: number
  fechaCompra: string // YYYY-MM-DD
  fechaCorte?: string // YYYY-MM-DD, por defecto hoy
}

export interface ResultadoDepreciacion {
  depreciacionAnual: number
  depreciacionMensual: number
  mesesTranscurridos: number
  depreciacionAcumulada: number
  valorEnLibros: number
  porcentajeDepreciado: number
  vidaUtilAgotada: boolean
}

/**
 * Depreciación en línea recta — el método estándar y el único que usa el sistema actual
 * para activos fijos (columna `metodo` en la tabla, aunque hoy solo se usa "Línea recta").
 * La depreciación acumulada nunca supera (valorCompra - valorResidual): un activo no se
 * deprecia más allá de su valor residual, sin importar cuántos meses hayan pasado.
 */
export function calcularDepreciacion(entrada: EntradaDepreciacion): ResultadoDepreciacion {
  const { valorCompra, valorResidual, vidaUtilAnios, fechaCompra } = entrada
  if (valorCompra <= 0) throw new Error('El valor de compra debe ser mayor a 0')
  if (valorResidual < 0) throw new Error('El valor residual no puede ser negativo')
  if (valorResidual >= valorCompra) throw new Error('El valor residual debe ser menor al valor de compra')
  if (vidaUtilAnios <= 0) throw new Error('La vida útil debe ser mayor a 0 años')

  const baseDepreciable = valorCompra - valorResidual
  const depreciacionAnual = round2(baseDepreciable / vidaUtilAnios)
  const depreciacionMensual = round2(depreciacionAnual / 12)

  const inicio = new Date(fechaCompra)
  const corte = entrada.fechaCorte ? new Date(entrada.fechaCorte) : new Date()
  const mesesTranscurridos = Math.max(
    0,
    (corte.getFullYear() - inicio.getFullYear()) * 12 + (corte.getMonth() - inicio.getMonth())
  )

  const depreciacionSinTope = round2(depreciacionMensual * mesesTranscurridos)
  const depreciacionAcumulada = Math.min(depreciacionSinTope, baseDepreciable)
  const valorEnLibros = round2(valorCompra - depreciacionAcumulada)
  const porcentajeDepreciado = baseDepreciable > 0 ? round4((depreciacionAcumulada / baseDepreciable) * 100) : 0

  return {
    depreciacionAnual,
    depreciacionMensual,
    mesesTranscurridos,
    depreciacionAcumulada: round2(depreciacionAcumulada),
    valorEnLibros,
    porcentajeDepreciado,
    vidaUtilAgotada: depreciacionAcumulada >= baseDepreciable,
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
function round4(n: number) {
  return Math.round(n * 10000) / 10000
}
