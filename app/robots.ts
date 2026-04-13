import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Don't index admin private pages
    },
    sitemap: 'https://ansan-market-hub.vercel.app/sitemap.xml',
  };
}
