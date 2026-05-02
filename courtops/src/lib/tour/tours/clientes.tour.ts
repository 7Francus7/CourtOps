import type { TourDefinition } from '../types'

export const clientesTour: TourDefinition = {
  id: 'clientes',
  title: 'Tour de Clientes',
  description: 'Gestioná tu base de clientes como un SaaS moderno',
  localStorageKey: 'courtops_tour_clientes_v1',
  steps: [
    {
      id: 'clientes-intro',
      target: null,
      title: 'Módulo de Clientes',
      description:
        'Cada jugador tiene una ficha digital completa con historial de turnos, deudas, membresías y waivers firmados.',
      position: 'center',
    },
    {
      id: 'clients-table',
      target: '[data-tour="clients-table"]',
      title: 'Lista de clientes',
      description:
        'Buscá por nombre o teléfono, filtrá por estado de deuda o membresía. Hacé clic en un cliente para ver su ficha completa.',
      position: 'bottom',
      padding: 8,
      borderRadius: 16,
      waitForElement: true,
      scrollIntoView: true,
    },
    {
      id: 'clients-new',
      target: '[data-tour="clients-new-btn"]',
      title: 'Agregar cliente',
      description:
        'Creá un nuevo cliente con nombre, teléfono y email. Los clientes también se crean automáticamente cuando hacen una reserva online.',
      position: 'bottom',
      padding: 8,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'clients-search',
      target: '[data-tour="clients-search"]',
      title: 'Búsqueda inteligente',
      description:
        'Buscá por nombre, teléfono o email. El sistema encuentra el cliente en tiempo real sin recargar la página.',
      position: 'bottom',
      padding: 8,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'clientes-fin',
      target: null,
      title: '¡Módulo de Clientes dominado!',
      description:
        'Ya sabés cómo gestionar tu base de clientes. Continuá con el tour de Kiosco o Reportes.',
      position: 'center',
    },
  ],
}
