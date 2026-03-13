'use client'

import { useState } from 'react'
import { X, ChevronDown, MessageCircle, Book, Keyboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

interface FAQ {
  q: string
  a: string
}

const GLOBAL_FAQS: FAQ[] = [
  { q: '¿Cómo creo una reserva?', a: 'Hacé click en el botón "+" o presioná la tecla "N" desde el dashboard.' },
  { q: '¿Cómo cambio un turno de horario?', a: 'En desktop, arrastrá la reserva a otro horario. En mobile, abrí la reserva y editá la hora.' },
  { q: '¿Cómo cobro una reserva?', a: 'Abrí la reserva y usá el botón "Registrar Pago". Podés elegir efectivo o digital.' },
  { q: '¿Cómo comparto mi link público?', a: 'Presioná "L" o copiá el link desde el botón "Link Público" en el dashboard.' },
  { q: '¿Cómo cierro la caja del día?', a: 'Andá a Caja y presioná "Cerrar Caja". Se generará un resumen automático.' },
]

const CONTEXTUAL_FAQS: Record<string, FAQ[]> = {
  '/dashboard': [
    { q: '¿Qué significan los colores de las reservas?', a: 'Verde = pagada, Azul = seña parcial, Blanco = pendiente de pago.' },
    { q: '¿Cómo veo el estado de ocupación?', a: 'El widget superior muestra canchas ocupadas vs libres en tiempo real.' },
  ],
  '/caja': [
    { q: '¿Puedo registrar un gasto?', a: 'Sí, usá "Nuevo Movimiento" y seleccioná "Egreso" como tipo.' },
    { q: '¿Qué pasa si la caja no cierra?', a: 'El sistema calcula la diferencia automáticamente al cerrar.' },
  ],
  '/clientes': [
    { q: '¿Cómo cargo saldo a un cliente?', a: 'Entrá al perfil del cliente y usá "Cargar Saldo" en cuenta corriente.' },
  ],
  '/configuracion': [
    { q: '¿Cómo cambio los precios?', a: 'Andá a la pestaña "Precios" y configurá reglas por horario, día y cancha.' },
  ],
  '/torneos': [
    { q: '¿Cómo genero el fixture?', a: 'En la pestaña "Partidos" de un torneo, seleccioná la categoría y clickeá "Generar Fixture".' },
  ],
}

const SHORTCUTS = [
  { key: 'N', desc: 'Nueva reserva' },
  { key: 'T', desc: 'Ir a hoy' },
  { key: 'K', desc: 'Abrir kiosco' },
  { key: 'R', desc: 'Reportes' },
  { key: 'L', desc: 'Copiar link público' },
  { key: 'H', desc: 'Ayuda' },
]

export function HelpPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'faqs' | 'shortcuts'>('faqs')

  const contextFaqs = Object.entries(CONTEXTUAL_FAQS).find(([path]) => pathname.startsWith(path))?.[1] || []
  const allFaqs = [...contextFaqs, ...GLOBAL_FAQS]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-card border-l border-border z-[101] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-foreground">Centro de Ayuda</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {pathname.includes('caja') ? 'Caja' : pathname.includes('clientes') ? 'Clientes' : 'General'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2 mx-4 mt-4 bg-muted/50 rounded-xl">
              <button
                onClick={() => setActiveTab('faqs')}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all',
                  activeTab === 'faqs' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
                )}
              >
                <Book size={14} className="inline mr-1.5" />
                Preguntas
              </button>
              <button
                onClick={() => setActiveTab('shortcuts')}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all hidden md:block',
                  activeTab === 'shortcuts' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
                )}
              >
                <Keyboard size={14} className="inline mr-1.5" />
                Atajos
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === 'faqs' ? (
                allFaqs.map((faq, i) => (
                  <div key={i} className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-2 hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-sm font-bold text-foreground">{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className={cn('shrink-0 text-muted-foreground transition-transform', expandedIdx === i && 'rotate-180')}
                      />
                    </button>
                    <div className={cn(
                      'overflow-hidden transition-all duration-200',
                      expandedIdx === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    )}>
                      <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  {SHORTCUTS.map((s) => (
                    <div key={s.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <span className="text-sm text-foreground font-medium">{s.desc}</span>
                      <kbd className="px-2.5 py-1 bg-card border border-border rounded-lg text-xs font-mono font-bold text-muted-foreground shadow-sm">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <a
                href="https://wa.me/5493524421497"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors"
              >
                <MessageCircle size={18} />
                Contactar Soporte
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
