import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Reservar Cancha',
  description: 'Reservá tu cancha de pádel online en segundos. Elegí fecha, horario y confirmá desde el celular sin llamadas ni WhatsApp.',
  alternates: { canonical: '/reservar' },
  openGraph: {
    title: 'Reservar Cancha | CourtOps',
    description: 'Reservá tu cancha de pádel online en segundos. Elegí fecha, horario y confirmá desde el celular.',
  },
}

export default function ReservarLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
