# CourtOps — Security & Quality Sprint (2 semanas)

**Fecha de inicio:** 2026-04-27  
**Fecha de fin:** 2026-05-08  
**Tech Lead:** Claude (Anthropic)  
**Branch base:** `claude/courtops-security-sprint-htPN4`  
**Repositorio:** `7francus7/courtops`

---

## Resumen ejecutivo

Sprint enfocado en tres pilares:
1. **Hardening multi-tenant** — cerrar brechas de aislamiento `clubId` antes de cualquier feature nueva.
2. **Auth/Onboarding MVP** — reforzar sesiones, eliminar el bypass `GOD_MODE` hardcodeado, mejorar el flujo de primer acceso.
3. **Observabilidad y calidad de release** — cobertura de tests de seguridad, logging estructurado, CI/CD confiable.

> **Regla de oro del sprint:** Ningún PR toca más de un dominio. Si un fix arrastra refactor, el refactor va en un PR separado.

---

## Análisis de riesgos base (pre-sprint)

| ID  | Severidad | Hallazgo                                              | Archivo                            |
|-----|-----------|-------------------------------------------------------|------------------------------------|
| S-1 | CRÍTICO   | `toggleOpenMatch` sin verificación de `clubId`        | `actions/matchmaking.ts:17`        |
| S-2 | CRÍTICO   | `joinOpenMatch` sin validar `isOpenMatch: true`       | `actions/open-matches.ts:68`       |
| S-3 | ALTO      | `createPreference` sin check de propiedad del booking | `actions/mercadopago.ts:8`         |
| S-4 | ALTO      | Bypass `GOD_MODE` con fallback hardcodeado en código  | `lib/auth.ts:76-88`                |
| S-5 | MEDIO     | Derivación de clave AES sin KDF (SHA-256 directo)     | `lib/encryption.ts:14`             |
| S-6 | MEDIO     | 6+ server actions sin usar `createSafeAction`         | `actions/tournaments.ts`, etc.     |
| S-7 | MEDIO     | CSRF: sin token explícito en mutations de API         | `middleware.ts`                    |
| S-8 | MEDIO     | CSP con `unsafe-inline` para scripts                  | `middleware.ts:87`                 |
| S-9 | BAJO      | Audit log ausente en `tournaments.ts`, `open-matches` | múltiples archivos                 |
| S-10| BAJO      | 0 tests de aislamiento tenant                         | `tests/`                           |

---

## Plan diario — Semana 1: Security Hardening

---

### DÍA 1 — Brechas críticas de aislamiento tenant
**PR:** `fix/tenant-isolation-critical-actions`

#### Tareas
1. `toggleOpenMatch`: agregar `getServerSession` + verificar que `booking.clubId === session.user.clubId`.
2. `joinOpenMatch`: agregar validación `isOpenMatch: true`, `status !== CANCELLED`, `startTime > now`.
3. `createPreference`: agregar check de sesión opcional; si existe sesión verificar `booking.clubId === session.clubId`; si es llamada pública, verificar que el booking está en estado pagable.

#### Criterios de aceptación
- [ ] Un usuario autenticado del Club A **no puede** modificar bookings del Club B via `toggleOpenMatch`.
- [ ] `joinOpenMatch` rechaza bookings que no tienen `isOpenMatch: true`.
- [ ] `joinOpenMatch` rechaza bookings cancelados o pasados.
- [ ] `createPreference` desde un usuario del Club A falla si `bookingId` pertenece al Club B.
- [ ] Tests unitarios pasan (`npm run test:unit`).

#### Comandos de validación
```bash
# Desde courtops/
npm run test:unit -- --reporter=verbose
npx tsc --noEmit
npm run lint
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| `createPreference` rompe flujo público de pago | Media | La verificación de sesión es opcional; si no hay sesión se permite pero se valida estado del booking |
| Regresión en `BookingManagementModal` | Baja | Probar manualmente creación de preferencia desde dashboard |

#### Rollback
```bash
git revert HEAD --no-commit
git commit -m "revert: day1 tenant isolation fixes"
git push origin claude/courtops-security-sprint-htPN4
```

---

### DÍA 2 — Migrar actions sueltas a `createSafeAction`
**PR:** `fix/migrate-actions-to-safe-wrapper`

#### Tareas
Migrar estas acciones al patrón `createSafeAction` para garantizar extracción uniforme de `clubId`:
- `actions/tournaments.ts` — funciones que usan `getServerSession()` directamente.
- `actions/turnero.ts` — delegación manual.
- `actions/diagnostics.ts` — sin auth.

#### Criterios de aceptación
- [ ] Todas las funciones exportadas en los archivos anteriores usan `createSafeAction` o `getCurrentClubId()`.
- [ ] Ninguna función exportada acepta `clubId` como parámetro de entrada del cliente.
- [ ] `npm run lint` sin errores.
- [ ] Build exitoso: `npm run build`.

#### Comandos de validación
```bash
# Verificar que no quedan getServerSession() crudos en actions/
grep -r "getServerSession" src/actions/ --include="*.ts"
# Resultado esperado: sólo en archivos ya auditados (matchmaking.ts post-fix)
npm run build 2>&1 | grep -E "error|Error"
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Cambio de firma rompe llamadores | Media | Verificar llamadores con `grep -r` antes de cambiar |
| Acciones públicas (tournament signup) no deben requerir auth | Alta | Separar en funciones `public*` que usan `getOptionalClubId()` |

