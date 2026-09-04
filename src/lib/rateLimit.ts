import rateLimit from 'express-rate-limit'

// Cálculo puro (nómina, décimos, depreciación): no toca la base de datos,
// es barato, y el frontend a veces lo llama una vez por empleado en un
// bucle secuencial — dejamos margen amplio para eso sin abrir la puerta
// a un abuso real (ej. un script externo golpeando el endpoint).
export const limiterCalculo = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de cálculo en poco tiempo. Intenta de nuevo en unos segundos.' },
})

// Consulta (facturas/validar, análisis/plan-cuentas): sí toca Supabase,
// es más pesado y no hay un escenario legítimo de ráfaga alta por usuario.
export const limiterConsulta = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas consultas en poco tiempo. Intenta de nuevo en unos segundos.' },
})
