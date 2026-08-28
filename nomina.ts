// Tasas y valores oficiales vigentes para Ecuador en 2026 (verificados: IESS, SBU).
// Si cambian en años posteriores, actualizar solo estas constantes.
export const SBU_2026 = 482
export const TASA_APORTE_PERSONAL_IESS = 0.0945 // 9.45%, lo retiene el empleador del sueldo del trabajador
export const TASA_APORTE_PATRONAL_IESS = 0.1115 // 11.15%, lo asume el empleador (no se descuenta del sueldo)
export const TASA_IECE_SECAP = 0.01 // 0.5% IECE + 0.5% SECAP, a cargo del empleador
export const TASA_FONDO_RESERVA = 0.0833 // 8.33%, aplica desde el segundo año de trabajo continuo

export interface EntradaNominaMensual {
  sueldoMensual: number
  /** Meses completos que el empleado lleva trabajando en la empresa (para saber si aplica fondo de reserva) */
  mesesAntiguedad: number
  horasExtra50?: number
  horasExtra100?: number
  comisiones?: number
}

export interface ResultadoNominaMensual {
  ingresos: {
    sueldoMensual: number
    horasExtra50: number
    horasExtra100: number
    comisiones: number
    totalIngresos: number
  }
  descuentos: {
    aportePersonalIESS: number
  }
  aportesPatronales: {
    aportePatronalIESS: number
    ieceSecap: number
    fondoReserva: number
    totalCostoPatronal: number
  }
  netoAPagar: number
  costoTotalEmpresa: number
}

function valorHoraOrdinaria(sueldoMensual: number) {
  // 30 días de 8 horas es el estándar usado en el cálculo laboral ecuatoriano.
  return sueldoMensual / 240
}

export function calcularNominaMensual(entrada: EntradaNominaMensual): ResultadoNominaMensual {
  const { sueldoMensual, mesesAntiguedad } = entrada
  if (sueldoMensual <= 0) throw new Error('El sueldo mensual debe ser mayor a 0')

  const valorHora = valorHoraOrdinaria(sueldoMensual)
  const horasExtra50 = (entrada.horasExtra50 ?? 0) * valorHora * 1.5
  const horasExtra100 = (entrada.horasExtra100 ?? 0) * valorHora * 2
  const comisiones = entrada.comisiones ?? 0

  const totalIngresos = sueldoMensual + horasExtra50 + horasExtra100 + comisiones

  const aportePersonalIESS = round2(totalIngresos * TASA_APORTE_PERSONAL_IESS)
  const aportePatronalIESS = round2(totalIngresos * TASA_APORTE_PATRONAL_IESS)
  const ieceSecap = round2(totalIngresos * TASA_IECE_SECAP)
  // El fondo de reserva solo aplica desde el segundo año de trabajo continuo (mes 13 en adelante).
  const fondoReserva = mesesAntiguedad >= 12 ? round2(totalIngresos * TASA_FONDO_RESERVA) : 0

  const totalCostoPatronal = round2(aportePatronalIESS + ieceSecap + fondoReserva)
  const netoAPagar = round2(totalIngresos - aportePersonalIESS)
  const costoTotalEmpresa = round2(totalIngresos + totalCostoPatronal)

  return {
    ingresos: {
      sueldoMensual: round2(sueldoMensual),
      horasExtra50: round2(horasExtra50),
      horasExtra100: round2(horasExtra100),
      comisiones: round2(comisiones),
      totalIngresos: round2(totalIngresos),
    },
    descuentos: { aportePersonalIESS },
    aportesPatronales: { aportePatronalIESS, ieceSecap, fondoReserva, totalCostoPatronal },
    netoAPagar,
    costoTotalEmpresa,
  }
}

export interface ResultadoDecimos {
  decimoTerceroMensualizado: number
  decimoTerceroAnual: number
  decimoCuartoMensualizado: number
  decimoCuartoAnual: number
}

/**
 * Décimo tercero: 1/12 de todo lo percibido en el año (ingresos regulares, no solo sueldo base).
 * Décimo cuarto: un SBU completo al año (o proporcional si no trabajó el año completo), igual para todos
 * sin importar el sueldo.
 */
export function calcularDecimos(sumaIngresosAnuales: number, mesesTrabajadosEnPeriodo: number = 12): ResultadoDecimos {
  if (sumaIngresosAnuales < 0) throw new Error('La suma de ingresos anuales no puede ser negativa')
  const decimoTerceroAnual = round2(sumaIngresosAnuales / 12)
  const decimoCuartoAnual = round2((SBU_2026 * mesesTrabajadosEnPeriodo) / 12)
  return {
    decimoTerceroMensualizado: round2(decimoTerceroAnual / 12),
    decimoTerceroAnual,
    decimoCuartoMensualizado: round2(decimoCuartoAnual / 12),
    decimoCuartoAnual,
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
