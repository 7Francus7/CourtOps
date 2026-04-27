"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
       const { setTheme, theme, resolvedTheme } = useTheme()
       const [mounted, setMounted] = React.useState(false)

       React.useEffect(() => {
              setMounted(true)
       }, [])

       if (!mounted) {
              return (
                     <div className="w-9 h-9" aria-hidden="true" />
              )
       }

       const activeTheme = resolvedTheme ?? theme
       const nextTheme = activeTheme === "dark" ? "light" : "dark"

       return (
              <button
                     onClick={() => setTheme(nextTheme)}
                     className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card rounded-full transition-colors"
                     title={activeTheme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
              >
                     <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                     <Moon className="absolute top-2 left-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                     <span className="sr-only">Cambiar tema</span>
              </button>
       )
}
