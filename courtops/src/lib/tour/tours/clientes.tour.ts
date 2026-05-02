import { Users, LayoutGrid, UserPlus, Search, Flag } from 'lucide-react'
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
      icon: Users,
      title: 'Módulo de Clientes',
      description:
        'Tu CRM de jugadores. Cada cliente tiene una ficha digital con historial de turnos, deudas, membresías y waivers firmados. Sin papel, sin Excel.',
      position: 'center',
    },
    {
      id: 'clients-table',
      target: '[data-tour="clients-table"]',
      category: 'Base de datos',
      icon: LayoutGrid,
      title: 'Tus jugadores en un vistazo',
      description:
        'Cada tarjeta muestra el estado del cliente: activo, en riesgo de perderlo, o perdido. El color del avatar indica su salud como cliente.',
      proTip: 'Hacé clic en cualquier cliente para ver su ficha completa con historial de turnos, pagos y notas personalizadas.',
      position: 'bottom',
      padding: 8,
      borderRadius: 16,
      waitForElement: true,
      scrollIntoView: true,
    },
    {
      id: 'clients-search',
      target: '[data-tour="clients-search"]',
      category: 'Búsqueda',
      icon: Search,
      title: 'Encontrá cualquier cliente al instante',
      description:
        'Buscá por nombre o teléfono. El sistema filtra en tiempo real. También podés filtrar por estado (activo, deuda, membresía) o nivel de juego.',
      proTip: 'El filtro "Deuda" te muestra solo los clientes con saldo pendiente — ideal para hacer recordatorios de cobro masivos.',
      position: 'bottom',
      padding: 8,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'clients-new',
      target: '[data-tour="clients-new-btn"]',
      category: 'Agregar cliente',
      icon: UserPlus,
      title: 'Registrá un nuevo jugador',
      description:
        'Completá nombre, teléfono y email. Podés asignar nivel de juego y agregar notas privadas. El cliente también se crea automáticamente al reservar online.',
      proTip: 'Usá el importador CSV para cargar toda tu base de clientes existente de una sola vez sin tener que ingresarlos uno por uno.',
      position: 'bottom',
      padding: 8,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'clientes-fin',
      target: null,
      icon: Flag,
      title: '¡Módulo de Clientes dominado!',
      description:
        'Ya sabés gestionar tu base de jugadores como un pro. El siguiente paso es conocer el Kiosco para registrar ventas y el módulo de Reportes para analizar tu negocio.',
      position: 'center',
    },
  ],
}