#### Rollback
```bash
git revert <sha-del-pr> --no-commit && git commit -m "revert: safe-action migration"
```

---

### DÍA 3 — Hardening del bypass GOD_MODE
**PR:** `fix/remove-godmode-hardcoded-fallback`

#### Tareas
1. Eliminar los valores hardcodeados `'franco@admin.com'` y `'FrancoAdminGodMode2026!'` de `lib/auth.ts:76-77`.
2. Si `MASTER_ADMIN_EMAIL` / `MASTER_ADMIN_PASSWORD` no están definidos, el bypass **no se activa** (no fallback).
3. Agregar log de auditoría cuando el bypass GOD_MODE es usado exitosamente.
4. Documentar en `.env.example` que estas variables deben existir sólo en entornos de emergencia.

**Suposición:** Las variables están configuradas en Vercel; la ausencia local no rompe el flujo normal de login.

#### Criterios de aceptación
- [ ] Sin `MASTER_ADMIN_EMAIL` en el entorno, el bypass GOD_MODE no existe.
- [ ] Con las variables presentes, el bypass funciona igual que antes.
- [ ] El evento de login GOD_MODE queda en el audit log con `action: 'GOD_MODE_LOGIN'`.
- [ ] `npm run build` sin errores.

#### Comandos de validación
```bash
# Verificar que no hay strings hardcodeados de credenciales
grep -n "franco@admin\|FrancoAdmin\|GOD_MODE_ACTIVE" src/lib/auth.ts
# Resultado esperado: 0 líneas (sólo GOD_MODE_ACTIVE como string de role está OK)
npm run test:unit
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Deploy sin las env vars activa bloqueo de acceso de emergencia | Alta | Verificar variables en Vercel antes del merge |

#### Rollback
```bash
git revert <sha> --no-commit && git commit -m "revert: godmode hardcoded fallback removal"
# Luego re-agregar las env vars en Vercel dashboard
```

---

### DÍA 4 — KDF para cifrado de tokens MP
**PR:** `fix/encryption-scrypt-kdf`

#### Tareas
1. Reemplazar `crypto.createHash('sha256').update(key)` por `crypto.scryptSync(key, salt, 32)` en `lib/encryption.ts`.
2. El salt debe ser fijo y estar en una env var `ENCRYPTION_SALT` (no generado aleatoriamente por ciclo, ya que los tokens existentes deben poder descifrarse).
3. Agregar función `migrateEncryptedTokens()` que re-encripta los `mpAccessToken` con la nueva KDF al ejecutarse una sola vez.
4. Documentar el proceso de migración.

**Suposición:** La KDF nueva puede correr en un script de migración one-shot; no hay que mantener backward compat en runtime indefinido.

#### Criterios de aceptación
- [ ] `lib/encryption.ts` usa `scryptSync` con parámetros `N=32768, r=8, p=1`.
- [ ] El script de migración puede ejecutarse: `npx tsx scripts/migrate-encryption.ts`.
- [ ] Los tokens re-encriptados se descifran correctamente con la nueva KDF.
- [ ] Tests unitarios del módulo de encriptación pasan.

#### Comandos de validación
```bash
npm run test:unit -- src/lib/__tests__/encryption.test.ts
# Verificar que no hay createHash('sha256') en encryption.ts
grep "createHash" src/lib/encryption.ts
# Resultado esperado: 0 líneas
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Tokens existentes en DB no descifrables post-migración | Alta | Correr script en staging primero; mantener función `decryptLegacy` temporalmente |
| `scryptSync` es bloqueante y lento en runtime | Media | Sólo se llama al cifrar (escrituras poco frecuentes); aceptable |

#### Rollback
```bash
# Restaurar la función de hash anterior y re-ejecutar el script inverso
git revert <sha>
npx tsx scripts/rollback-encryption.ts  # script incluido en el PR
```

