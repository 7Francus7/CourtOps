# QA — CourtOps listo para demo comercial

> Objetivo: validar el recorrido completo registro → operación → cobro → expiración → reactivación.
> Fecha de creación: 2026-06-11 · Branch: `codex/premium-public-venue-layout`

---

## 0. PREREQUISITOS

| Qué | Valor |
|---|---|
| Servidor local | `npm run dev` (puerto 3000) |
| DB | la de `.env` (`DATABASE_URL`) — los tests E2E crean clubes reales, ver limpieza al final |
| Cuenta superadmin | tu usuario GOD (dellorsif) para god-mode |
| MP sandbox | cuenta de prueba vendedor + comprador (solo pasos 13-14, en staging/prod) |
| Resend | sin `RESEND_API_KEY` los emails se simulan en consola (`[EMAIL SIM]`) — suficiente para QA local |
| Blob | sin `BLOB_READ_WRITE_TOKEN` el upload cae a fallback URL (esperado) |

### Datos de prueba estándar

```
Club:       QA Club Demo
Nombre:     QA Tester
Email:      qa-demo@courtops-e2e.test
Password:   qa123456
Canchas:    "Cancha Central", "Cancha 2"
Precio:     $18.000 · Duración: 90 min · Horario: 08:00–23:00
```

### Comandos base

```powershell
cd courtops
npm run dev                          # servidor
npx prisma studio                    # inspección visual de DB
npx playwright test --project=chromium    # E2E desktop
npx playwright test --project=mobile-375  # E2E mobile 375px
npx playwright show-report           # reporte HTML con screenshots
```

### Logs a vigilar durante TODO el QA

- Consola de `npm run dev`: cualquier `Error`, `PrismaClient`, `[EMAIL SIM]` (confirma envíos), `✅ [webhook]`.
- DevTools → Console: sin errores rojos en ninguna página.
- DevTools → Network: ninguna respuesta 500.

---

## 1. LANDING → REGISTRO

**Ruta:** `/`

| Paso | Resultado esperado |
|---|---|
| Abrir `/` sin sesión | Hero con video, nav con "Probar gratis" e "Iniciar sesión" |
| Scroll a #planes | 3 planes: Base $69.000 · Pro $99.000 · Max $149.000 (los mismos de `OFFICIAL_PLATFORM_PLANS`) |
| Toggle Anual | Precios con −20% y precio mensual tachado |
| Ctrl+F en el HTML | CERO menciones a "CourtReserve", cero `aggregateRating` |
| Click "Probar gratis" | → `/register` |
| Click "Empezar con Pro" (pricing) | → `/register?plan=pro` — misma pantalla, el param se ignora sin romper |

📸 Screenshot: hero + sección planes (desktop y 375px).

## 2. REGISTRO → AUTO-LOGIN

**Ruta:** `/register`

| Paso | Resultado esperado |
|---|---|
| Ver el form | **Solo 4 campos** (club, nombre, email, contraseña). Sin pantalla de planes previa. Panel izquierdo: "14 días gratis · Sin tarjeta" |
| Submit con email inválido | Error inline "Ingresá un email válido", sin submit |
| Submit con password "123" | Error "Mínimo 6 caracteres" |
| Submit válido | Toast "¡Cuenta creada!" → aterriza en `/dashboard` **sin pasar por login** |
| Repetir mismo email | Toast "El email ya está registrado", sigue en /register |
| Consola servidor | `[EMAIL SIM] ... Bienvenido` (welcome email) |

⏱️ Medir: registro completo debe tomar **< 60 segundos**.
📸 Screenshot: form de registro a 375px (campos no desbordan, botón alcanzable con pulgar).

## 3-4. DASHBOARD → ONBOARDING → CANCHAS/PRECIOS

**Ruta:** `/dashboard` (recién registrado)

| Paso | Resultado esperado |
|---|---|
| Llegar a dashboard | **OnboardingWizard a pantalla completa** (overlay), paso 1 "Hola QA Club Demo", lista de 4 pasos |
| Paso 2: agregar "Cancha Central" + Enter | Aparece en la lista; duplicado exacto → toast "Ya existe" |
| "Siguiente" sin canchas | Botón deshabilitado / toast "Agrega al menos 1 cancha" |
| Paso 3: elegir **60 min** | Botón 60 queda activo (primario) |
| Precio 0 → Finalizar | Bloqueado: "El precio debe ser mayor a 0" |
| Precio 18000 → Finalizar | Avanza al paso 4 (MercadoPago) |
| Verificar en Prisma Studio | `Court.duration = 60`, `Club.slotDuration = 60`, `PriceRule "Tarifa General" price=18000` |

