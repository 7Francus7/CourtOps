'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { verifyEmployeePin, EmployeePermissions } from '@/actions/employees'
import { toast } from 'sonner'

interface Employee {
       id: string
       name: string
       permissions: EmployeePermissions
}

interface EmployeeContextType {
       activeEmployee: Employee | null
       loginEmployee: (pin: string) => Promise<boolean>
       logoutEmployee: () => void
       isLocked: boolean
       lockTerminal: () => void
       unlockTerminal: (pin: string) => Promise<boolean>
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined)

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
       const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
       const [isLocked, setIsLocked] = useState(false)

       // Persist locking state if needed, or active employee?
       // Ideally, if page refreshes, we might lose this state. For security, maybe good to revert to lock or revert to main user?
       // Let's keep it simple: memory state.

       const loginEmployee = async (pin: string) => {
              try {
                     const res = await verifyEmployeePin(pin)
                     if (res.success && res.employee) {
                            setActiveEmployee(res.employee)
                            setIsLocked(false)
                            toast.success(`Bienvenido, ${res.employee.name}`)
                            return true
                     } else {
                            toast.error('PIN Incorrecto')
                            return false
                     }
              } catch (error) {
                     toast.error('Error verificando PIN')
                     return false
              }
       }

       const logoutEmployee = () => {
              setActiveEmployee(null)
              toast.info('Sesión de empleado finalizada')
       }

       const lockTerminal = () => {
              setIsLocked(true)
              setActiveEmployee(null) // Clear active employee when locking? Or just lock?
              // Usually lock means we go back to PIN screen.
       }

       const unlockTerminal = async (pin: string) => {
              // This could be used for the main user to unlock too, but for now we rely on employee pins.
              // If the main user wants to unlock, maybe they have a master pin or just use their password?
              // Actually, if we are "in the general profile", the main user is already authenticated via Cookie.
              // So "Locking" here effectively puts a curtain over the UI until a PIN is entered.
              // If a PIN is entered, we determine WHO it is.

              return await loginEmployee(pin)
       }

       return (
              <EmployeeContext.Provider value={{ activeEmployee, loginEmployee, logoutEmployee, isLocked, lockTerminal, unlockTerminal }}>
                     {children}
                     {isLocked && <LockScreen onUnlock={unlockTerminal} />}
              </EmployeeContext.Provider>
       )
}

export function useEmployee() {
       const context = useContext(EmployeeContext)
       if (context === undefined) {
              throw new Error('useEmployee must be used within an EmployeeProvider')
       }
       return context
}

// Internal Lock Screen Component
function LockScreen({ onUnlock }: { onUnlock: (pin: string) => Promise<boolean> }) {
       const [pin, setPin] = useState('')
       const [loading, setLoading] = useState(false)
       const [error, setError] = useState(false)

       const handleSubmit = async (e?: React.FormEvent) => {
              if (e) e.preventDefault()
              if (pin.length < 4) return

              setLoading(true)
              setError(false)
              const success = await onUnlock(pin)
              setLoading(false)
              if (!success) {
                     setError(true)
                     setPin('')
              }
       }

       // Auto submit on 4 chars?
       // Maybe wait for enter or 4/6 chars.

       return (
              <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                     <div className="w-full max-w-sm flex flex-col items-center animate-in zoom-in-95 duration-300">

                            <div className="mb-8 text-center">
                                   <div className="w-20 h-20 bg-brand-blue rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] animate-pulse">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                          </svg>
                                   </div>
                                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Terminal Bloqueada</h2>
                                   <p className="text-zinc-500 text-sm mt-2">Ingresa tu PIN de empleado para continuar</p>
                            </div>

                            <form onSubmit={handleSubmit} className="w-full relative">
                                   <input
                                          type="password"
                                          autoFocus
                                          className={`w-full bg-zinc-900/50 border-2 ${error ? 'border-red-500 text-red-500 animate-shake' : 'border-zinc-800 focus:border-brand-blue text-white'} rounded-2xl px-6 py-4 text-center text-3xl font-bold tracking-[1em] outline-none transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder:text-zinc-600`}
                                          placeholder="PIN"
                                          maxLength={8}
                                          value={pin}
                                          onChange={(e) => setPin(e.target.value)}
                                   />

                                   {error && <p className="text-red-500 text-xs font-bold text-center mt-3 uppercase tracking-wider animate-in fade-in">PIN Incorrecto</p>}

                                   <button
                                          type="submit"
                                          disabled={loading || pin.length < 4}
                                          className="w-full mt-6 bg-brand-blue hover:brightness-110 text-black font-black py-4 rounded-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                   >
                                          {loading ? 'Verificando...' : 'Desbloquear'}
                                   </button>
                            </form>

                            <button onClick={() => window.location.href = '/login'} className="mt-8 text-zinc-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                                   Cerrar Sesión Principal
                            </button>
                     </div>
              </div>
       )
}
