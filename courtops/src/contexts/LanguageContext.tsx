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
              'performance': 'Rendimiento por Desempeño',
              // PlayersTab & BookingModal
              'payment_progress': 'Progreso de cobro',
              'configure_split': 'Configurar División',
              'players': 'Jugadores',
              'court_shared_kiosk': 'Cancha + Kiosco Compartido',
              'recalculate_splits': 'RECALCULAR DIVISIONES',
              'player_details': 'Detalles del Jugador',
              'save_names': 'Guardar Nombres',
              'player_name': 'Nombre del Jugador',
              'enter_name': 'Ingrese nombre...',
              'paid': 'PAGADO',
              'charge': 'COBRAR',
              'shared_rental': 'Alquiler Compartido',
              'individual_extras': 'Extras Individuales',
              'charge_to': 'Cobrar a',
              'select_payment_method': 'Selecciona el método de pago para registrar el cobro.',
              'cash': 'Efectivo',
              'mercadopago': 'Mercado Pago',
              'debit': 'Débito',
              'credit': 'Crédito',
              'error_processing_payment': 'Error al procesar cobro',
              'payment_registered': 'Cobro registrado a',
              'summary_payment': 'Resumen y Pago',
              'kiosk': 'Kiosco',
              'booking_status': 'Estado del Turno',
              'status': 'Estado',
              'free': 'SIN CARGO',
              'completed_status': 'COMPLETADO',
              'pending_status': 'PENDIENTE',
              'total': 'Total',
              'cancel_booking': 'CANCELAR TURNO',
              'close_window': 'CERRAR VENTANA',
              'payment_status': 'Estado de Pago',
              'remaining': 'restantes',
              'no_cost_booking': 'Esta reserva no tiene costo asociado (Gratis).',
              'client_owes': 'El cliente debe abonar el monto restante.',
              'fully_paid': '¡Todo al día! El turno está completamente pagado.',
              'open_match': 'Partido Abierto',
              'visible': 'VISIBLE',
              'hidden': 'OCULTO',
              'level': 'Nivel',
              'gender': 'Género',
              'update_data': 'Actualizar Datos',
              'consumption_details': 'Detalle del Consumo',
              'court_rental': 'Alquiler de Cancha',
              'for': 'Para',
              'general': 'General',
              'minutes': 'Minutos',
              'connection_error': 'Error de conexión',
              'payment_success': 'Pago registrado exitosamente',
              'invalid_amount': 'Ingrese un monto válido',
              'link_copied': 'Link copiado al portapapeles',
              'error_generating_link': 'Error al generar link',
              'confirm_cancel': '¿Estás seguro de que deseas cancelar este turno? Esta acción no se puede deshacer.',
              'booking_cancelled': 'Reserva cancelada exitosamente',
              'error_cancelling': 'Error al cancelar la reserva',
              // Kiosk
              'search_placeholder_kiosk': 'Buscar bebidas, snacks...',
              'assign_consumption': 'Asignar consumo a:',
              'everyone': 'CONSUMEN TODOS',
              'products_available': 'Productos Disponibles',
              'view_all': 'Ver todo',
              'current_consumptions': 'Consumos Actuales',
              'items_count': 'ITEMS',
              'kiosk_total': 'TOTAL KIOSCO',
              // Payment Actions
              'enter_valid_amount': 'Ingrese un monto válido',
              'payment_registered_success': 'Pago registrado exitosamente',
              'register_payment': 'Registrar Cobro',
              'charge_full_amount': 'COBRAR TOTAL',
              'partial_payment': 'Pago Parcial',
              'amount_placeholder': 'Monto',
              'transfer': 'Transferencia',
              'card': 'Tarjeta',
              // Header
              'pending_balance_alert': 'Saldo pendiente',
              'booking_today': 'Turno hoy',
              'booking_expired': 'Turno vencido',
              // Statuses
              'status_PENDING': 'Pendiente',
              'status_CONFIRMED': 'Confirmado',
              'status_PARTIAL_PAID': 'Pago Parcial',
              'status_PAID': 'Pagado',
              'status_IN_PROGRESS': 'En Progreso',
              'status_COMPLETED': 'Completado',
              'status_CANCELED': 'Cancelado',
       },
       en: {
              'dashboard': 'Dashboard',
              // ... (omitted content)
              'card': 'Card',
              // Header
              'pending_balance_alert': 'Pending Balance',
              'booking_today': 'Booking Today',
              'booking_expired': 'Booking Expired',
              // Statuses
              'status_PENDING': 'Pending',
              'status_CONFIRMED': 'Confirmed',
              'status_PARTIAL_PAID': 'Partially Paid',
              'status_PAID': 'Paid',
              'status_IN_PROGRESS': 'In Progress',
              'status_COMPLETED': 'Completed',
              'status_CANCELED': 'Cancelled',
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
