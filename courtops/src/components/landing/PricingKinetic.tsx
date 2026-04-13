'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const planes = [
  {
    id: 'basico',
    nombre: 'Básico',
    subtitulo: 'Para canchas en consolidación.',
    precio: 45000,
    precioAnual: 36000,
    funciones: [
      'Gestión de hasta 4 pistas',
      'Reservas y Grilla Visiva Ilimitada',
      'Control de Caja Básico',
    ],
    cta: 'Inicializar Básico',
    url: '/register?plan=basico',
    destacado: false,
  },
  {
    id: 'elite',
    nombre: 'Élite',
    subtitulo: 'Dominio operacional total.',
    precio: 85000,
    precioAnual: 68000,
    funciones: [
      'Pistas Ilimitadas y Torneos',
      'POS de Extrema Densidad (Kiosco)',
      'Recordatorios Bot WhatsApp',
      'Cobros Online Integrados',
    ],
    cta: 'Seleccionar Élite',
    url: '/register?plan=elite',
    destacado: true,
  },
  {
    id: 'pro',
    nombre: 'Pro',
    subtitulo: 'Control dictatorial multi-sucursal.',
    precio: 150000,
    precioAnual: 120000,
    funciones: [
      'Despliegue Multi-Instalación',
      'Módulo de Instructores/Academias',
      'Marca Blanca Premium',
      'Soporte Táctico 24/7',
    ],
    cta: 'Solicitar Reunión',
    url: 'mailto:ventas@courtops.net',
    destacado: false,
  },
]

export default function PricingKinetic() {
  const [esAnual, setEsAnual] = useState(false)

  const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n)

  return (
    <section id="pricing" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">Planes de Mando</h2>
        <p className="text-xl text-zinc-600 dark:text-zinc-500 italic font-serif mb-8">Inversión calculada en tu soberanía operativa.</p>
        
        {/* Toggle Facturación */}
        <div className="inline-flex items-center p-1 rounded-full bg-zinc-100 dark:bg-[#19191c] border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setEsAnual(false)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              !esAnual
                ? 'bg-white dark:bg-[#262528] text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Ataque Mensual
          </button>
          <button
            onClick={() => setEsAnual(true)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
              esAnual
                ? 'bg-white dark:bg-[#262528] text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Planta Anual 
            <span className="text-xs text-green-600 dark:text-[#72ff70] font-black uppercase tracking-widest">(Ahorra 20%)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {planes.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-10 flex flex-col h-full transition-all duration-300 ${
              plan.destacado
                ? 'bg-zinc-900 dark:bg-[#262528] border-2 border-green-500 dark:border-[#72ff70] transform lg:-translate-y-4 shadow-2xl z-10 relative'
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
            {plan.id !== 'pro' && (
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