📸 Screenshot: paso de canchas y paso de precio a 375px.

## 5. PASO MERCADOPAGO SKIPEABLE

| Paso | Resultado esperado |
|---|---|
| Paso 4 visible | "Cobra online" + botón celeste "Conectar MercadoPago" + "Lo hago después" |
| Click "Conectar MercadoPago" (sin `MP_APP_ID` local) | Toast de error claro, NO crash |
| Click "Conectar" (con MP_APP_ID) | Abre `auth.mercadopago.com.ar` en **pestaña nueva**; el wizard sigue vivo; botón cambia a "Ya autoricé, continuar" |
| "Lo hago después" | Paso 5: 🎉 "Todo listo!" con link `courtops.net/p/<slug>` |
| "Copiar" | Toast "Link copiado", clipboard correcto |
| "WhatsApp" | Abre `wa.me` con el link en el texto |
| "Ir al dashboard" | Dashboard normal, **el wizard NO reaparece** al recargar |

## 6-7. LINK PÚBLICO + RESERVA PÚBLICA

**Ruta:** `/p/<slug>` — en **ventana de incógnito** (sin sesión)

| Paso | Resultado esperado |
|---|---|
| Abrir el link | Página del club con nombre, sin necesidad de login |
| Elegir fecha hoy + horario | Slots visibles según horario 08:00–23:00 con bloques de 60 min y precio $18.000 |
| Completar reserva como invitado (nombre + teléfono) | Confirmación con estado claro; si hay seña configurada, hold con countdown |
| Verificar en `/reservas` (sesión admin) | La reserva aparece en el turnero en tiempo real (Pusher) o tras refresh |
| `/p/club-que-no-existe-xyz` | Página "no encontrado" decente — **sin stack de Prisma** |

📸 Screenshot: flujo público completo a 375px (es EL caso de uso real).
🪵 Log: consola servidor sin errores durante la reserva.

## 8. RESERVA INTERNA DESDE DASHBOARD

**Ruta:** `/reservas` o FAB mobile

| Paso | Resultado esperado |
|---|---|
| Click en slot vacío del turnero | BookingModal abre con fecha/hora/cancha precargadas |
| Crear cliente nuevo inline + confirmar | Reserva visible en grid sin refresh manual |
| Cobrar seña desde la reserva | Transacción en `/caja` con método correcto |
| Doble click rápido en mismo slot | NO crea dos reservas (validación de solapamiento) |

## 9. TRIAL BANNER

| Estado (SQL abajo) | Banner esperado |
|---|---|
| Recién registrado | Oscuro/info: "Te quedan 14 días de prueba" + CTA "Elegir plan" |
| `nextBillingDate` = +2 días | Ámbar: "Te quedan 2 días de prueba" |
| = +1 día | "Te queda 1 día de prueba" (singular) |
| = hoy | "Tu prueba termina hoy" |
| = ayer (cron aún no corrió) | Rojo: "Tu prueba terminó" + bloqueo de contenido |

## 10. TRIAL VENCIDO SIMULADO

```sql
-- ⚠️ Reemplazar <CLUB_ID> (buscalo: SELECT id, name FROM "Club" WHERE name = 'QA Club Demo';)

-- A. Trial por vencer (banner ámbar)
UPDATE "Club" SET "nextBillingDate" = NOW() + interval '2 days' WHERE id = '<CLUB_ID>';

-- B. Trial vencido (bloqueo inmediato sin cron)
UPDATE "Club" SET "nextBillingDate" = NOW() - interval '1 day' WHERE id = '<CLUB_ID>';

-- C. Simular el cron (estado EXPIRED)
UPDATE "Club" SET "subscriptionStatus" = 'EXPIRED' WHERE id = '<CLUB_ID>';

-- D. SUSPENDED (transferencia vencida + gracia agotada)
UPDATE "Club" SET "subscriptionStatus" = 'SUSPENDED', "suspendedAt" = NOW() WHERE id = '<CLUB_ID>';

-- E. Volver a trial sano (reset)
UPDATE "Club" SET "subscriptionStatus" = 'TRIAL', "nextBillingDate" = NOW() + interval '14 days',
  "suspendedAt" = NULL, "pendingPlanId" = NULL, "pendingBillingCycle" = NULL WHERE id = '<CLUB_ID>';
```