---

### DÍA 5 — Audit log en acciones sin cobertura + tests E2E de aislamiento
**PR:** `fix/audit-log-coverage` + `test/tenant-isolation-e2e`

#### Tareas (PR 1: audit log)
1. Agregar `logAction()` en `tournaments.ts` para: crear torneo, actualizar, eliminar, agregar equipo.
2. Agregar `logAction()` en `open-matches.ts` para: join match.
3. Agregar `logAction()` en `matchmaking.ts` para: toggle open match.

#### Tareas (PR 2: tests de aislamiento)
1. Crear `tests/security/tenant-isolation.spec.ts` con Playwright.
2. Escenarios:
   - Usuario Club A no puede ver reservas del Club B vía API.
   - Usuario Club A no puede ejecutar `toggleOpenMatch` en booking del Club B.
   - Usuario no autenticado recibe 401 en todas las rutas protegidas.
   - Rate limit de login bloquea después de 5 intentos.

#### Criterios de aceptación (audit)
- [ ] Cada mutación en torneos genera una entrada en `AuditLog`.
- [ ] Las entradas incluyen `clubId`, `userId`, `entityId`, `action`, `metadata`.

#### Criterios de aceptación (tests)
- [ ] `npm run test` (Playwright) pasa los 4 escenarios de aislamiento.
- [ ] Los tests corren en CI sin flakiness (3 runs consecutivos exitosos).

