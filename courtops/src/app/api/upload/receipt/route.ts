import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']

export async function POST(request: Request) {
       const session = await getServerSession(authOptions)
       if (!session?.user?.clubId) {
              return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
       }

       if (!process.env.BLOB_READ_WRITE_TOKEN) {
              return NextResponse.json(
                     { error: 'Almacenamiento no configurado. Pegá un link al comprobante como alternativa.' },
                     { status: 501 }
              )
       }

       const formData = await request.formData()
       const file = formData.get('file')

       if (!file || !(file instanceof File)) {
              return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
       }

       if (file.size > MAX_SIZE) {
              return NextResponse.json({ error: 'El archivo supera los 5MB. Sacá una captura más liviana.' }, { status: 413 })
       }

       if (!ALLOWED_TYPES.includes(file.type)) {
              return NextResponse.json({ error: 'Formato no soportado. Subí una imagen (JPG, PNG) o un PDF.' }, { status: 415 })
       }

       try {
              const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
              const blob = await put(
                     `receipts/${session.user.clubId}/${Date.now()}.${ext}`,
                     file,
                     { access: 'public' }
              )
              return NextResponse.json({ url: blob.url })
       } catch (error) {
              console.error('[upload/receipt] Blob upload failed:', error)
              return NextResponse.json({ error: 'Error al subir el archivo. Probá de nuevo.' }, { status: 500 })
       }
}
