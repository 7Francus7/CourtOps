'use server'

import prisma from '@/lib/db'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function requestPasswordReset(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    if (!normalizedEmail) return { success: true } // prevent enumeration

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (user) {
      // Invalidate old tokens
      await prisma.passwordResetToken.updateMany({
        where: { email: normalizedEmail, used: false },
        data: { used: true },
      })

      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: { email: normalizedEmail, token, expiresAt },
      })

      await sendPasswordResetEmail(normalizedEmail, token, user.name || 'Usuario')
    }

    // Always return success to prevent email enumeration
    return { success: true }
  } catch (error) {
    console.error('[FORGOT_PASSWORD] Error:', error)
    return { success: true } // still return success to prevent enumeration
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!token || !newPassword || newPassword.length < 6) {
      return { success: false, error: 'Contraseña debe tener al menos 6 caracteres.' }
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return { success: false, error: 'El enlace ha expirado o ya fue utilizado. Solicitá uno nuevo.' }
    }

    const hashedPassword = await hash(newPassword, 12)

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    return { success: true }
  } catch (error) {
    console.error('[RESET_PASSWORD] Error:', error)
    return { success: false, error: 'Error al restablecer la contraseña. Intentá de nuevo.' }
  }
}
