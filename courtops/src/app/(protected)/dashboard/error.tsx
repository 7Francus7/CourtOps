'use client'

import { useEffect } from 'react'

export default function Error({
       error,
       reset,
}: {
       error: Error & { digest?: string }
       reset: () => void
}) {
       useEffect(() => {
              // Log the error to an error reporting service
              console.error('Dashboard Error Boundary Caught:', error)
       }, [error])

       return (
              <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 p-4 text-center">
                     <div className="rounded-xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800 max-w-md w-full">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                                   <svg
                                          className="h-8 w-8 text-red-500"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                   >
                                          <path
                                                 strokeLinecap="round"
                                                 strokeLinejoin="round"
                                                 strokeWidth={2}
                                                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                          />
                                   </svg>
                            </div>

                            <h2 className="mb-2 text-xl font-bold text-white">
                                   Algo salió mal
                            </h2>

                            <p className="mb-6 text-sm text-zinc-400">
                                   Ocurrió un error inesperado al cargar el panel.
                            </p>

                            {error.digest && (
                                   <div className="mb-6 rounded bg-zinc-950 p-3 text-left">
                                          <p className="text-xs font-mono text-zinc-500 break-all">Digest: {error.digest}</p>
                                   </div>
                            )}

                            <div className="flex flex-col gap-3">
                                   <button
                                          onClick={() => reset()}
                                          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
                                   >
                                          Intentar nuevamente
                                   </button>
                                   <button
                                          onClick={() => window.location.reload()}
                                          className="w-full rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
                                   >
                                          Recargar página
                                   </button>
                            </div>
                     </div>
              </div>
       )
}
