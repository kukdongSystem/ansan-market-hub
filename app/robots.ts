import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/vendor/'], // 관리자 및 판매자 페이지는 검색 제외
    },
    sitemap: 'https://ansan-market-hub.vercel.app/sitemap.xml',
  }
}
