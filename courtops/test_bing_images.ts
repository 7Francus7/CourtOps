import * as cheerio from 'cheerio';

async function testBing() {
       const query = 'Gatorade Manzana';
       const response = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`, {
              headers: {
                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
              }
       });
       const html = await response.text();
       const $ = cheerio.load(html);
       const images: string[] = [];
       $('a.iusc').each((i, el) => {
              const m = $(el).attr('m');
              if (m) {
                     try {
                            const mObj = JSON.parse(m);
                            if (mObj.murl) {
                                   images.push(mObj.murl);
                            }
                     } catch (e) { }
              }
       });
       console.log('Bing images found: ', images.slice(0, 5));
}
testBing();
