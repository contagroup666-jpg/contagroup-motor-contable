export interface LineaFactura {
  nombre: string
  cantidad: number
  precio: number
}

export interface ResultadoValidacionFactura {
  subtotalCalculado: number
  ivaCalculado: number
  totalCalculado: number
  subtotalRegistrado: number
  ivaRegistrado: number
  totalRegistrado: number
  coincide: boolean
  diferencia: number
}

/**
 * Recalcula subtotal/IVA/total a partir de las líneas reales de la factura y los compara
 * contra lo que quedó guardado. Sirve para detectar facturas con totales inconsistentes
 * (errores de captura, ediciones manuales, etc.) sin tener que revisar cada una a mano.
 */
export function validarTotalesFactura(
  items: LineaFactura[],
  ivaPorcentaje: number,
  registrados: { subtotal: number; iva: number; total: number }
): ResultadoValidacionFactura {
  const subtotalCalculado = round2(
    items.reduce((acc, i) => acc + Number(i.cantidad) * Number(i.precio), 0)
  )
  const ivaCalculado = round2(subtotalCalculado * (ivaPorcentaje / 100))
  const totalCalculado = round2(subtotalCalculado + ivaCalculado)

  // Tolerancia de 1 centavo por redondeos acumulados en facturas con muchas líneas.
  const diferencia = round2(Math.abs(totalCalculado - Number(registrados.total)))
  const coincide = diferencia <= 0.01

  return {
    subtotalCalculado,
    ivaCalculado,
    totalCalculado,
    subtotalRegistrado: Number(registrados.subtotal),
    ivaRegistrado: Number(registrados.iva),
    totalRegistrado: Number(registrados.total),
    coincide,
    diferencia,
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
