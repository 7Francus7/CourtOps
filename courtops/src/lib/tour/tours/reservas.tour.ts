import type { TourDefinition } from '../types'

export const reservasTour: TourDefinition = {
  id: 'reservas',
  title: 'Tour de Reservas',
  description: 'Aprendé a gestionar turnos de forma profesional',
  localStorageKey: 'courtops_tour_reservas_v1',
  steps: [
    {
      id: 'reservas-intro',
      target: null,
      title: 'Módulo de Reservas',
      description:
        'Te mostramos cómo crear, modificar y gestionar reservas de canchas de forma rápida y profesional.',
      position: 'center',
    },
    {
      id: 'reservas-grid',
      target: '[data-tour="turnero-grid"]',
      title: 'Grilla de canchas',
      description:
        'Cada columna es una cancha. Cada fila es un horario. Los bloques de colores son reservas activas. Hacé clic en un espacio vacío para crear una nueva reserva.',
      position: 'top',
      padding: 6,
      borderRadius: 24,
      waitForElement: true,
      scrollIntoView: true,
    },
    {
      id: 'new-booking-btn',
      target: '[data-tour="new-booking-btn"]',
      title: 'Crear reserva manual',
      description:
        'Usá este botón (o la tecla "N") para crear una reserva eligiendo cancha, horario y cliente. También podés agregar un pago parcial al momento de crear.',
      position: 'bottom',
      padding: 8,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'reservas-date',
      target: '[data-tour="date-navigator"]',
      title: 'Navegador de fechas',
      description:
        'Avanzá o retrocedé entre días para ver la disponibilidad. La tecla "T" te lleva siempre a hoy.',
      position: 'bottom',
      padding: 8,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'reservas-fin',
      target: null,
      title: '¡Módulo de Reservas dominado!',
      description:
        'Ya sabés cómo navegar y crear reservas. Explorá los demás tours para conocer Clientes, Kiosco y Reportes.',
      position: 'center',
    },
  ],
}
