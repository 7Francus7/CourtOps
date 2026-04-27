'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const planes = [
  {
    id: 'arranque',
    nombre: 'Arranque',
    subtitulo: 'Para clubes que quieren ordenar reservas y operar prolijos desde el día uno.',
    precio: 45000,
    precioAnual: 36000,
    licencia: 100000,
    funciones: [
      'Hasta 2 canchas de padel',
      'Hasta 3 empleados en el sistema',
      'Reservas online (link público)',
      'Turnero digital en tiempo real',
      'Caja diaria (apertura y cierre)',
      'QR Check-in',
      'Soporte por email L-V',
    ],
    cta: 'Empezar Arranque',
    url: '/register?plan=arranque',
    destacado: false,
  },
  {
    id: 'elite',
    nombre: 'Élite',
    subtitulo: 'Para clubes en crecimiento que quieren vender, cobrar y automatizar más.',
    precio: 89000,
    precioAnual: 71200,
    licencia: 100000,
    funciones: [
      'Hasta 8 canchas de padel',
      'Hasta 10 empleados en el sistema',
      'Todo lo del plan Arranque',
      'Kiosco / Punto de venta con stock',
      'Pagos online con MercadoPago',
      'Notificaciones WhatsApp automáticas',
      'Gestión de torneos y brackets',
      'Waivers digitales (firma electrónica)',
      'Reportes financieros avanzados',
      'Soporte prioritario WhatsApp 24/7',
    ],
    cta: 'Elegir Élite',
    url: '/register?plan=elite',
    destacado: true,
  },
  {
    id: 'vip',
    nombre: 'VIP',
    subtitulo: 'Para complejos que necesitan flexibilidad total y atención dedicada.',
    precio: 129000,
    precioAnual: 103200,
    licencia: 100000,
    funciones: [
      'Canchas ilimitadas',
      'Usuarios ilimitados',
      'Todo lo del plan Élite',
      'Dominio personalizado (ej: tuclub.com)',
      'Gestor de cuenta dedicado',
    ],
    cta: 'Solicitar reunión',
    url: 'mailto:ventas@courtops.net',
    destacado: false,
  },
]

export default function PricingKinetic() {
  const [esAnual, setEsAnual] = useState(false)

  const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n)

  return (
    <section id="pricing" className="py-16 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">Planes simples</h2>
        <p className="text-xl text-zinc-600 dark:text-zinc-500 italic font-serif mb-8">Empezá con prueba gratis y escalá cuando el club lo necesite.</p>

        <div className="inline-flex items-center p-1 rounded-full bg-zinc-100 dark:bg-[#19191c] border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setEsAnual(false)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              !esAnual
                ? 'bg-white dark:bg-[#262528] text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setEsAnual(true)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
              esAnual
                ? 'bg-white dark:bg-[#262528] text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Anual
            <span className="text-xs text-green-600 dark:text-[#72ff70] font-black uppercase tracking-widest">(Ahorra 20%)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {planes.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-7 md:p-10 flex flex-col h-full transition-all duration-300 ${plan.id === 'vip' ? 'md:col-start-1 lg:col-start-auto' : ''} ${
              plan.destacado
                ? 'bg-zinc-900 dark:bg-[#262528] border-2 border-green-500 dark:border-[#72ff70] lg:-translate-y-4 shadow-2xl z-10 relative'
                : 'bg-white dark:bg-[#1f1f22] border border-zinc-200 dark:border-zinc-800/50 shadow-lg'
            }`}
          >
            {plan.destacado && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white dark:bg-[#72ff70] dark:text-[#006012] px-6 py-2 text-sm font-black uppercase tracking-widest rounded-full shadow-lg">
                Recomendado
              </div>
            )}

            <h3 className={`text-3xl font-bold mb-3 ${plan.destacado ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
              {plan.nombre}
            </h3>
            <p className={`text-base mb-10 ${plan.destacado ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {plan.subtitulo}
            </p>

            <div className={`text-5xl font-bold mb-10 tracking-tighter flex items-end gap-2 ${plan.destacado ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
              <div className="relative">
                 ${fmt(esAnual ? plan.precioAnual : plan.precio)}
              </div>
              <span className={`text-xl font-normal mb-1 ${plan.destacado ? 'text-zinc-400' : 'text-zinc-500'}`}>/mes</span>
            </div>
            <p className={`text-sm -mt-6 mb-8 ${plan.destacado ? 'text-zinc-400' : 'text-zinc-500'}`}>
              + ${fmt(plan.licencia)} licencia única al inicio
            </p>

            <ul className={`space-y-5 mb-14 flex-grow ${plan.destacado ? 'text-white' : ''}`}>
              {plan.funciones.map((f, i) => (
                <li key={i} className={`flex items-start gap-4 text-lg ${plan.destacado ? '' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`mt-1 flex-shrink-0 ${plan.destacado ? 'text-green-400 dark:text-[#72ff70]' : 'text-green-600 dark:text-[#72ff70]'}`}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className="leading-tight">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.url}
              className={`w-full py-5 block text-center rounded-xl font-bold text-lg transition-all ${
                plan.destacado
                  ? 'bg-green-500 text-white dark:bg-[#72ff70] dark:text-[#006012] hover:bg-green-600 dark:hover:shadow-[0_0_20px_rgba(114,255,112,0.3)]'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-[#262528] dark:border dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800'
              }`}
            >
              {plan.cta}
            </Link>
            {plan.id !== 'vip' && (
              <p className={`text-center text-sm mt-4 ${plan.destacado ? 'text-zinc-400' : 'text-zinc-500'}`}>
                7 días de prueba gratuita · Sin tarjeta de crédito
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
