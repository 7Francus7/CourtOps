import { unstable_cache } from 'next/cache';
import prisma from '@/lib/db';

/**
 * Cache club theme settings for 10 minutes (600 seconds).
 * The cache key is based on the clubId.
 * Revalidates automatically or manually via tags.
 */
export const getCachedClubTheme = unstable_cache(
       async (clubId: string) => {
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { themeColor: true }
              });
              return club;
       },
       ['club-theme-settings'], // Key parts (namespace)
       {
              revalidate: 600, // 10 minutes default TTL
              tags: ['club-theme'] // Tag for manual invalidation
       }
);
