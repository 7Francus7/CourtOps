'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Mail, Lock, KeyRound, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { requestPasswordReset, resetPassword } from '@/actions/auth/forgot-password'

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  return token ? <ResetForm token={token} /> : <RequestForm />
}

function RequestForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await requestPasswordReset(email)
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6 transition-colors duration-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-sm"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Volver al login
        </Link>

        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-6">
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Recuperar contraseña</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center"
          >
            <CheckCircle className="text-emerald-500 mx-auto mb-3" size={32} />
            <h3 className="font-bold text-foreground mb-1">Email enviado</h3>
            <p className="text-sm text-muted-foreground">
              Si el email está registrado, recibirás un enlace para restablecer tu contraseña. Revisá tu bandeja de entrada y spam.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-foreground text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 font-medium"
                  placeholder="admin@tuclub.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const result = await resetPassword(token, password)
    setLoading(false)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Error al restablecer la contraseña.')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6 transition-colors duration-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-6">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Nueva contraseña</h1>
          <p className="text-muted-foreground text-sm mt-2">Ingresá tu nueva contraseña.</p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
              <CheckCircle className="text-emerald-500 mx-auto mb-3" size={32} />
              <h3 className="font-bold text-foreground mb-1">Contraseña actualizada</h3>
              <p className="text-sm text-muted-foreground">Ya podés iniciar sesión con tu nueva contraseña.</p>
            </div>
            <Link
              href="/login?reset=true"
              className="block w-full py-4 px-6 rounded-xl font-bold text-sm text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all"
            >
              Ir al Login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-foreground text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 font-medium"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-foreground text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 font-medium"
                  placeholder="Repetí tu contraseña"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-semibold px-1"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Restablecer Contraseña'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
