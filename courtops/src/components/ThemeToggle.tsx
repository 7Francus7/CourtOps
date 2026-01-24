"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
       const { setTheme, theme } = useTheme()

       return (
              <button
                     onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                     className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark rounded-full transition-colors"
                     title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
              >
                     <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                     <Moon className="absolute top-2 left-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                     <span className="sr-only">Cambiar tema</span>
              </button>
       )
}
