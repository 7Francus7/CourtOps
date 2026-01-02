# Especificación de Sistema Integral: Match Point Ruta 17

**Rol:** Arquitecto de Software + Product Manager + UX/UI Designer
**Fecha:** 30/12/2025
**Versión:** 1.0

---

## A) Preguntas de Aclaración (Supuestos tomados)

Aunque la especificación es completa, se han asumido las siguientes definiciones para avanzar (se confirmarán en la etapa de inicio):
1. **Control de Stock en Kiosco:** El stock se descuenta al momento de confirmar la venta ("Cobrar"), no al agregar al carrito.
2. **Facturación Fiscal:** No se incluye integración con entes fiscales (AFIP/Hacienda) en el MVP; la "Caja" es de gestión interna.
3. **Identificación de Cliente:** El número de teléfono (celular) será el identificador único principal para evitar duplicados de nombres.
4. **Reserva Online:** No requiere pago online obligatorio en el MVP (pago en el club), aunque el sistema estará preparado para integrarlo en PRO.

---

## B) Alcance MVP vs Versión PRO

| Característica | MVP (Producto Mínimo Viable) | Versión PRO (Futuro) |
| :--- | :--- | :--- |
| **Turnero** | Calendario interactivo, Validaciones básicas, Precios por Temp/Luz. | Drag & Drop avanzado, Listas de espera, Bloqueos recurrentes automáticos. |
| **Reservas Online** | Web pública móvil, formulario de reserva, confirmación en pantalla. | Pagos online (MercadoPago/Stripe), Login de usuario, "Mis Reservas". |
| **Notificaciones** | Mensaje de confirmación en UI. Envío manual de link. | WhatsApp automático (Confirmación, Recordatorio 24h, Cancelación). |
| **Kiosco/Stock** | Venta rápida, Stock simple, ABM Productos. | Control de proveedores, Escáner de código de barras, Alerta de stock a email. |
| **Caja/Finanzas** | Caja Z (Diaria), Totales Efectivo/Transferencia. | Múltiples cajas, Reportes financieros exportables a Excel/PDF. |
| **Clientes** | Alta rápida, Historial de reservas básico. | Perfilamiento, Niveles de socio, Mailing masivo. |

---

## C) User Stories & Criterios de Aceptación

### 1. Turnero (Recepción)
* **US-01: Ver disponibilidad.** *Como recepcionista, quiero ver una grilla con las 2 canchas y horarios para identificar huecos rápidamente.*
  * **CA:** Grilla visual con ejes (Hora vs Cancha). Diferenciación visual de estados. Carga < 1s.
* **US-02: Crear Reserva.** *Como admin, quiero agendar un turno ingresando nombre y teléfono.*
  * **CA:** Validación de solapamiento. Auto-completado de cliente si existe. Cálculo automático de precio (Día/Noche).
* **US-03: Cancelar turno.** *Como admin, quiero cancelar una reserva para liberar el horario.*
  * **CA:** Cambio de estado a "Cancelada". Registro en auditoría (quién y cuándo). Liberación inmediata en la web pública.

### 2. Cliente (Web Pública)
* **US-04: Reservar desde el celular.** *Como jugador, quiero entrar al link, elegir día y hora y reservar sin registrarme.*
  * **CA:** Formulario simple (Nombre, Tel). Validación SMS (Opcional en PRO, MVP directo). Feedback visual de "Confirmado". Regla de 6hs visible.

### 3. Caja y Administrativo
* **US-05: Cobrar turno/producto.** *Como cajero, quiero registrar una venta sumando cancha y bebidas.*
  * **CA:** Selección de método de pago (Efvo/Transf). Cálculo de vuelto. Descuento de stock Kiosco. Registro en caja diaria.
* **US-06: Cerrar caja.** *Como admin, quiero cerrar el día viendo el total recaudado y diferencias.*
  * **CA:** Resumen por medio de pago. Input para "Realidad en caja" vs "Sistema".

---

## D) Modelo de Datos (ERD Preliminar)

### Entidades Principales

