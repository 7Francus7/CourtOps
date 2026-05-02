import type { TourRegistry } from '../types'
import { generalTour } from './general.tour'
import { reservasTour } from './reservas.tour'
import { clientesTour } from './clientes.tour'
import { kioscoTour } from './kiosco.tour'
import { reportesTour } from './reportes.tour'

export const TOURS: TourRegistry = {
  [generalTour.id]: generalTour,
  [reservasTour.id]: reservasTour,
  [clientesTour.id]: clientesTour,
  [kioscoTour.id]: kioscoTour,
  [reportesTour.id]: reportesTour,
}

export { generalTour, reservasTour, clientesTour, kioscoTour, reportesTour }

/**
 * How to add a new tour:
 * 1. Create src/lib/tour/tours/mi-tour.tour.ts with a TourDefinition object
 * 2. Add target elements in the UI with data-tour="mi-selector"
 * 3. Import and register it here in TOURS
 * 4. Optionally add it to HelpSheet tour list
 */
