import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
       const { searchParams } = new URL(request.url);
       const query = searchParams.get('q');

       if (!query) {
              return NextResponse.json({ error: 'Query is missing' }, { status: 400 });
       }

       try {
              const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&setmkt=es-AR`;
              const response = await fetch(url, {
                     headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                            'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
                     }
              });
              const html = await response.text();
              const $ = cheerio.load(html);

              const images: string[] = [];

              // Bing stores metadata inside the 'm' attribute on 'a.iusc' elements
              // Also check 'img.mimg' for direct src
              $('a.iusc').each((i, el) => {
                     const m = $(el).attr('m');
                     if (m) {
                            try {
                                   const mObj = JSON.parse(m);
                                   if (mObj.murl) {
                                          images.push(mObj.murl);
                                   }
                            } catch { /* skip invalid JSON */ }
                     }
              });

              // Backup plan for some Bing layouts
              if (images.length === 0) {
                     $('img.mimg').each((i, el) => {
                            const src = $(el).attr('src') || $(el).attr('data-src');
                            if (src && src.startsWith('http')) {
                                   images.push(src);
                            }
                     });
              }

              // Return first 6 valid images
              return NextResponse.json({ images: images.slice(0, 6) });
       } catch (error) {
              console.error('Image search error:', error);
              return NextResponse.json({ error: 'Failed to find images' }, { status: 500 });
       }
}
