'use client'

import { Bell, ArrowLeft, Moon, Sun } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationsSheet from '@/components/NotificationsSheet'
import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/contexts/LanguageContext'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'

export function Header({ title, backHref, minimal = false }: { title?: string; backHref?: string; minimal?: boolean }) {
  const { notifications, unreadCount, markAllAsRead, loading: notificationsLoading } = useNotifications()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <>
      <header className="min-h-14 md:min-h-[60px] flex items-center justify-between px-4 md:px-6 bg-card/90 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40 shrink-0 pt-[env(safe-area-inset-top)]">
        {/* Left: breadcrumbs / back / title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 shrink-0"
              aria-label="Volver"
            >
              <ArrowLeft size={15} strokeWidth={2} />
            </Link>
          )}
          <div className="min-w-0">
            <div className="hidden md:block">
              <Breadcrumbs />
            </div>
            <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.01em] truncate md:hidden">
              {title || t('dashboard')}
            </h2>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          {!minimal && (
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="hidden sm:flex w-8 h-8 items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 rounded-xl transition-all duration-150 font-bold text-[11px] tracking-wider"
              aria-label="Cambiar idioma"
            >
              {language.toUpperCase()}
            </button>
          )}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="md:hidden w-8 h-8 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 rounded-xl transition-all duration-150"
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative w-8 h-8 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 rounded-xl transition-all duration-150"
            aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount})` : 'Notificaciones'}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-primary rounded-full ring-[1.5px] ring-card animate-pulse" />
            )}
          </button>
        </div>
      </header>

      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllAsRead}
        isLoading={notificationsLoading}
      />
    </>
  )
}
