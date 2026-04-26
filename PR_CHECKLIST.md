# PR Checklist — Multi-Tenant Security (CourtOps)

Pegá este checklist en cada PR que toque `src/actions/`, `src/app/api/`, o `src/services/`.  
**Un ✅ faltante = PR bloqueado hasta resolverse.**

---

## 1. Autenticación y extracción de `clubId`

- [ ] Toda Server Action empieza con `getCurrentClubId()` o `createSafeAction()`  
      — nunca acepta `clubId` como parámetro del cliente.
- [ ] Todo Route Handler llama `getServerSession(authOptions)` y valida `session?.user?.clubId`.
- [ ] Rutas de cron/webhook verifican `CRON_SECRET` o firma HMAC **antes** de procesar datos.

## 2. Lecturas (`findUnique`, `findFirst`, `findMany`)

- [ ] Toda query de **modelos sensibles** incluye `clubId` en el `where`.  
      Modelos sensibles: `Booking`, `Client`, `Transaction`, `CashRegister`, `Court`,  
      `PriceRule`, `Employee`, `User`, `Membership`, `MembershipPlan`, `Waiver`,  
      `WaiverSignature`, `Referral`, `Tournament`, `AuditLog`, `Product`, `Notification`.
- [ ] `findUnique({ where: { id } })` sin `clubId` sólo se usa cuando el contexto es público  
      por diseño (ej. página pública de torneo por slug).

## 3. Escrituras (`update`, `delete`, `upsert`, `updateMany`, `deleteMany`)

- [ ] **NINGÚN** `update` o `delete` usa `where: { id }` solamente.
- [ ] Para modelos con `@@unique([id, clubId])`: usar `where: { id_clubId: { id, clubId } }`.
- [ ] Para modelos **sin** compound unique: usar `updateMany` / `deleteMany` con  
      `where: { id, clubId }`.
- [ ] `upsert` incluye `clubId` en el `create` y en el `where`.
- [ ] Los `$transaction([...])` aplican el mismo principio a cada operación dentro.

## 4. Verificación de propiedad (ownership)

- [ ] El patrón "verifico propiedad con `findFirst`, luego muto con `id` solo" está  
      **prohibido**. La mutación DEBE incluir `clubId` aunque ya se haya verificado antes.
- [ ] Si el `findFirst` de verificación retorna `null`, la función retorna error antes  
      de ejecutar cualquier mutación.

## 5. Rutas públicas (sin sesión)

- [ ] Las rutas públicas que aceptan `clubId` como parámetro de URL/body lo validan  
      contra la DB (`prisma.club.findUnique({ where: { id: clubId } })`) antes de usarlo.
- [ ] Las mutaciones desde rutas públicas tienen algún mecanismo de autorización:  
      token de reserva (`publicToken`), firma HMAC, o rate limiting por IP.
- [ ] `publicToken` nulo/undefined = **la acción pública está bloqueada**, no liberada.

## 6. Webhook handlers

- [ ] La validación de firma/secret ocurre **antes** de leer el body.
- [ ] Los IDs del payload (ej. `bookingId`, `clientId`) se resuelven contra la DB  
      con `clubId` en el where, no se usan directamente para mutaciones.
- [ ] Los `clubId` del `external_reference` se verifican contra el club real en DB  
      antes de usarse como discriminador de tenant.

## 7. Comandos de validación pre-merge

```bash
# Desde courtops/

# 1. Verificar que no hay updates/deletes solo por id en actions/
grep -rn "where: { id[^_]" src/actions/ --include="*.ts" | grep -E "\.update\(|\.delete\("

# 2. Verificar que no hay updates/deletes solo por id en api/
grep -rn "where: { id[^_]" src/app/api/ --include="*.ts" | grep -E "\.update\(|\.delete\("

# 3. Verificar que no hay findUnique por id solo en modelos sensibles
grep -rn "findUnique.*where.*{ id[^_]" src/actions/ --include="*.ts"

# 4. Type check
npx tsc --noEmit

# 5. Lint
npm run lint

# 6. Unit tests de seguridad
npm run test:unit -- tests/unit/multi-tenant-audit.test.ts tests/unit/tenant-isolation.test.ts

# 7. Build completo
npm run build 2>&1 | grep -E "^Error|error TS"
```

## 8. Modelos y sus compound unique keys

| Modelo          | Compound unique              | Usar en update/delete              |
|-----------------|------------------------------|------------------------------------|
| `Employee`      | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `Client`        | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `Court`         | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `PriceRule`     | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `Booking`       | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `BookingItem`   | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `CashRegister`  | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `Transaction`   | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `MembershipPlan`| `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `Tournament`    | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |
| `Waiver`        | `@@unique([id, clubId])`     | `{ id_clubId: { id, clubId } }`    |

> Migration `20260426000000_add_compound_unique_indexes` agrega los índices.  
> Correr `npm run db:migrate` antes del deploy.

---

## Quick reference — Snippets correctos

```typescript
// ✅ update con compound unique
await prisma.booking.update({
  where: { id_clubId: { id: bookingId, clubId } },
  data: { status: 'CONFIRMED' }
})

// ✅ update sin compound unique (use updateMany)
await prisma.tournament.updateMany({
  where: { id: tournamentId, clubId },
  data: { status: 'FINISHED' }
})

// ✅ delete con compound unique
await prisma.employee.delete({
  where: { id_clubId: { id: employeeId, clubId } }
})

// ✅ delete sin compound unique (use deleteMany)
await prisma.tournament.deleteMany({
  where: { id: tournamentId, clubId }
})

// ❌ NUNCA — update solo por id
await prisma.booking.update({ where: { id: bookingId }, data: { ... } })

// ❌ NUNCA — delete solo por id
await prisma.employee.delete({ where: { id: employeeId } })

// ❌ NUNCA — verificar propiedad y luego mutar sin clubId
const existing = await prisma.waiver.findFirst({ where: { id, clubId } })
if (!existing) return error
await prisma.waiver.update({ where: { id }, data }) // ← INSEGURO aunque verifica arriba
```
