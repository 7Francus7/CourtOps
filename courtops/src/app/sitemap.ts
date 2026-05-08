import { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/utils'
import db from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  let clubUrls: MetadataRoute.Sitemap = []
  try {
    const clubs = await db.club.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true },
    })
    clubUrls = clubs.flatMap((club) => [
      {
        url: `${baseUrl}/${club.slug}`,
        lastModified: club.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/p/${club.slug}`,
        lastModified: club.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
    ])
  } catch {
    // DB unavailable at build time — skip dynamic routes
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...clubUrls,
  ]
}
