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
              <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4">

                     <div className="w-full max-w-md space-y-8">
                            {/* Logo & Brand */}
                            <div className="text-center space-y-2">
                                   <h1 className="text-4xl font-black text-white tracking-tighter">
                                          COURT<span className="text-brand-blue">OPS</span>
                                   </h1>
                                   <p className="text-text-grey text-sm font-medium">Gestión de Clubes Deportivos</p>
                            </div>

                            {/* Login Form */}
                            <div className="bg-bg-card border border-white/5 rounded-2xl p-8 shadow-2xl">
                                   <form onSubmit={handleSubmit} className="space-y-6">

                                          <div className="space-y-2">
                                                 <label className="text-xs font-bold text-text-grey uppercase tracking-wider">Email</label>
                                                 <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        className="w-full bg-bg-dark border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-white/20"
                                                        placeholder="tu@email.com"
                                                 />
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-xs font-bold text-text-grey uppercase tracking-wider">Contraseña</label>
                                                 <input
                                                        type="password"
                                                        required
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        className="w-full bg-bg-dark border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-white/20"
                                                        placeholder="••••••••"
                                                 />
                                          </div>

                                          {error && (
                                                 <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-bold text-center">
                                                        {error}
                                                 </div>
                                          )}

                                          <button
                                                 type="submit"
                                                 disabled={isLoading}
                                                 className="w-full bg-brand-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-blue-secondary transition-all shadow-lg shadow-brand-blue/20 active:scale-95 disabled:opacity-50"
                                          >
                                                 {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                                          </button>
                                   </form>
                            </div>

                            <div className="text-center space-y-4">
                                   <p className="text-text-grey text-xs">
                                          ¿No tienes una cuenta?
                                   </p>
                                   <a
                                          href="https://wa.me/5493524421497?text=Hola,%20me%20gustaría%20obtener%20una%20demo%20de%20CourtOps"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 text-brand-blue font-bold hover:text-brand-blue-secondary transition-colors"
                                   >
                                          <span>Solicitar Demo / Contactar Ventas</span>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                                   </a>
                            </div>

                     </div>
              </div>
       )
}
