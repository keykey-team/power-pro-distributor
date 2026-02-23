
const locales = ['sk'];
const defaultLocale = '';


const staticPagePaths = [
  '/',              
  '/build-box',      
];

module.exports = {
  siteUrl: process.env.SITE_URL || 'https://fitwin-powerpro.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  sitemapSize: 5000,
  exclude: [
    '/admin/*',
    '/api/*',
    '/panel5587436/*',
    '/dashboard/*',
    '/placement/*',
    '/cart/*',
  ],

  
  additionalPaths: async (config) => {
    const paths = [];

    for (const page of staticPagePaths) {
 
      for (const locale of locales) {
      
        let locPath;
        if (locale === defaultLocale) {
       
          locPath = page === '/' ? '/' : page; 
        } else {
       
          locPath = `/${locale}${page}`;
        }

       
        const alternateRefs = locales.map((l) => {
          let href;
          if (l === defaultLocale) {
            href = page === '/' ? '/' : page;
          } else {
            href = `/${l}${page}`;
          }
          return {
            href: `${config.siteUrl}${href}`,
            hreflang: l === 'ua' ? 'uk' : l,
          };
        });

        paths.push({
          loc: locPath,                 
          alternateRefs,                
          changefreq: 'daily',
          priority: page === '/' ? 1.0 : 0.8,
          
        });
      }
    }

    return paths;
  },
};