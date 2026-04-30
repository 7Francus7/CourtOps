"use client"
import { useEffect, useState } from "react"
import { Download } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
       prompt: () => Promise<void>
       userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type NavigatorWithStandalone = Navigator & {
       standalone?: boolean
}

export function InstallPrompt() {
       const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
       const [show, setShow] = useState(false)
       const [isIOS, setIsIOS] = useState(false)
       const [isStandalone, setIsStandalone] = useState(false)

       useEffect(() => {
              // Check if previously dismissed
              const isDismissed = localStorage.getItem('app_install_prompt_dismissed')
              if (isDismissed) return

              // Check if standalone
              const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as NavigatorWithStandalone).standalone) || document.referrer.includes('android-app://');
              setIsStandalone(isInStandaloneMode)

              // Check if iOS
              const userAgent = window.navigator.userAgent.toLowerCase();
              const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
              setIsIOS(isIosDevice)

              // Android / Desktop automatic prompt
              const handler = (e: Event) => {
                     e.preventDefault()
                     setDeferredPrompt(e as BeforeInstallPromptEvent)
                     if (!isInStandaloneMode) {
                            setShow(true)
                     }
              }
              window.addEventListener("beforeinstallprompt", handler)

              // iOS Manual Prompt (show after a small delay if not standalone)
              if (isIosDevice && !isInStandaloneMode) {
                     const timer = setTimeout(() => setShow(true), 2000)
                     return () => clearTimeout(timer)
              }

              return () => window.removeEventListener("beforeinstallprompt", handler)
       }, [])

       const handleInstall = async () => {
              if (!deferredPrompt) return
              deferredPrompt.prompt()
              const { outcome } = await deferredPrompt.userChoice
              setDeferredPrompt(null)
              if (outcome === "accepted") {
                     setShow(false)
              }
       }

       if (!show || isStandalone) return null

       return (
              <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+6.25rem)] left-4 right-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500 md:bottom-4 md:left-auto md:right-4">
                     <div className="mx-auto flex max-w-md flex-col items-start justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-[#18181B]/92 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white shrink-0 shadow-sm">
                                          <Download size={20} />
                                   </div>
                                   <div>
                                          <h4 className="text-white font-black text-sm">Usar como app</h4>
                                          <p className="text-zinc-400 text-xs text-balance">
                                                 {isIOS
                                                        ? "En iPhone: Compartir y luego Agregar a inicio."
                                                        : "Agregá CourtOps al inicio para entrar más rápido."}
                                          </p>
                                   </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                   <button
                                          onClick={() => {
                                                 setShow(false)
                                                 localStorage.setItem('app_install_prompt_dismissed', 'true')
                                          }}
                                          className="text-zinc-500 hover:text-white px-3 py-2 text-xs font-black transition-colors"
                                   >
                                          {isIOS ? "ENTENDIDO" : "AHORA NO"}
                                   </button>
                                   {!isIOS && (
                                          <button
                                                 onClick={handleInstall}
                                                 className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-xl text-xs font-black transition-colors shadow-lg"
                                          >
                                                 INSTALAR
                                          </button>
                                   )}
                            </div>
                     </div>
              </div>
       )
}