**Con estado B o C:**

| Paso | Resultado esperado |
|---|---|
| Ir a `/dashboard` | Pantalla de bloqueo: "Tu prueba gratuita terminó", lista de funciones pausadas, **"Tus reservas, clientes y configuración están guardados"** |
| Ir a `/reservas`, `/caja`, `/clientes` | Mismo bloqueo en todas |
| Ir a `/dashboard/suscripcion` | **ACCESIBLE** — planes visibles, banner rojo |
| Intentar server action (ej: vía consola) | Error "Tu prueba terminó. Activá un plan..." |

**Probar el cron real:**
```powershell
# con el dev server corriendo y CRON_SECRET en .env
curl -H "Authorization: Bearer TU_CRON_SECRET" http://localhost:3000/api/cron/trial-expiry
# Esperado: {"success":true,"expired":N,"reminded":N,"skipped":N}
# Con club a D-3 o D-1: consola muestra [EMAIL SIM] Trial reminder
# Segunda corrida inmediata: el mismo club va a "skipped" (dedupe)
```

## 11. PAGO POR TRANSFERENCIA + COMPROBANTE

**Ruta:** `/dashboard/suscripcion` (estado: TRIAL o EXPIRED)

| Paso | Resultado esperado |
|---|---|
| Banner "Pagá por transferencia bancaria · Recomendado" | Visible |
| Elegir plan Pro → "Elegir este plan" | Pantalla con alias/CVU/monto copiables + concepto sugerido |
| "Prefiero pagar con MercadoPago" | (sin MP_ACCESS_TOKEN) modo demo: redirige a `/status` y activa — verificar banner "Modo Demo" visible antes |
| "Ya transferí, subir comprobante" | Form: referencia obligatoria + "Adjuntar captura o PDF" |
| Enviar sin referencia | Botón deshabilitado |
| Adjuntar JPG de 1KB | Chip verde con nombre y peso |
| Adjuntar archivo > 5MB | Toast "supera los 5MB" |
| Enviar (sin BLOB token) | Toast con error claro + aparece campo de URL fallback |
| Enviar (con BLOB token) | Toast "Comprobante enviado" → banner azul "Comprobante en revisión" |
| **La app sigue operando** | Reservas/caja funcionan normal en PENDING_VALIDATION |
| Reenviar otro comprobante | Bloqueado: "Ya tenés un comprobante en revisión" |

## 12. VALIDACIÓN SUPERADMIN

**Ruta:** `/god-mode` (sesión GOD)

| Paso | Resultado esperado |
|---|---|
| Sección de transferencias pendientes | El club QA aparece con plan objetivo, referencia y link al comprobante (Blob) |
| Aprobar | Club pasa a `authorized`, `Invoice REC-2026-XXXX` creada, consola: `[EMAIL SIM] Subscription activated` + intento WhatsApp |
| Club: recargar `/dashboard/suscripcion` | "Plan Pro activo · Vence el <fecha> · Transferencia" |
| Recibo coherente | Monto del Invoice = precio del plan en landing (mensual) o ×12×0.8 (anual) |
| Aprobar de nuevo (doble submit) | "Esta suscripción ya fue aprobada anteriormente" |
| Rechazar (con otro club de prueba) | Status `cancelled`, WhatsApp simulado con motivo, club ve "Suscripción inactiva" y puede reintentar |

## 13-14. MERCADOPAGO REAL + WEBHOOK (solo staging/producción)

> Local no puede recibir webhooks de MP. Hacer en Vercel preview o producción con cuentas sandbox.

**Pre-requisito (una sola vez):** Panel MP → tu aplicación → Webhooks → activar tópicos `payment` **y** `subscription_preapproval` → URL `https://courtops.net/api/webhooks/mercadopago`.

| Paso | Resultado esperado |
|---|---|
| 13. Pagar plan con comprador sandbox y VOLVER al sitio | `/status`: "¡Todo Listo!" o "se activará automáticamente" (si MP demora) — nunca error |
| 14. Pagar y **CERRAR LA PESTAÑA** sin volver | Esperar 1-2 min → Vercel logs: `✅ [webhook] Preapproval authorized for club ...` → club `authorized` con plan y features correctos |
| Verificar features | `hasKiosco`, `maxCourts` etc. corresponden al plan (no quedó "activación a medias") |
| Cancelar la suscripción desde MP (panel comprador) | Webhook degrada el club a `cancelled` — solo si estaba activo por MP |

