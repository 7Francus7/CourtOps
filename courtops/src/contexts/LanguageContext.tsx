'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'es' | 'en'

type Translations = {
       [key in Language]: {
              [key: string]: string
       }
}

const translations: Translations = {
       es: {
              'dashboard': 'Dashboard',
              'search_placeholder': 'Buscar algo...',
              'new_client': 'Nuevo Cliente',
              'quick_sale': 'Venta Rápida',
              'reports': 'Reportes',
              'tournaments': 'Torneos y Ligas',
              'tournaments_desc': 'Gestiona campeonatos, zonas, fixtures y resultados.',
              'create_tournament': 'Crear Torneo',
              'no_tournaments': 'No tienes torneos activos',
              'no_tournaments_desc': 'Crea tu primer torneo para empezar a gestionar inscripciones y partidos.',
              'draft': 'Borrador',
              'active': 'En Curso',
              'completed': 'Finalizado',
              'manage_tournament': 'Gestionar Torneo',
              'categories': 'Categ.',
              'teams': 'Equipos',
              'matches': 'Partidos',
              'revenue_by_category': 'Ingresos por Categoría',
              'occupancy_by_court': 'Ocupación por Cancha',
              'total_income': 'Ingresos Totales',
              'avg_occupancy': 'Ocupación Media',
              'avg_ticket': 'Ticket Promedio',
              'new_clients': 'Nuevos Clientes',
              'export': 'Exportar',
              'day': 'Hoy',
              'week': 'Semana',
              'month': 'Mes',
              'year': 'Año',
              'client_of_month': 'Cliente del Mes',
              'performance': 'Rendimiento por Desempeño'
       },
       en: {
              'dashboard': 'Dashboard',
              'search_placeholder': 'Search something...',
              'new_client': 'New Client',
              'quick_sale': 'Quick Sale',
              'reports': 'Reports',
              'tournaments': 'Tournaments & Leagues',
              'tournaments_desc': 'Manage championships, zones, fixtures and results.',
              'create_tournament': 'Create Tournament',
              'no_tournaments': 'No active tournaments',
              'no_tournaments_desc': 'Create your first tournament to start managing registrations and matches.',
              'draft': 'Draft',
              'active': 'Active',
              'completed': 'Completed',
              'manage_tournament': 'Manage Tournament',
              'categories': 'Categs.',
              'teams': 'Teams',
              'matches': 'Matches',
              'revenue_by_category': 'Revenue by Category',
              'occupancy_by_court': 'Occupancy by Court',
              'total_income': 'Total Revenue',
              'avg_occupancy': 'Avg Occupancy',
              'avg_ticket': 'Avg Ticket',
              'new_clients': 'New Clients',
              'export': 'Export',
              'day': 'Today',
              'week': 'Week',
              'month': 'Month',
              'year': 'Year',
              'client_of_month': 'Client of the Month',
              'performance': 'Performance'
       }
}

interface LanguageContextType {
       language: Language
       setLanguage: (lang: Language) => void
       t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
       const [language, setLanguage] = useState<Language>('es')

       useEffect(() => {
              const saved = localStorage.getItem('language') as Language
              if (saved) setLanguage(saved)
       }, [])

       const handleSetLanguage = (lang: Language) => {
              setLanguage(lang)
              localStorage.setItem('language', lang)
       }

       const t = (key: string) => {
              return translations[language][key] || key
       }

       return (
              <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
                     {children}
              </LanguageContext.Provider>
       )
}

export const useLanguage = () => {
       const context = useContext(LanguageContext)
       if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
       return context
}
