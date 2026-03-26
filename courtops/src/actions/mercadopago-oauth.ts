'use server'

import prisma from '@/lib/db'
import { encrypt } from '@/lib/encryption'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

const MP_APP_ID = process.env.MP_APP_ID
const MP_APP_SECRET = process.env.MP_APP_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Generate the MercadoPago OAuth authorization URL.
 * The club admin clicks this to authorize CourtOps to access their MP account.
 */
export async function getMPOAuthUrl() {
       const clubId = await getCurrentClubId()

       if (!MP_APP_ID) {
              return { success: false, error: 'MP_APP_ID no configurado en el servidor.' }
       }

       const redirectUri = `${APP_URL}/api/mercadopago/oauth/callback`

       // state = clubId (used to identify which club is connecting)
       const authUrl = new URL('https://auth.mercadopago.com.ar/authorization')
       authUrl.searchParams.set('client_id', MP_APP_ID)
       authUrl.searchParams.set('response_type', 'code')
       authUrl.searchParams.set('platform_id', 'mp')
       authUrl.searchParams.set('redirect_uri', redirectUri)
       authUrl.searchParams.set('state', clubId)

       return { success: true, url: authUrl.toString() }
}

/**
 * Exchange the OAuth authorization code for access tokens.
 * Called from the callback route after MP redirects back.
 */
export async function exchangeMPOAuthCode(code: string, clubId: string) {
       if (!MP_APP_ID || !MP_APP_SECRET) {
              throw new Error('MP_APP_ID o MP_APP_SECRET no configurados')
       }

       const redirectUri = `${APP_URL}/api/mercadopago/oauth/callback`

       const response = await fetch('https://api.mercadopago.com/oauth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                     client_id: MP_APP_ID,
                     client_secret: MP_APP_SECRET,
                     code,
                     grant_type: 'authorization_code',
                     redirect_uri: redirectUri,
              })
       })

       if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              console.error('MP OAuth Token Exchange Error:', errorData)
              throw new Error(`Error al conectar con MercadoPago: ${errorData.message || response.statusText}`)
       }

       const data = await response.json()

       // data contains: access_token, token_type, expires_in, scope, user_id, refresh_token, public_key
       if (!data.access_token) {
              throw new Error('No se recibió el access token de MercadoPago')
       }

       // Encrypt and store the token
       const encryptedToken = encrypt(data.access_token)
       const encryptedRefreshToken = data.refresh_token ? encrypt(data.refresh_token) : null

       await prisma.club.update({
              where: { id: clubId },
              data: {
                     mpAccessToken: encryptedToken,
                     mpPublicKey: data.public_key || null,
                     mpRefreshToken: encryptedRefreshToken,
                     mpUserId: data.user_id ? String(data.user_id) : null,
                     mpConnectedAt: new Date(),
              }
       })

       revalidatePath('/configuracion')
       return { success: true }
}

/**
 * Disconnect MercadoPago from a club (remove tokens).
 */
export async function disconnectMP() {
       const clubId = await getCurrentClubId()

       await prisma.club.update({
              where: { id: clubId },
              data: {
                     mpAccessToken: null,
                     mpPublicKey: null,
                     mpRefreshToken: null,
                     mpUserId: null,
                     mpConnectedAt: null,
              }
       })

       revalidatePath('/configuracion')
       return { success: true }
}

/**
 * Test the MercadoPago connection by making a simple API call.
 */
export async function testMPConnection() {
       const clubId = await getCurrentClubId()

       const club = await prisma.club.findUnique({
              where: { id: clubId },
              select: { mpAccessToken: true }
       })

       if (!club?.mpAccessToken) {
              return { success: false, error: 'No hay token de MercadoPago configurado.' }
       }

       try {
              const { decrypt } = await import('@/lib/encryption')
              const token = decrypt(club.mpAccessToken)

              const response = await fetch('https://api.mercadopago.com/users/me', {
                     headers: { Authorization: `Bearer ${token}` }
              })

              if (!response.ok) {
                     return {
                            success: false,
                            error: response.status === 401
                                   ? 'Token inválido o expirado. Reconecta tu cuenta de MercadoPago.'
                                   : `Error de MercadoPago (${response.status})`
                     }
              }

              const userData = await response.json()

              return {
                     success: true,
                     data: {
                            userId: userData.id,
                            email: userData.email,
                            nickname: userData.nickname,
                            firstName: userData.first_name,
                            lastName: userData.last_name,
                            siteId: userData.site_id
                     }
              }
       } catch (error) {
              console.error('MP Connection Test Error:', error)
              return {
                     success: false,
                     error: error instanceof Error ? error.message : 'Error desconocido al verificar la conexión.'
              }
       }
}

/**
 * Refresh the MP access token using the refresh token.
 * Should be called when the token expires.
 */
export async function refreshMPToken(clubId: string) {
       if (!MP_APP_ID || !MP_APP_SECRET) {
              throw new Error('MP_APP_ID o MP_APP_SECRET no configurados')
       }

       const club = await prisma.club.findUnique({
              where: { id: clubId },
              select: { mpRefreshToken: true }
       })

       if (!club?.mpRefreshToken) {
              throw new Error('No hay refresh token disponible. Reconecta MercadoPago.')
       }

       const { decrypt } = await import('@/lib/encryption')
       const refreshToken = decrypt(club.mpRefreshToken)

       const response = await fetch('https://api.mercadopago.com/oauth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                     client_id: MP_APP_ID,
                     client_secret: MP_APP_SECRET,
                     grant_type: 'refresh_token',
                     refresh_token: refreshToken,
              })
       })

       if (!response.ok) {
              throw new Error('No se pudo renovar el token de MercadoPago')
       }

       const data = await response.json()

       const encryptedToken = encrypt(data.access_token)
       const encryptedRefreshToken = data.refresh_token ? encrypt(data.refresh_token) : null

       await prisma.club.update({
              where: { id: clubId },
              data: {
                     mpAccessToken: encryptedToken,
                     ...(encryptedRefreshToken ? { mpRefreshToken: encryptedRefreshToken } : {}),
              }
       })

       return { success: true, accessToken: data.access_token }
}
