export type TourPosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface TourStep {
  id: string
  /** CSS selector to highlight. null/undefined = centered overlay (no spotlight) */
  target?: string | null
  title: string
  description: string
  /** Where to render the tooltip relative to the target */
  position?: TourPosition
  /** Extra space around the spotlight cutout (px) */
  padding?: number
  /** Border radius of the spotlight cutout (px) */
  borderRadius?: number
  /** Wait up to 3s for the element to appear in the DOM */
  waitForElement?: boolean
  /** Scroll target element into view before measuring */
  scrollIntoView?: boolean
}

export interface TourDefinition {
  id: string
  title: string
  description: string
  /** localStorage key used to persist completion */
  localStorageKey: string
  steps: TourStep[]
}

export interface TourRegistry {
  [tourId: string]: TourDefinition
}
