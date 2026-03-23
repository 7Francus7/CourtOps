import { toast } from 'sonner'

const fmt = (n: number) => n.toLocaleString('es-AR')

export const t = {
  // ── Generic ──────────────────────────────────────────────────────────
  ok: (title: string, description?: string) =>
    toast.success(title, { description, duration: 3500 }),

  fail: (title: string, description?: string) =>
    toast.error(title, { description, duration: 5000 }),

  warn: (title: string, description?: string) =>
    toast.warning(title, { description, duration: 4000 }),

  note: (title: string, description?: string) =>
    toast.info(title, { description, duration: 4000 }),

  // ── Bookings ─────────────────────────────────────────────────────────
  booking: {
    created: (court?: string, time?: string) =>
      toast.success('Reserva creada', {
        description: court && time ? `${court} · ${time}` : 'La reserva fue registrada',
        duration: 4000,
      }),

    cancelled: (onUndo?: () => void) =>
      toast.success('Reserva cancelada', {
        description: 'El turno quedó disponible',
        duration: 6000,
        action: onUndo
          ? { label: 'Deshacer', onClick: onUndo }
          : undefined,
      }),

    restored: () =>
      toast.success('Reserva restaurada', {
        description: 'El turno volvió a estar activo',
        duration: 3500,
      }),

    seriesCancelled: (count: number) =>
      toast.success(`${count} reservas canceladas`, {
        description: 'Toda la serie recurrente fue dada de baja',
        duration: 4500,
      }),

    payment: (amount: number, method?: string) =>
      toast.success('Pago registrado', {
        description: `$${fmt(amount)}${method ? ` · ${method}` : ''}`,
        duration: 3500,
      }),

    itemAdded: (name: string) =>
      toast.success(`${name} agregado`, {
        description: 'Producto sumado a la reserva',
        duration: 2200,
      }),

    itemRemoved: () =>
      toast.success('Item eliminado', {
        description: 'Removido de la reserva',
        duration: 2200,
      }),
  },

  // ── Kiosco / Ventas ──────────────────────────────────────────────────
  sale: {
    completed: (total: number) =>
      toast.success('Venta completada', {
        description: `Total cobrado: $${fmt(total)}`,
        duration: 4000,
      }),

    quickAdd: (name: string) =>
      toast.success(`+1 ${name}`, {
        duration: 800,
        position: 'bottom-center',
      }),

    stockWarning: () =>
      toast.warning('Stock insuficiente', {
        description: 'No hay más unidades disponibles',
        duration: 3000,
      }),

    stockMax: () =>
      toast.warning('Stock máximo alcanzado', {
        description: 'Llegaste al límite de unidades disponibles',
        duration: 3000,
      }),
  },

  // ── Empleados ────────────────────────────────────────────────────────
  employee: {
    login: (name: string) =>
      toast.success(`Bienvenido, ${name}`, {
        description: 'Sesión de empleado iniciada',
        duration: 3000,
      }),

    logout: () =>
      toast.info('Sesión finalizada', {
        description: 'El terminal volvió al modo general',
        duration: 3000,
      }),

    wrongPin: () =>
      toast.error('PIN incorrecto', {
        description: 'Verificá el código e intentá de nuevo',
        duration: 3500,
      }),

    pinError: () =>
      toast.error('Error al verificar PIN', {
        description: 'Intentá de nuevo en un momento',
        duration: 4000,
      }),
  },

  // ── Check-in ─────────────────────────────────────────────────────────
  checkin: {
    registered: (client?: string) =>
      toast.success('Check-in registrado', {
        description: client ? `${client} marcado como presente` : 'Asistencia registrada',
        duration: 3500,
      }),

    error: (msg?: string) =>
      toast.error('Error en check-in', {
        description: msg || 'No se pudo registrar la asistencia',
        duration: 5000,
      }),
  },
}
