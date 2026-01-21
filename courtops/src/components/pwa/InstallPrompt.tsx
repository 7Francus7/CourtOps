"use client"
import { useEffect, useState } from "react"
import { Download } from "lucide-react"

export function InstallPrompt() {
       const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
       const [show, setShow] = useState(false)

       useEffect(() => {
              const handler = (e: any) => {
                     // Prevent the mini-infobar from appearing on mobile
                     e.preventDefault()
                     // Stash the event so it can be triggered later.
                     setDeferredPrompt(e)
                     // Update UI notify the user they can install the PWA
                     setShow(true)
              }
              window.addEventListener("beforeinstallprompt", handler)
              return () => window.removeEventListener("beforeinstallprompt", handler)
       }, [])

       const handleInstall = async () => {
              if (!deferredPrompt) return
              // Show the install prompt
              deferredPrompt.prompt()
              // Wait for the user to respond to the prompt
              const { outcome } = await deferredPrompt.userChoice
              // We've used the prompt, and can't use it again, throw it away
              setDeferredPrompt(null)
              if (outcome === "accepted") {
                     setShow(false)
              }
       }

       if (!show) return null

       return (
              <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
                     <div className="bg-[#18181B] border border-white/10 rounded-xl p-4 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md bg-opacity-90">
                            <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                          <Download size={20} />
                                   </div>
                                   <div>
                                          <h4 className="text-white font-bold text-sm">Instalar App</h4>
                                          <p className="text-zinc-400 text-xs text-balance">Agrega CourtOps a tu inicio para una mejor experiencia.</p>
                                   </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                   <button
                                          onClick={() => setShow(false)}
                                          className="text-zinc-500 hover:text-white px-3 py-2 text-xs font-bold transition-colors"
                                   >
                                          AHORA NO
                                   </button>
                                   <button
                                          onClick={handleInstall}
                                          className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg"
                                   >
                                          INSTALAR
                                   </button>
                            </div>
                     </div>
              </div>
       )
}
