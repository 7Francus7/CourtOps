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
      <header className="min-h-14 md:min-h-16 flex items-center justify-between px-4 md:px-6 bg-card border-b border-border sticky top-0 z-40 shrink-0 pt-[env(safe-area-inset-top)]">
        {/* Left: breadcrumbs / back / title */}
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              aria-label="Volver"
            >
              <ArrowLeft size={16} />
            </Link>
          )}
          <div className="min-w-0">
            <div className="hidden md:block">
              <Breadcrumbs />
            </div>
            <h2 className="text-base font-semibold text-foreground tracking-tight truncate md:hidden">
              {title || t('dashboard')}
            </h2>
          </div>
        </div>

        {/* Center: spacer */}
        <div className="flex-1" />

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!minimal && (
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="hidden sm:flex w-9 h-9 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors font-bold text-[11px]"
              aria-label={`Cambiar idioma`}
            >
              {language.toUpperCase()}
            </button>
          )}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="md:hidden w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount})` : 'Notificaciones'}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-1 ring-card" />
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