1.  **`users`** (Sistema): `id`, `username`, `password_hash`, `role` (ADMIN, RECEPCION).
2.  **`clients`**: `id`, `full_name`, `phone` (Unique), `notes`, `created_at`.
3.  **`courts`**: `id`, `name` (Cancha 1, Cancha 2), `is_active`.
4.  **`seasons`**: `id`, `name` (Verano 2025), `start_date`, `end_date`, `light_cutoff_time` (Time), `price_day`, `price_night`.
5.  **`bookings`**: 
    *   `id`, `client_id` (FK), `court_id` (FK)
    *   `start_datetime` (Timestamp), `end_datetime` (Timestamp)
    *   `total_price`, `status` (PENDING, CONFIRMED, CANCELED, COMPLETED, NO_SHOW)
    *   `payment_status` (UNPAID, PARTIAL, PAID)
    *   `audit_created_by` (FK user), `audit_created_at`.
6.  **`products`** (Kiosco): `id`, `name`, `category`, `cost`, `price`, `stock_current`, `stock_min`, `image_url`.
7.  **`cash_register`**: `id`, `opened_at`, `closed_at`, `start_amount`, `end_amount_cash`, `end_amount_transfer`, `status` (OPEN, CLOSED), `user_id`.
8.  **`transactions`**: 
    *   `id`, `cash_register_id` (FK), `booking_id` (Nullable FK), `type` (INCOME, EXPENSE)
    *   `amount`, `payment_method` (CASH, TRANSFER), `description` (e.g., "Venta Gatorade x2").

### Relaciones Clave
*   `bookings` N-1 `clients`
*   `transactions` N-1 `cash_register`
*   `transaction_items` (Detalle venta) N-1 `transactions`, N-1 `products`.

---

## E) Reglas de Negocio

1.  **Duración de Turnos:** Estrictamente 90 minutos.
2.  **Validación Horaria:** 
    *   Inicio >= 14:00.
    *   Fin <= 00:30 (Inicio 23:00).
    *   No solapamientos en la misma cancha.
3.  **Precio Dinámico:** 
    *   Se busca la `season` activa donde `fecha_turno` esté entre `start_date` y `end_date`.
    *   Si `hora_inicio` < `season.light_cutoff_time` -> Precio Día.
    *   Si `hora_inicio` >= `season.light_cutoff_time` -> Precio Noche.
4.  **Cancelaciones:**
    *   Cliente (Web): Solo si `(start_datetime - now) >= 6 hours`.
    *   Recepción/Admin: Siempre permitido (requiere motivo si < 6h).
5.  **Stock:** No se permite venta si `stock_current` <= 0 (Configurable: permitir pero avisar).

---

## F) Diseño de Pantallas (UI/UX)

### Estética General “Match Point”
*   **Fondo:** `#0C0F14` (Casi negro, reduce fatiga visual).
*   **Cards/Paneles:** `#0A1F35` (Azul muy oscuro) con bordes sutiles `#1259A6`.
*   **Acentos:** `#B4EB18` (Verde Padel) para botones de acción principal (Reservar, Cobrar) y estados "Confirmado".
*   **Tipografía:** Inter o Roboto. Sans-serif, limpia.

### Mapa de Navegación (Admin)
1.  **Dashboard / Turnero (Home)**
    *   Vista Principal. Acceso rápido a Nueva Reserva, Kiosco, Caja.
2.  **Kiosco / Punto de Venta**
    *   Grilla de productos, Carrito lateral, Botón Cobrar.
3.  **Administración**
    *   Clientes, Caja Histórico, Configuración (Precios, Temporadas), Reportes.

### Wireframes Textuales

#### 1. Turnero (Vista Principal)
*   **Header:** Logo, Estado Caja (Abierta $12.500), Usuario.
*   **Toolbar:** Selector de Fecha (Hoy < >), Filtro Cancha.
*   **Grid Central:**
    *   Columnas: Cancha 1 | Cancha 2.
    *   Filas: 14:00, 15:30, 17:00, 18:30, 20:00, 21:30, 23:00.
    *   **Celda Libre:** Botón sutil `+` verde al hover. Muestra precio.
    *   **Celda Ocupada:** Card sólida azul (si pagó) o con borde naranja (si debe). Muestra: "Juan Pérez", Icono Teléfono, Estado pago.
*   **Sidebar Derecho (Plegable):** Próximos turnos, Alertas stock bajo.

