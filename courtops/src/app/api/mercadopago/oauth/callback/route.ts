import { NextResponse } from 'next/server'
import { exchangeMPOAuthCode } from '@/actions/mercadopago-oauth'

/**
 * MercadoPago OAuth Callback
 * 
 * MercadoPago redirects here after the club admin authorizes the connection.
 * URL: /api/mercadopago/oauth/callback?code=XXX&state=CLUB_ID
 */
export async function GET(request: Request) {
       const url = new URL(request.url)
       const code = url.searchParams.get('code')
       const state = url.searchParams.get('state') // clubId
       const error = url.searchParams.get('error')

       const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
       const settingsUrl = `${baseUrl}/configuracion?tab=INTEGRACIONES`

       // User denied authorization
       if (error) {
              console.error('MP OAuth Error:', error)
              return NextResponse.redirect(
                     `${settingsUrl}&mp_status=error&mp_msg=${encodeURIComponent('Autorización cancelada por el usuario.')}`
              )
       }

       if (!code || !state) {
              return NextResponse.redirect(
                     `${settingsUrl}&mp_status=error&mp_msg=${encodeURIComponent('Parámetros inválidos en la respuesta de MercadoPago.')}`
              )
       }

       try {
              await exchangeMPOAuthCode(code, state)

              return NextResponse.redirect(
                     `${settingsUrl}&mp_status=success&mp_msg=${encodeURIComponent('¡MercadoPago conectado exitosamente!')}`
              )
       } catch (err) {
              console.error('MP OAuth Callback Error:', err)
              const message = err instanceof Error ? err.message : 'Error desconocido'
              return NextResponse.redirect(
                     `${settingsUrl}&mp_status=error&mp_msg=${encodeURIComponent(message)}`
              )
       }
}
