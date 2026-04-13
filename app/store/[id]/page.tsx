import { supabase } from '@/lib/supabase';
import StoreDetailViewWrapper from './StoreDetailViewWrapper';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

// 동적 메타데이터 생성 (구글 검색 엔진 최적화 핵심)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();

  if (!store) {
    return {
      title: '매장을 찾을 수 없습니다 | 안산유통상가 이거어디?',
    };
  }

  // 업체 키워드와 태그를 메타데이터에 주입
  const keywords = [
    store.store_name,
    store.category,
    ...(store.keywords || []),
    '안산유통상가',
    '안산유통단지',
    '공구 검색'
  ];

  const description = store.description || `${store.store_name} - 안산유통상가 ${store.location}에 위치한 ${store.category} 전문 업체입니다.`;

  return {
    title: `${store.store_name} | 안산유통상가 이거어디?`,
    description: description,
    keywords: keywords,
    openGraph: {
      title: `${store.store_name} - 안산유통상가 이거어디?`,
      description: description,
      url: `https://ansan-market-hub.vercel.app/store/${id}`,
      type: 'website',
      images: store.image_url ? [{ url: store.image_url }] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  
  // 서버 측 데이터 페칭으로 구글 로봇에게 즉시 정보 제공
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();

  if (!store) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>매장을 찾을 수 없습니다.</h1>
        <a href="/" style={{ color: '#3b82f6' }}>홈으로 돌아가기</a>
      </div>
    );
  }

  // 클라이언트 뷰 래퍼에 초기 데이터 전달
  return <StoreDetailViewWrapper initialStore={store} />;
}