🪵 Logs: Vercel → Functions → `/api/webhooks/mercadopago`. Buscar `✅` y cualquier `Webhook Internal Error` (van a `WebhookQueue` para retry).

## 15. EXPIRED/SUSPENDED SOLO PUEDE IR A SUSCRIPCIÓN

Con SQL estado C o D: probar **una por una** las rutas `/dashboard`, `/reservas`, `/clientes`, `/caja`, `/torneos`, `/reportes`, `/configuracion`, `/actividad` → todas muestran el bloqueo. `/dashboard/suscripcion` y `/dashboard/suscripcion/status` → accesibles. Copy distinto para SUSPENDED ("período de gracia terminó", CTA "Renovar mi plan").

## 16. PRICING COHERENTE (landing = suscripción = recibo)

| Superficie | Fuente | Verificar |
|---|---|---|
| Landing `#planes` | `OFFICIAL_PLATFORM_PLANS` | $69.000 / $99.000 / $149.000 |
| `/dashboard/suscripcion` | `PlatformPlan` (DB, sincronizada de la misma constante) | Mismos 3 precios |
| Recibo god-mode (Invoice) | `plan.price` al validar | Mismo monto |
| Anual en las 3 | ×12×0.8 | Mismo cálculo |

Prueba de fuego: cambiar `price` de Base en `lib/platform-plans.ts` a 70000 → landing lo refleja al instante; `/dashboard/suscripcion` lo refleja tras la primera carga (sync). **Revertir después.**

## 17. MOBILE 375PX

`npx playwright test --project=mobile-375` + manual en DevTools (iPhone SE / 375×667):

| Pantalla | Verificar |
|---|---|
| Landing | Sin scroll horizontal, video no rompe, menú hamburguesa funciona |
| Registro | 4 campos cómodos, teclado no tapa el botón |
| Onboarding wizard | Botones ≥44px, pasos completos sin zoom |
| `/p/<slug>` | Reserva completa con una mano |
| Suscripción | Cards apiladas, alias/CVU copiables con tap |
| Dashboard | Bottom nav visible, FAB accesible, sin overflow en turnero |

📸 Screenshot de cada una.

## 18. ERROR STATES HUMANOS

| Provocación | Esperado |
|---|---|
| `/p/slug-inexistente` | "No encontrado" amable |
| Email duplicado en registro | Toast claro |
| Apagar la DB (matar conexión) y cargar `/dashboard` | "No pudimos cargar tu club... Tus datos y reservas están seguros" + botón Reintentar — **NUNCA un `<pre>` con P1001** |
| Submit de comprobante sin red | Toast "Error de conexión" |
| Buscar en todo el QA | Ninguna pantalla muestra `PrismaClient`, `NEXT_REDIRECT`, stacks, ni texto en inglés |

---

## BUGS BLOQUEANTES PARA LANZAR (criterios)

Cualquiera de estos = NO se hace la demo hasta arreglarlo:

1. Registro no auto-loguea o el wizard no aparece para club nuevo.
2. Reserva pública falla o crea reserva en horario/cancha equivocados.
3. Doble reserva en el mismo slot.
4. Club bloqueado (EXPIRED/SUSPENDED) puede operar igual, o NO puede llegar a `/dashboard/suscripcion` a pagar.
5. Pago MP real aprobado que NO activa el club (ni por back_url ni por webhook).
6. Validación de transferencia que no activa, o activa el plan equivocado / monto de recibo incorrecto.
7. Precio distinto entre landing y checkout.
8. Cualquier dato de un club visible desde otro club (multi-tenancy).
9. Stack técnico visible para el usuario final.
10. Flujo público roto a 375px (es el dispositivo real del jugador).

**No bloqueantes (anotar y seguir):** textos, espaciados, animaciones, estados raros de god-mode, performance del hero.

---

## LIMPIEZA POST-QA

```sql
-- Borra los clubes creados por Playwright y QA manual (email *@courtops-e2e.test)
DELETE FROM "Club" WHERE id IN (
  SELECT "clubId" FROM "User" WHERE email LIKE '%courtops-e2e.test%'
);
-- (User, Court, PriceRule, Booking caen por cascade si el schema lo define;
--  si no, borrar User primero y revisar huérfanos en Prisma Studio)
```
