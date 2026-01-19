# 🚀 CourtOps: Plan de Escalabilidad y Mejoras Técnicas

Este documento detalla una hoja de ruta técnica para escalar el sistema "CourtOps" de un MVP funcional a un SaaS robusto, capaz de soportar cientos de clubes y miles de usuarios concurrentes.

## 1. Arquitectura y Backend

### A. Capa de Caché (Redis)
**Problema:** Actualmente, cada carga del calendario (Turnero) golpea directamente la base de datos PostgreSQL. A medida que aumenta el tráfico (especialmente bots o usuarios refrescando), esto degradará el rendimiento.
**Solución:** Implementar **Redis** (ej. Upstash durante desarrollo/Vercel KV).
- **Strategy:** Caché de "Disponibilidad" por día/club.
- **Key:** `availability:${clubId}:${date}`
- **Invalidación:** Al crear/modificar/cancelar una reserva, invalidar solo la key afectada.
- **Beneficio:** Lecturas de calendario < 50ms y reducción del 90% de carga en DB.

### B. Rate Limiting
**Problema:** Las rutas públicas (`/api/public/...`) son vulnerables a ataques de fuerza bruta o scraping por parte de competidores.
**Solución:** Middleware de Rate Limiting.
- **Herramienta:** `@vercel/kv` con `ratelimit`.
- **Regla:** 50 requests por minuto por IP para rutas de "lectura", 5 por minuto para "crear reserva".
- **Impacto:** Protección contra DDOS y abuso de API.

### C. Procesamiento Asíncrono (Colas)
**Problema:** Envío de emails, notificaciones de WhatsApp o actualizaciones de estado complejas se ejecutan en el hilo principal de la request. Si MercadoPago tarda, la UI se congela.
**Solución:** Mover tareas pesadas a **Background Jobs**.
- **Herramienta:** **Inngest** o **Trigger.dev** (Serverless friendly).
- **Casos de Uso:**
  - Envío de emails de confirmación.
  - Recordatorios de WhatsApp (Cron jobs).
  - Sincronización de pagos fallidos.
  - Generación de reportes mensuales.

---

## 2. Base de Datos (Prisma & PostgreSQL)

### A. Optimización de Índices (Revisión)
Asegurar que las queries más frecuentes tengan índices compuestos (`COVERING INDEXES`).
- **Query Crítica:** "Dame todos los bookings de este Club entre fecha A y fecha B".
- **Índice Actual:** `@@index([clubId, startTime])` (Correcto).
- **Mejora:** Agregar índices para búsquedas de clientes: `@@index([clubId, phone])` y `@@index([clubId, email])` para auto-completado rápido en recepción.

### B. Connection Pooling
Si se usa Serverless (Neon/Vercel Postgres), asegurar el uso de `Prisma Data Proxy` o `PgBouncer` para evitar agotar las conexiones de base de datos con lambdas concurrentes.

---

## 3. Frontend & UX (Velocidad Percibida)

### A. Optimistic Updates (UI Optimista)
**Problema:** Al reservar o mover un turno, el usuario espera a que el servidor responda para ver el cambio.
**Solución:** Usar `useOptimistic` de React 19 o `React Query mutations`.
- **Efecto:** Al soltar un turno en el calendario, se "pega" instantáneamente visualmente mientras se guarda en segundo plano. Si falla, se revierte con un toast de error.
- **Sensación:** La app se siente "nativa" y extremadamente rápida.

### B. Skeleton Loading Inteligente
En lugar de un spinner general, usar "Skeletons" que imiten la grilla del Turnero. Esto reduce la carga cognitiva y mejora el CLS (Cumulative Layout Shift).

### C. Virtualización del DOM
Si un club tiene 20 canchas, renderizar todas las columnas de golpe puede ser lento. Usar **Virtual Scroller** (ej. `tanstack/react-virtual`) para renderizar solo lo que está en el viewport.

---

## 4. Calidad de Código y DevExperience

### A. Testing E2E (End-to-End)
Implementar **Playwright** para flujos críticos.
- **Test 1:** Usuario Público entra al link -> Selecciona hora -> Carga datos -> Paga (Mock) -> Éxito.
- **Test 2:** Recepcionista crea reserva -> Mueve reserva -> Cancela reserva.
- **Beneficio:** Dormir tranquilo sabiendo que el flujo de dinero no está roto tras un deploy.

### B. Strict TypeScript
Hay varios `any` y errores de tipado en el historial. Activar `strict: true` en `tsconfig` y evitar `any` a toda costa. Usar `zod` para validar tipos en tiempo de ejecución en las Server Actions.

---

## 5. Nuevas Features Sugeridas para Escalar

### A. Módulo de "Eventos / Torneos"
Los clubes organizan "Americanos" o torneos. Crear un modelo `Tournament` que bloquee múltiples canchas y gestione inscripciones masivas diferenciadas de reservas simples.

### B. Membresías Recurrentes (Suscripciones)
Integrar suscripciones automáticas (Débito automático vía MercadoPago Subscriptions) para clases o abonos mensuales de socios, automatizando el estado `active` del socio.

### C. Portal de Dueño (Analytics Avanzado)
Dashboard superior para dueños de cadenas (múltiples sedes). Comparativa de ingresos entre sedes, ocupación promedio, y LTV (Lifetime Value) del cliente.

---

### Resumen de Prioridades
1. 1. **Testing E2E** (Crítico para seguridad).
2. 2. **Optimistic UI** (Crítico para UX/Venta).
3. 3. **Redis Caching** (Crítico para Performance con carga).
4. 4. **Background Jobs** (Crítico para estabilidad de notificaciones).
