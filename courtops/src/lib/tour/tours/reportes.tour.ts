import { BarChart3, TrendingUp, FileDown, Flag } from 'lucide-react'
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
      icon: BarChart3,
      title: 'Módulo de Reportes',
      description:
        'Inteligencia de negocio para tu club. Ingresos por período, ocupación por cancha, horarios más rentables y productos top. Todo exportable.',
      position: 'center',
    },
    {
      id: 'nav-reportes',
      target: '[data-tour="nav-reportes"]',
      category: 'Acceso',
      icon: BarChart3,
      title: 'Sección de Reportes',
      description:
        'Accedé a los reportes desde el menú lateral o con la tecla "R". Disponible en todos los planes activos de CourtOps.',
      proTip: 'Guardá esta sección como favorito en tu navegador para revisar los números cada mañana antes de abrir el club.',
      position: 'right',
      padding: 6,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'reportes-charts',
      target: '[data-tour="reportes-charts"]',
      category: 'Visualización',
      icon: TrendingUp,
      title: 'Gráficas de ingresos',
      description:
        'Visualizá tus ingresos diarios, semanales o mensuales en barras o líneas. Comparás períodos para detectar tendencias y estacionalidades.',
      proTip: 'Comparar el mismo mes del año anterior te ayuda a entender si el negocio está creciendo o si hay variaciones estacionales normales.',
      position: 'top',
      padding: 8,
      borderRadius: 16,
      waitForElement: true,
      scrollIntoView: true,
    },
    {
      id: 'reportes-export',
      target: '[data-tour="reportes-export"]',
      category: 'Exportación',
      icon: FileDown,
      title: 'Exportá a Excel o CSV',
      description:
        'Descargá cualquier reporte en formato Excel o CSV. Listo para enviarle a tu contador, importar a otro sistema, o hacer tu propio análisis.',
      proTip: 'Exportar el reporte mensual de ingresos en formato Excel es lo que más tiempo ahorra a la hora de rendir cuentas.',
      position: 'bottom',
      padding: 8,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'reportes-fin',
      target: null,
      icon: Flag,
      title: 'Ya tenés todo para crecer',
      description:
        'Completaste todos los tours de CourtOps. Con estos datos podés tomar mejores decisiones cada día. El sistema trabaja para vos 24/7.',
      position: 'center',
    },
  ],
}