#### Comandos de validación
```bash
npm run test -- tests/security/tenant-isolation.spec.ts
npm run test:unit -- --reporter=verbose
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Tests E2E requieren seeds específicos (2 clubs) | Media | Crear fixture `beforeAll` que crea 2 clubs + bookings |

#### Rollback
El audit log es aditivo; rollback sólo requiere revertir el commit. Los tests no tienen rollback (sólo borrar).

---

## Plan diario — Semana 2: Auth MVP + Observabilidad

---

### DÍA 6 — CSRF: SameSite + validación de origen en mutations
**PR:** `fix/csrf-protection`

#### Tareas
1. Asegurar que el cookie de sesión NextAuth tiene `SameSite=Strict` en producción.
2. Agregar middleware que en rutas `POST /api/*` (no webhooks) verifique header `Origin` contra `NEXTAUTH_URL`.
3. Excluir explícitamente `/api/webhooks/*` y `/api/auth/*` del check de origen.

#### Criterios de aceptación
- [ ] Un POST a `/api/bookings` desde un origen distinto retorna 403.
- [ ] Los webhooks de MercadoPago y WhatsApp siguen funcionando.
- [ ] El flujo de reserva pública funciona (mismo origen o con CORS configurado).

#### Comandos de validación
```bash
# Simular request cross-origin
curl -X POST http://localhost:3000/api/bookings \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{}' 
# Resultado esperado: 403

npm run test -- tests/security/
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Romper llamadas internas server-to-server | Media | Excluir rutas de cron (`/api/cron/*`) del check |

#### Rollback
Revertir el commit del middleware CSRF. El flag de SameSite se puede quitar vía env var.

---

### DÍA 7 — CSP: nonce-based para scripts inline
**PR:** `fix/csp-nonce-scripts`

#### Tareas
1. Generar nonce por request en `middleware.ts` y pasarlo al response header `Content-Security-Policy`.
2. Reemplazar `unsafe-inline` en la directiva `script-src` por `'nonce-{nonce}'`.
3. Pasar el nonce al `<head>` via `x-nonce` response header y leerlo en `layout.tsx`.
4. Identificar y actualizar cualquier `<script>` inline que rompa con el nuevo CSP.

**Suposición:** Google Tag Manager se carga externamente; el snippet inline de GTM necesita el nonce.

#### Criterios de aceptación
- [ ] `Content-Security-Policy` en producción no contiene `unsafe-inline` en `script-src`.
- [ ] La aplicación carga sin errores de CSP en DevTools.
- [ ] El reporte de CSP (via `report-uri` o `report-to`) está configurado para capturar violaciones.

#### Comandos de validación
```bash
# Audit con curl
curl -I http://localhost:3000 | grep -i content-security-policy
# Verificar ausencia de unsafe-inline en script-src
curl -I http://localhost:3000 | grep content-security-policy | grep -v "unsafe-inline"
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Scripts de terceros (Pusher, Analytics) rompen con nonce | Alta | Permitir dominios externos en lugar de unsafe-inline |
| GTM inline snippet necesita nonce | Alta | Pasar nonce explícitamente al snippet |

#### Rollback
Restaurar `unsafe-inline` en el header CSP. Es un cambio de una línea.

---

### DÍA 8 — Onboarding: validación de setup completo + guía primer acceso
**PR:** `feat/onboarding-completion-check`

#### Tareas
1. Crear server action `checkOnboardingStatus(clubId)` que retorna qué pasos están completos:
   - Al menos 1 cancha configurada.
   - Al menos 1 regla de precio.
   - Club con `name`, `slug`, `timezone` completos.
   - MP configurado (opcional, muestra advertencia).
2. Mostrar banner `IncompleteSetupBanner` en el dashboard si el status tiene gaps.
3. Agregar ruta `/setup` en sidebar para nuevos clubs (ocultar si onboarding completo).

**Suposición:** El modelo `Club` ya tiene los campos necesarios; no se requiere migración de schema.

#### Criterios de aceptación
- [ ] Un club sin canchas ve el banner de setup en el dashboard.
- [ ] El banner desaparece cuando todos los pasos están completos.
- [ ] La ruta `/setup` no aparece en el sidebar de clubs con onboarding completo.

#### Comandos de validación
```bash
npm run test:unit -- src/actions/__tests__/onboarding.test.ts
npx tsc --noEmit
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| El banner aparece en clubs legacy ya configurados | Media | Agregar campo `onboardingDismissedAt` en Club o chequear datos reales |

#### Rollback
El banner es aditivo y no bloquea funcionalidad. Revertir el componente es seguro.

---

### DÍA 9 — Observabilidad: logging estructurado + alertas de errores críticos
**PR:** `feat/observability-structured-logging`

#### Tareas
1. Centralizar todos los `console.error` en server actions hacia `appLogger.error()` con contexto `{ clubId, action, error }`.
2. Agregar `Sentry.captureException()` en el catch del `createSafeAction` wrapper para errores `INTERNAL_ERROR`.
3. Configurar Sentry alert para errores de tipo `UNAUTHORIZED` (posible ataque de enumeración).
4. Crear dashboard interno `/diagnostics` con:
   - Últimos 50 errores del audit log.
   - Estado del circuit breaker de WhatsApp y MP.
   - Uso de Redis (keys activas, hit rate).

**Suposición:** Sentry está configurado (`SENTRY_ORG`, `SENTRY_PROJECT` presentes en env).

#### Criterios de aceptación
- [ ] Ningún `console.error` directo en `src/actions/` (usar `appLogger`).
- [ ] Los errores en `createSafeAction` aparecen en Sentry con `clubId` como tag.
- [ ] La página `/diagnostics` carga sin errores (sólo accesible con rol ADMIN+).

#### Comandos de validación
```bash
# Verificar ausencia de console.error crudos en actions
grep -r "console\.error" src/actions/ --include="*.ts" | wc -l
# Resultado esperado: 0

npm run build 2>&1 | tail -20
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| `appLogger` no está disponible en todos los contextos | Baja | Ya existe el módulo; sólo sustituir llamadas |
| Sentry no configurado en desarrollo local | Media | Guard con `if (process.env.SENTRY_ORG)` |

#### Rollback
El logging es aditivo. Revertir sólo si hay regresiones de performance (muy improbable).

---

### DÍA 10 — Release quality: smoke tests + CI gate + runbook de deploy
**PR:** `ci/smoke-tests-and-deploy-runbook`

#### Tareas
1. Crear `tests/smoke/critical-paths.spec.ts` con Playwright:
   - Login exitoso.
   - Crear reserva básica.
   - Ver dashboard (carga en <3s).
   - Logout.
2. Agregar GitHub Actions workflow `.github/workflows/security-check.yml`:
   - `npm run lint`
   - `npm run test:unit`
   - `npx tsc --noEmit`
   - Smoke tests contra preview URL (si `PLAYWRIGHT_BASE_URL` está disponible).
3. Documentar en `docs/deploy-runbook.md`:
   - Checklist de pre-deploy.
   - Cómo correr migraciones localmente antes del deploy.
   - Cómo hacer rollback en Vercel.
   - Variables de entorno críticas.

#### Criterios de aceptación
- [ ] El workflow de CI pasa en el PR antes de merge.
- [ ] Los smoke tests completan en <2 minutos.
- [ ] El runbook de deploy está aprobado por el equipo.

#### Comandos de validación
```bash
npm run test -- tests/smoke/
# Verificar que el workflow es válido
cat .github/workflows/security-check.yml | npx js-yaml  # debería parsear sin error
```

#### Riesgos
| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Smoke tests flaky por timing | Media | Usar `waitForLoadState('networkidle')` y retry en Playwright |
| CI sin acceso a DB de test | Alta | Mockear Prisma en unit tests; E2E contra staging DB |

#### Rollback
CI es no-bloqueante hasta que el equipo lo valide. Si falla, el equipo puede hacer merge manual excepcionalmente.

---

## Resumen de PRs del sprint

| # | PR Name                                      | Día | Severidad | Archivos clave                                       |
|---|----------------------------------------------|-----|-----------|------------------------------------------------------|
| 1 | `fix/tenant-isolation-critical-actions`      | 1   | CRÍTICO   | `matchmaking.ts`, `open-matches.ts`, `mercadopago.ts`|
| 2 | `fix/migrate-actions-to-safe-wrapper`        | 2   | ALTO      | `tournaments.ts`, `turnero.ts`, `diagnostics.ts`     |
| 3 | `fix/remove-godmode-hardcoded-fallback`      | 3   | ALTO      | `auth.ts`                                            |
| 4 | `fix/encryption-scrypt-kdf`                  | 4   | MEDIO     | `lib/encryption.ts`, `scripts/migrate-encryption.ts` |
| 5 | `fix/audit-log-coverage`                     | 5   | MEDIO     | `tournaments.ts`, `open-matches.ts`, `matchmaking.ts`|
| 6 | `test/tenant-isolation-e2e`                  | 5   | MEDIO     | `tests/security/tenant-isolation.spec.ts`            |
| 7 | `fix/csrf-protection`                        | 6   | MEDIO     | `middleware.ts`                                      |
| 8 | `fix/csp-nonce-scripts`                      | 7   | BAJO      | `middleware.ts`, `app/layout.tsx`                    |
| 9 | `feat/onboarding-completion-check`           | 8   | FEATURE   | `actions/onboarding.ts`, `components/dashboard/`     |
|10 | `feat/observability-structured-logging`      | 9   | FEATURE   | `lib/safe-action.ts`, todos los `actions/*.ts`       |
|11 | `ci/smoke-tests-and-deploy-runbook`          | 10  | CALIDAD   | `.github/workflows/`, `tests/smoke/`, `docs/`        |

---

## Matriz de riesgo consolidada

| Riesgo global                              | Probabilidad | Impacto | Mitigación                                          |
|--------------------------------------------|-------------|---------|-----------------------------------------------------|
| Romper flujo de pago público (createPreference) | Media   | Alto    | Guard de auth opcional, test E2E antes de merge     |
| Migración de encryption rompe tokens en prod | Alta      | Crítico | Script staging → prod; función `decryptLegacy` temp |
| CSP nonce rompe scripts de terceros        | Alta        | Medio   | Lista blanca de dominios antes de quitar unsafe-inline |
| GOD_MODE env vars no en Vercel antes del PR | Media     | Alto    | Verificar Vercel env antes de merge del Día 3       |
| Tests E2E flaky en CI                      | Media       | Bajo    | Retry policies, waitForLoadState, test-db separada  |

---

## Invariantes de arquitectura (no romper durante el sprint)

1. **`clubId` en todo query** — nunca quitar un filtro existente, sólo agregar.
2. **`createSafeAction` para mutations** — no mezclar estilos en el mismo archivo.
3. **`nowInArg()` para fechas** — nunca `new Date()` en lógica de negocio.
4. **`<img>` para URLs de usuario** — no migrar a `next/image` sin configurar `remotePatterns`.
5. **Migraciones locales** — nunca en el build script de Vercel.
6. **`logAction()` para toda mutación** — al agregar un nuevo write, agregar el log.

---

## Comandos útiles de validación rápida

```bash
# Desde courtops/

# 1. Type check
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Unit tests
npm run test:unit

# 4. E2E
npm run test

# 5. Buscar actions sin auth
grep -rn "export async function" src/actions/ | grep -v "createSafeAction\|getCurrentClubId\|getOptionalClubId\|getServerSession\|'use server'" | head -20

# 6. Buscar console.error sin logger
grep -rn "console\.error" src/actions/ --include="*.ts"

# 7. Verificar que todos los models tienen clubId
grep -c "clubId" prisma/schema.prisma
```

---

## Definición de "Done" del sprint

- [ ] Todos los hallazgos S-1 a S-4 cerrados y en main.
- [ ] 0 `console.error` crudos en `src/actions/`.
- [ ] Al menos 4 tests de aislamiento tenant pasando en CI.
- [ ] GOD_MODE sin fallback hardcodeado.
- [ ] Encryption usando scrypt (con migración ejecutada en prod).
- [ ] CI workflow activo y bloqueante en PRs.
- [ ] Runbook de deploy documentado y revisado.
