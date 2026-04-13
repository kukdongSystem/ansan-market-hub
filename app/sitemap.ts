import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ansan-market-hub.vercel.app';

  // Fetch all stores to include in sitemap
  const { data: stores } = await supabase
    .from('stores')
    .select('id, updated_at, created_at');

  const storeUrls = (stores || []).map((store) => ({
    url: `${baseUrl}/store/${store.id}`,
    lastModified: store.updated_at || store.created_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...storeUrls,
  ];
}
