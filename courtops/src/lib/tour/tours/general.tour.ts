import type { TourDefinition } from '../types'

export const generalTour: TourDefinition = {
  id: 'general',
  title: 'Tour General',
  description: 'Conoce las funciones principales del sistema en 7 pasos',
  localStorageKey: 'courtops_tour_general_v1',
  steps: [
    {
      id: 'welcome',
      target: null,
      title: '¡Bienvenido a CourtOps!',
      description:
        'En este recorrido rápido vas a conocer las funciones principales para gestionar tu club de padel. Podés saltar el tour en cualquier momento.',
      position: 'center',
    },
    {
      id: 'sidebar-nav',
      target: '[data-tour="sidebar-nav"]',
      title: 'Menú de navegación',
      description:
        'Desde aquí accedés a todas las secciones: Reservas, Clientes, Kiosco, Caja, Reportes y Configuración. En pantallas pequeñas el menú se colapsa a íconos.',
      position: 'right',
      padding: 8,
      borderRadius: 16,
      waitForElement: true,
    },
    {
      id: 'dashboard-stats',
      target: '[data-tour="dashboard-stats"]',
      title: 'Métricas del día',
      description:
        'Acá ves los ingresos, reservas activas, deudas pendientes y ocupación de canchas — actualizados en tiempo real.',
      position: 'bottom',
      padding: 8,
      borderRadius: 20,
      waitForElement: true,
    },
    {
      id: 'turnero-grid',
      target: '[data-tour="turnero-grid"]',
      title: 'Grilla de reservas',
      description:
        'El corazón del sistema. Hacé clic en cualquier espacio vacío para crear una reserva. Arrastrá para mover turnos. Los colores indican el estado de pago.',
      position: 'top',
      padding: 6,
      borderRadius: 24,
      waitForElement: true,
      scrollIntoView: true,
    },
    {
      id: 'new-booking',
      target: '[data-tour="new-booking-btn"]',
      title: 'Nueva reserva',
      description:
        'Creá una nueva reserva con un clic. También podés usar el atajo de teclado "N" desde cualquier parte del dashboard.',
      position: 'bottom',
      padding: 8,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'nav-clientes',
      target: '[data-tour="nav-clientes"]',
      title: 'Gestión de clientes',
      description:
        'Accedé a la ficha completa de cada cliente: historial de turnos, deudas, membresías y firma digital de waivers.',
      position: 'right',
      padding: 6,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'nav-reportes',
      target: '[data-tour="nav-reportes"]',
      title: 'Reportes y analítica',
      description:
        'Ingresos diarios, ocupación por cancha, productos más vendidos y tendencias. Todo en tiempo real para tomar mejores decisiones.',
      position: 'right',
      padding: 6,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'finish',
      target: null,
      title: '¡Ya estás listo!',
      description:
        'Exploraste las funciones clave de CourtOps. Podés relanzar este tour desde el Centro de Ayuda en cualquier momento.',
      position: 'center',
    },
  ],
}
