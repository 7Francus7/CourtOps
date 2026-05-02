import type { TourDefinition } from '../types'

export const reportesTour: TourDefinition = {
  id: 'reportes',
  title: 'Tour de Reportes',
  description: 'Tomá decisiones basadas en datos reales de tu club',
  localStorageKey: 'courtops_tour_reportes_v1',
  steps: [
    {
      id: 'reportes-intro',
      target: null,
      title: 'Módulo de Reportes',
      description:
        'Ingresos diarios, ocupación por cancha, productos más vendidos y tendencias semanales. Todo en tiempo real.',
      position: 'center',
    },
    {
      id: 'nav-reportes',
      target: '[data-tour="nav-reportes"]',
      title: 'Sección de Reportes',
      description:
        'Accedé a los reportes desde el menú lateral o con la tecla "R". Disponible solo en planes Pro y superiores.',
      position: 'right',
      padding: 6,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'reportes-charts',
      target: '[data-tour="reportes-charts"]',
      title: 'Gráficas de ingresos',
      description:
        'Visualizá ingresos por día, semana o mes. Compará períodos para detectar tendencias de crecimiento.',
      position: 'top',
      padding: 8,
      borderRadius: 16,
      waitForElement: true,
      scrollIntoView: true,
    },
    {
      id: 'reportes-export',
      target: '[data-tour="reportes-export"]',
      title: 'Exportar datos',
      description:
        'Descargá tus reportes en formato Excel o CSV para compartir con tu contador o para análisis externo.',
      position: 'bottom',
      padding: 8,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'reportes-fin',
      target: null,
      title: '¡Módulo de Reportes dominado!',
      description:
        'Ya sabés cómo leer los datos de tu negocio. Completaste todos los tours disponibles de CourtOps.',
      position: 'center',
    },
  ],
}
