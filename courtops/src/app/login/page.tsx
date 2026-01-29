'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
       const router = useRouter()
       const [email, setEmail] = useState('')
       const [password, setPassword] = useState('')
       const [error, setError] = useState('')
       const [isLoading, setIsLoading] = useState(false)

       async function handleSubmit(e: React.FormEvent) {
              e.preventDefault()
              setIsLoading(true)
              setError('')

              const result = await signIn('credentials', {
                     redirect: false,
                     email,
                     password
              })

              if (result?.error) {
                     setError('Credenciales inválidas. Intente nuevamente.')
                     setIsLoading(false)
              } else {
                     router.push('/')
                     router.refresh()
              }
       }

       return (
              <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 transition-colors duration-300">

                     <div className="w-full max-w-md space-y-8">
                            {/* Logo & Brand */}
                            <div className="text-center space-y-2">
                                   <div className="flex justify-center mb-4">
                                          {/* Icon or Logo placeholder if needed */}
                                   </div>
                                   <h1 className="text-4xl font-black text-foreground tracking-tighter">
                                          COURT<span className="text-primary">OPS</span>
                                   </h1>
                                   <p className="text-muted-foreground text-sm font-medium">Gestión de Clubes Deportivos</p>
                            </div>

                            {/* Login Form */}
                            <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                   <form onSubmit={handleSubmit} className="space-y-6">

                                          <div className="space-y-2">
                                                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                                                 <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        className="w-full bg-secondary/50 border border-input rounded-xl p-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                                        placeholder="tu@email.com"
                                                 />
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contraseña</label>
                                                 <input
                                                        type="password"
                                                        required
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        className="w-full bg-secondary/50 border border-input rounded-xl p-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                                        placeholder="••••••••"
                                                 />
                                          </div>

                                          {error && (
                                                 <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm font-bold text-center animate-in fade-in">
                                                        {error}
                                                 </div>
                                          )}

                                          <button
                                                 type="submit"
                                                 disabled={isLoading}
                                                 className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                          >
                                                 {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                                          </button>
                                   </form>
                            </div>

                            <div className="text-center">
                                   <p className="text-muted-foreground text-xs">
                                          ¿No tienes una cuenta? <a href="/register" className="text-primary hover:underline font-bold">Registra tu Club Gratis</a>
                                   </p>
                            </div>

                     </div>
              </div>
       )
}
