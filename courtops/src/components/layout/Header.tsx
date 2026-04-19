'use client'

import { Bell, Search, ArrowLeft, Moon, Sun } from 'lucide-react'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationsSheet from '@/components/NotificationsSheet'
import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/contexts/LanguageContext'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { useSession } from 'next-auth/react'

export function Header({ title, backHref, minimal = false }: { title?: string; backHref?: string; minimal?: boolean }) {
  const { data: session } = useSession()
  const { activeEmployee } = useEmployee()
  const { notifications, unreadCount, markAllAsRead, loading: notificationsLoading } = useNotifications()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <>
      <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-card border-b border-border sticky top-0 z-40 shrink-0">
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

        {/* Center: search (desktop) */}
        {!minimal && (
          <div className="hidden lg:flex flex-1 max-w-xs mx-6">
            <div
              className="relative w-full cursor-pointer group"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                readOnly
                aria-label="Buscar"
                className="w-full pl-9 pr-20 py-1.5 bg-muted/60 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none cursor-pointer"
                placeholder="Buscar..."
                type="text"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 border border-border rounded bg-background text-[10px] font-bold text-muted-foreground/60 select-none">
                Ctrl+K
              </kbd>
            </div>
          </div>
        )}

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!minimal && (
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label="Buscar"
            >
              <Search size={17} />
            </button>
          )}

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
            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
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
