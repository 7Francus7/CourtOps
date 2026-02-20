import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
       const baseUrl = process.env.NEXTAUTH_URL || 'https://courtops.vercel.app'

       return {
              rules: {
                     userAgent: '*',
                     allow: '/',
                     disallow: ['/api/', '/dashboard/', '/god-mode/', '/setup/', '/login/'],
              },
              sitemap: `${baseUrl}/sitemap.xml`,
       }
}
