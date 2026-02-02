'use client'

import { Component, ReactNode } from 'react'

interface Props {
       children: ReactNode
}

interface State {
       hasError: boolean
       error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
       constructor(props: Props) {
              super(props)
              this.state = { hasError: false }
       }

       static getDerivedStateFromError(error: Error): State {
              return { hasError: true, error }
       }

       componentDidCatch(error: Error, errorInfo: any) {
              console.error('[ErrorBoundary] Caught error:', error, errorInfo)
       }

       render() {
              if (this.state.hasError) {
                     return (
                            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-500/5 border-2 border-dashed border-red-500/20 rounded-3xl m-6">
                                   <div className="bg-red-500/10 p-6 rounded-full mb-4">
                                          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                          </svg>
                                   </div>
                                   <h3 className="text-xl font-bold text-red-500 mb-2">
                                          Error al cargar el Turnero
                                   </h3>
                                   <p className="text-sm text-muted-foreground max-w-md mb-6">
                                          Hubo un problema al cargar el calendario de reservas. Puedes seguir usando el resto del sistema normalmente.
                                   </p>
                                   <div className="flex gap-3">
                                          <button
                                                 onClick={() => window.location.reload()}
                                                 className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
                                          >
                                                 Recargar Página
                                          </button>
                                          <a
                                                 href="/reservas"
                                                 className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-bold transition-colors"
                                          >
                                                 Ver Lista de Reservas
                                          </a>
                                   </div>
                                   {this.state.error && (
                                          <details className="mt-6 text-left max-w-lg">
                                                 <summary className="cursor-pointer text-xs text-red-400 hover:text-red-300 font-mono">
                                                        Detalles técnicos
                                                 </summary>
                                                 <pre className="mt-2 p-4 bg-black/50 rounded-lg text-xs text-red-300 overflow-auto">
                                                        {this.state.error.message}
                                                        {'\n\n'}
                                                        {this.state.error.stack}
                                                 </pre>
                                          </details>
                                   )}
                            </div>
                     )
              }

              return this.props.children
       }
}
