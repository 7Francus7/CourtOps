import { CalendarDays, Grid3X3, Plus, ArrowLeftRight, Flag } from 'lucide-react'
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
      icon: CalendarDays,
      title: 'Módulo de Reservas',
      description:
        'El motor de tu club. Acá gestionás toda la actividad de canchas: creás turnos, cobrás, movés horarios y ves el estado de pago en tiempo real.',
      position: 'center',
    },
    {
      id: 'reservas-grid',
      target: '[data-tour="turnero-grid"]',
      category: 'Vista principal',
      icon: Grid3X3,
      title: 'La grilla de canchas',
      description:
        'Cada columna es una cancha, cada fila un horario. Verde = pagado, amarillo = señado, rojo = deuda. Hacé clic en cualquier celda para actuar.',
      proTip: 'Podés arrastrar una reserva para cambiarla de horario o cancha sin necesidad de borrarla y recrearla.',
      position: 'top',
      padding: 6,
      borderRadius: 24,
      waitForElement: true,
      scrollIntoView: true,
    },
    {
      id: 'new-booking-btn',
      target: '[data-tour="new-booking-btn"]',
      category: 'Crear turno',
      icon: Plus,
      title: 'Nueva reserva manual',
      description:
        'Abrí el formulario de reserva con cancha, fecha, horario, cliente y método de pago. Podés cobrar al contado o dejar deuda registrada.',
      proTip: 'Atajo de teclado "N" — el modal de nueva reserva se abre al instante desde cualquier pantalla del dashboard.',
      position: 'bottom',
      padding: 8,
      borderRadius: 14,
      waitForElement: true,
    },
    {
      id: 'reservas-date',
      target: '[data-tour="date-navigator"]',
      category: 'Navegación',
      icon: ArrowLeftRight,
      title: 'Navegá entre días',
      description:
        'Avanzá o retrocedé entre días para ver disponibilidad. El punto "En Vivo" indica que estás viendo el día actual con datos en tiempo real.',
      proTip: 'Presioná "T" para volver instantáneamente a hoy desde cualquier fecha que estés mirando.',
      position: 'bottom',
      padding: 8,
      borderRadius: 14,
      waitForElement: true,
    },
    {
      id: 'reservas-fin',
      target: null,
      icon: Flag,
      title: '¡Módulo de Reservas dominado!',
      description:
        'Ya sabés crear, navegar y gestionar turnos. El siguiente paso es conocer la gestión de clientes para llevar un CRM completo de tu base de jugadores.',
      position: 'center',
    },
  ],
}
