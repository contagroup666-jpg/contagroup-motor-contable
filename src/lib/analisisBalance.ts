export interface CuentaParaAnalisis {
  clase: number // 1=Activo, 2=Pasivo, 3=Patrimonio, 4=Ingresos, 5=Gastos (convención estándar NIIF/PYMES)
  saldo: number
  es_detalle: boolean
}

export interface ResultadoAnalisisBalance {
  totalActivos: number
  totalPasivos: number
  totalPatrimonio: number
  totalIngresos: number
  totalGastos: number
  utilidadEjercicio: number
  ecuacionContable: {
    activoEsperado: number
    diferencia: number
    cuadra: boolean
  }
  razonesFinancieras: {
    /** Pasivo total / Activo total — qué proporción de la empresa está financiada con deuda */
    endeudamiento: number | null
    /** Patrimonio / Activo total */
    solvencia: number | null
  }
}

/**
 * Suma el plan de cuentas por clase contable y valida la ecuación fundamental
 * Activo = Pasivo + Patrimonio (+ utilidad del ejercicio como parte del patrimonio).
 * Solo suma cuentas de detalle (es_detalle=true) para no duplicar contando también
 * las cuentas de agrupación/mayores.
 */
export function analizarBalance(cuentas: CuentaParaAnalisis[]): ResultadoAnalisisBalance {
  const detalle = cuentas.filter((c) => c.es_detalle)

  const totalActivos = sumaClase(detalle, 1)
  const totalPasivos = sumaClase(detalle, 2)
  const totalPatrimonio = sumaClase(detalle, 3)
  const totalIngresos = sumaClase(detalle, 4)
  const totalGastos = sumaClase(detalle, 5)
  const utilidadEjercicio = round2(totalIngresos - totalGastos)

  const activoEsperado = round2(totalPasivos + totalPatrimonio + utilidadEjercicio)
  const diferencia = round2(Math.abs(totalActivos - activoEsperado))

  return {
    totalActivos,
    totalPasivos,
    totalPatrimonio,
    totalIngresos,
    totalGastos,
    utilidadEjercicio,
    ecuacionContable: {
      activoEsperado,
      diferencia,
      // Tolerancia de 1 centavo por redondeos acumulados en cientos de asientos.
      cuadra: diferencia <= 0.01,
    },
    razonesFinancieras: {
      endeudamiento: totalActivos !== 0 ? round4(totalPasivos / totalActivos) : null,
      solvencia: totalActivos !== 0 ? round4(totalPatrimonio / totalActivos) : null,
    },
  }
}

function sumaClase(cuentas: CuentaParaAnalisis[], clase: number) {
  return round2(cuentas.filter((c) => c.clase === clase).reduce((acc, c) => acc + Number(c.saldo), 0))
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
function round4(n: number) {
  return Math.round(n * 10000) / 10000
}
