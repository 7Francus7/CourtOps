import React from 'react'
import prisma from '@/lib/db'

export default async function SocialProof() {
  const clubCount = await prisma.club.count({ where: { deletedAt: null } }).catch(() => 150)

  const stats = [
    {
      value: `${Math.max(clubCount, 150)}+`,
      label: 'Clubes Activos',
    },
    {
      value: '50k+',
      label: 'Jugadores Registrados',
    },
    {
      value: '99.9%',
      label: 'Disponibilidad de Plataforma',
      dot: true,
    },
  ]

  return (
    <section
      className="py-14 border-y"
      style={{ background: 'var(--co-surface)', borderColor: 'var(--co-border)' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <p
                className="text-5xl font-black mb-2 flex items-center justify-center gap-2"
                style={{ color: 'var(--co-navy)' }}
              >
                {stat.value}
                {stat.dot && (
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ background: 'var(--co-green)' }}
                  />
                )}
              </p>
              <p className="font-medium uppercase text-xs tracking-widest" style={{ color: 'var(--co-muted)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
