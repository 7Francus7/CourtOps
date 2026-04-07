import { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
       const baseUrl = getBaseUrl()

       return {
              rules: {
                     userAgent: '*',
                     allow: '/',
                     disallow: ['/api/', '/dashboard/', '/god-mode/', '/setup/', '/login/', '/register/'],
              },
              sitemap: `${baseUrl}/sitemap.xml`,
       }
}
