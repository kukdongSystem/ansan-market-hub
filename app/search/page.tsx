'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './search.module.css';
import Header from '@/components/Header';
import { Store, CATEGORY_LABELS } from '@/types';
import { MapPin, Phone, ExternalLink, CheckCircle2, Map as MapIcon, List, Navigation } from 'lucide-react';
import { useData } from '@/context/DataContext';

function SearchResults() {
  const { stores, t } = useData();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const results = stores.filter(store => {
    // Only show verified stores in search results
    if (!store.is_verified) return false;

    const lowerQuery = query.toLowerCase();
    
    return (
      store.store_name.toLowerCase().includes(lowerQuery) || 
      store.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
      store.sub_category?.toLowerCase().includes(lowerQuery) ||
      (store.category && CATEGORY_LABELS[store.category]?.toLowerCase().includes(lowerQuery)) ||
      (store.road_address && store.road_address.toLowerCase().includes(lowerQuery)) ||
      (store.location && store.location.toLowerCase().includes(lowerQuery))
    );
  });

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.toolRow}>
            <div className={styles.meta}>
              <h1>"{query}" 검색 결과</h1>
              <p>{results.length}개의 매장을 찾았습니다.</p>
            </div>
            <div className={styles.viewToggle}>
                <button 
                    className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
                    onClick={() => setViewMode('list')}
                >
                    <List size={18} /> 리스트
                </button>
                <button 
                    className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.active : ''}`}
                    onClick={() => setViewMode('map')}
                >
                    <MapIcon size={18} /> 지도
                </button>
            </div>
        </div>

        {viewMode === 'list' ? (
            <div className={styles.grid}>
              {results.length > 0 ? (
                results.map((store) => (
                  <div key={store.id} className={styles.storeCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.categoryBadge} data-cat={store.category}>
                        {CATEGORY_LABELS[store.category]}
                      </div>
                      {store.is_verified && (
                        <div className={styles.verified} title="인증됨">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.cardBody}>
                      <h3 className={styles.storeName}>{store.store_name}</h3>
                      <div className={styles.tags}>
                        {store.keywords.map(tag => (
                          <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                      </div>
                      
                      <div className={styles.info}>
                        <div className={styles.infoRow}>
                          <MapPin size={16} />
                          <span>
                            {store.road_address}
                            {(store.location || (store.description?.match(/\[상세위치: (.*?)\]/)?.[1])) && (
                              <span style={{ marginLeft: '0.3rem', fontWeight: 600 }}>
                                ({store.location || (store.description?.match(/\[상세위치: (.*?)\]/)?.[1])})
                              </span>
                            )}
                          </span>
                        </div>
                        {store.phone && (
                          <div className={styles.infoRow}>
                            <Phone size={16} />
                            <span>{store.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <Link href={`/store/${store.id}`} className={styles.viewBtn}>
                        상세보기 <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.empty}>
                  <h3>검색 결과가 없습니다.</h3>
                  <p>검색어를 확인하거나 다른 단어로 검색해보세요.</p>
                </div>
              )}
            </div>
        ) : (
            <div className={styles.mapContainer}>
                {/* Simulated Interactive Map */}
                <div className={styles.mockMap}>
                    {results.map((store, i) => (
                        <div 
                            key={store.id} 
                            className={styles.mapPin}
                            style={{ 
                                top: `${30 + (i * 12) % 40}%`, 
                                left: `${20 + (i * 15) % 60}%` 
                            }}
                        >
                            <div className={styles.pinWrapper}>
                                <div className={styles.pinIcon} data-cat={store.category}>
                                    <MapPin size={24} />
                                </div>
                                <div className={styles.pinLabel}>{store.store_name}</div>
                            </div>
                        </div>
                    ))}
                    <div className={styles.mapOverlay}>
                        <Navigation size={24} /> 안산유통단지 AI 맵 활성화 중...
                    </div>
                </div>
                <div className={styles.mapSidebar}>
                    <h3>선택된 구역 ({results.length})</h3>
                    <div className={styles.sidebarList}>
                        {results.map(s => (
                                <div key={s.id} className={styles.sidebarItem}>
                                    <strong>{s.store_name}</strong>
                                    <span>{s.location || s.road_address}</span>
                                </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