#### 2. Modal Nueva Reserva
*   **Título:** "Nuevo Turno - Cancha 1 - 20:00 (Noche)"
*   **Form:**
    *   Input "Buscador Cliente" (Autosuggest).
    *   Botón "Nuevo Cliente" (abre mini form).
    *   Resumen Precio: "$ 5.000". Checkbox "Seña/Pagado".
    *   Botones: "Cancelar" (Gris), "Confirmar Reserva" (Verde Fluor).

#### 3. Web Pública (Mobile)
*   **Hero:** Logo, Texto "Reservá tu cancha".
*   **Step 1:** Selección Fecha (Carrusel horizontal de días).
*   **Step 2:** Lista de Horarios Disponibles.
    *   Card: "18:30 - Cancha 1 - $Precio". Botón "Reservar".
*   **Step 3:** Modal Datos.
    *   Input Nombre, Input Celular. Texto legal cancelaciones.
    *   Botón "Confirmar".
*   **Success:** "¡Listo! Te esperamos." Botón "Agendar en Google Calendar".

---

## G) Reportes

1.  **Ocupación Semanal:** % ocupación por franja horaria. (Heatmap: Lunes 20hs = Rojo/Alto).
2.  **Caja y Finanzas:** Ingresos brutos, desglose Efectivo vs Transferencia.
3.  **Kiosco:** Top 5 productos vendidos.

---

## H) Plan de Desarrollo (Sprints)

**Duración Sprint:** 1 Semana.

*   **Fase 1: Core & Config (Sprints 1-2)**
    *   Setup Monorrepo (Next.js + NestJS/Node). DB Schema.
    *   ABM Temporadas, Canchas, Precios.
    *   Lógica de generación de slots fijos.
*   **Fase 2: Turnero Admin (Sprints 3-4)**
    *   UI Calendario.
    *   CRUD Reservas (Crear, Editar, Cancelar).
    *   Validaciones de negocio.
*   **Fase 3: Web Pública (Sprint 5)**
    *   Flow de reserva cliente anonimo.
    *   Diseño responsive mobile.
*   **Fase 4: Caja y Kiosco (Sprint 6)**
    *   Carrito de compras simple.
    *   Apertura/Cierre caja.
*   **Fase 5: Testing & Deploy (Sprint 7)**
    *   Tests de integración.
    *   Despliegue en Vercel/Railway.

---

## I) Plan de Pruebas (Casos Críticos)

1.  **Cambio de Temporada:** Crear reserva el día del cambio de temporada (ej: Verano -> Invierno). Verificar que el horario de corte de luz y el precio cambien correctamente.
2.  **Concurrencia:** Intentar reservar el mismo turno desde Admin y Web Pública al mismo segundo. (DB constraints deben fallar una).
3.  **Cancelación Límite:** Intentar cancelar como cliente faltando 5h 59m (Bloqueado) vs 6h 01m (Permitido).
4.  **Caja Negativa:** Intentar registrar gasto mayor al efectivo en caja.

---

## J) Checklist "Listo para Producción"

*   [ ] Base de datos con backups automáticos configurados.
*   [ ] Temporada inicial y precios cargados.
*   [ ] Dominio configurado (ej: matchpoint17.com).
*   [ ] HTTPS/SSL activo.
*   [ ] Cuentas de admin creadas con contraseñas seguras.
*   [ ] Usuario de "Caja" distinto al de "Dueño".
*   [ ] Pruebas de carga en web pública (simular 50 usuarios).

---

## Arquitectura Propuesta y Justificación

**Stack Elegido:** T3 Stack o similar (Next.js + TypeScript + Tailwind + PostgreSQL).
*   **Frontend & Backend (Next.js):** Permite tener la API y el Frontend en el mismo proyecto, ideal para velocidad de desarrollo y tipo de proyecto medio.
*   **Base de Datos (PostgreSQL en Supabase/Neon):** Relacional, robusta, escalable. Supabase ofrece Auth y realtime gratis para la capa PRO futura.
*   **Estilos (Tailwind CSS):** Desarrollo rápido de UI personalizada con los colores de la marca sin escribir CSS verbose.
*   **Despliegue (Vercel):** Costo cero inicial, CI/CD automático, escalado global para la web pública.

**Estrategia de Despliegue:**
*   **Ambientes:** Staging (Pruebas) y Production.
*   **Backup:** Dump diario de SQL a bucket S3 o retención automática de proveedor DB.
