# contagroup-motor-contable

Servicio Node/Express separado del frontend y de Supabase — el "cerebro" para
cálculos matemáticos/contables que no deberían vivir en funciones SQL ni en el navegador.

## Principio de seguridad
Este servicio **nunca** usa la `service_role key` de Supabase. Cada request debe traer
el mismo JWT de sesión que usa el frontend (`Authorization: Bearer <jwt>`), y ese JWT
se propaga al cliente de Supabase — así las políticas RLS de la base deciden qué puede
ver o tocar cada usuario, exactamente igual que en el frontend. El motor no tiene más
acceso que la persona que lo llama.

## Endpoints

### `POST /api/nomina/calcular`
```json
{ "sueldoMensual": 800, "mesesAntiguedad": 24, "horasExtra50": 4 }
```
Devuelve el desglose completo: aporte personal IESS (9.45%), aporte patronal (11.15%),
IECE/SECAP (1%), fondo de reserva (8.33%, solo desde el mes 12), neto a pagar y costo
total para la empresa. Tasas y SBU verificados para Ecuador 2026.

### `POST /api/nomina/decimos`
```json
{ "sumaIngresosAnuales": 9600, "mesesTrabajadosEnPeriodo": 12 }
```
Décimo tercero (1/12 de lo percibido en el año) y décimo cuarto (1 SBU, proporcional).

### `GET /api/facturas/:id/validar`
Requiere `Authorization: Bearer <jwt>`. Recalcula subtotal/IVA/total de una factura a
partir de sus líneas reales y los compara contra lo guardado — detecta facturas
descuadradas.

### `GET /api/analisis/plan-cuentas/:empresaId`
Requiere `Authorization: Bearer <jwt>`. Suma el plan de cuentas por clase contable,
valida la ecuación Activo = Pasivo + Patrimonio + Utilidad, y calcula razones de
endeudamiento y solvencia.

## Correr localmente
```bash
npm install
cp .env.example .env    # ya trae la URL real de Supabase, falta la anon key
npm run dev
```

## Desplegar en Railway
El proyecto y el servicio ya existen en Railway (`contagroup-motor-contable`,
workspace "conta group's Projects"). Para subir este código:
```bash
npm install -g @railway/cli
railway login
railway link            # elegir el proyecto contagroup-motor-contable
railway up
```
Luego, en el dashboard de Railway, configura las variables de entorno
`SUPABASE_URL` y `SUPABASE_ANON_KEY` (las mismas del `.env.example`) y genera
un dominio público para el servicio.
