-- ¡EJECUTAR ESTO EN VERCEL POSTGRES QUERY! --

-- El sistema de pagos atómico ya está implementado en el código,
-- pero falla porque la tabla Transaction en producción no tiene la columna bookingId.

-- Paso 1: Agregar la columna bookingId (Asumiendo que Booking.id es Integer, si es String cambia INT por TEXT)
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "bookingId" INTEGER;

-- Paso 2: Crear índice para rendimiento
CREATE INDEX IF NOT EXISTS "Transaction_bookingId_idx" ON "Transaction"("bookingId");

-- NOTA: Una vez ejecutado esto, el sistema usará automáticamente 
-- la lógica 'Atomic Payment' implementada en src/actions/payment.atomic.ts
