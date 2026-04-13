'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Hammer, Zap, ShieldCheck, Utensils, UploadCloud, UserPlus, LogIn, Settings, Package, Cog, Building2, Beaker, Monitor, Globe, ChevronDown, Menu, X } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import Header from '@/components/Header';
import { useData } from '@/context/DataContext';
import { CATEGORY_LABELS, StoreCategory } from '@/types';

const HERO_IMAGES = [
  {
    url: '/images/hydraulics-bg.png',
    titleKey: 'heroTitle',
    descKey: 'heroDesc'
  },
  {
    url: '/images/construction-bg.png',
    titleKey: 'heroConstructTitle',
    descKey: 'heroConstructDesc'
  },
  {
    url: '/images/automotive-bg.png',
    titleKey: 'heroAutoTitle',
    descKey: 'heroAutoDesc'
  },
  {
    url: '/images/it-bg.png',
    titleKey: 'heroItTitle',
    descKey: 'heroItDesc'
  },
  {
    url: '/images/industrial-bg.png',
    titleKey: 'heroIndTitle',
    descKey: 'heroIndDesc'
  },
];

const LAN_LABELS: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '简体中文',
  de: 'Deutsch',
  es: 'Español'
};

const CATEGORY_ICONS: Record<StoreCategory, any> = {
  fastener: Cog,
  tool: Hammer,
  bearing: Cog,
  welding: Zap,
  electric: Zap,
  electronics: Monitor,
  pipe: Building2,
  packaging: Package,
  safety: ShieldCheck,
  cnc: Settings,
  printing: Globe,
  food: Utensils,
  service: Monitor,
  chemical: Beaker,
  etc: Package
};

const MAIN_CATEGORIES: StoreCategory[] = [
  'fastener', 'tool', 'bearing', 'welding', 
  'electric', 'electronics', 'pipe', 'cnc', 
  'safety', 'chemical', 'food', 'service'
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const { todayVisitorCount, t, lang } = useData();
  const router = useRouter();

  useEffect(() => {

    // 2. Country Detection (IP Geo-filtering)
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry(data.country_code))
      .catch(() => setCountry('KR')); // Fallback to KR if failed

    // Slider
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsPageDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        router.push(`/search?q=${encodeURIComponent('볼트')}&mode=image-drop`);
    }
  };

  const isLocal = typeof window !== 'undefined' && 
                  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const isKorea = country === 'KR' || country === null || isLocal; // null means check still in progress, isLocal allows test

  return (
    <div 
        className={styles.container}
        onDragOver={(e) => { e.preventDefault(); setIsPageDragging(true); }}
        onDragLeave={(e) => { if (e.relatedTarget === null) setIsPageDragging(false); }}
        onDrop={handlePageDrop}
    >
      {/* Global Drag Overlay */}
      {isPageDragging && (
          <div className={styles.globalDragOverlay}>
              <div className={styles.dropZoneBox}>
                  <UploadCloud size={64} className={styles.bounce} />
                  <h2>{t.dropText}</h2>
                  <p>{t.dropDesc}</p>
              </div>
          </div>
      )}

      <Header />

      <header className={styles.hero}>
        <Link href="/login" className={styles.adminShortcut} title="관리자 전용">
            <Settings size={18} />
        </Link>
        
        {/* Dynamic Prism Engine: Changes colors per slide */}
        <div className={styles.prismContainer} style={{ 
          '--prism-color-1': currentSlide === 0 ? '#0ea5e9' : currentSlide === 1 ? '#f59e0b' : currentSlide === 2 ? '#ec4899' : currentSlide === 3 ? '#10b981' : '#6366f1',
          '--prism-color-2': currentSlide === 0 ? '#6366f1' : currentSlide === 1 ? '#ef4444' : currentSlide === 2 ? '#8b5cf6' : currentSlide === 3 ? '#3b82f6' : '#ec4899'
        } as any}>
          <div className={styles.meshGradient}></div>
          <div className={`${styles.decoration} ${styles.decoration1}`}></div>
          <div className={`${styles.decoration} ${styles.decoration2}`}></div>
        </div>

        {HERO_IMAGES.map((image, index) => (
          <div 
            key={index}
            className={`${styles.heroSlide} ${index === currentSlide ? styles.active : ''}`}
          >
            {/* Background Layer: Only this layer scales to keep text sharp */}
            <div 
              className={styles.heroBg} 
              style={{ backgroundImage: `url(${image.url})` }}
            ></div>
            <div className={styles.heroOverlay}></div>
            
            {/* Slide-specific text content: Independent of scaling */}
            <div className={styles.heroContent} style={{ opacity: index === currentSlide ? 1 : 0, pointerEvents: index === currentSlide ? 'auto' : 'none' }}>
              <div className={styles.badge}>{t.badge}</div>
              <h1 className={styles.title}>
                {t.heroPrefix} <br />
                <div className={styles.titleHighlight}>
                  <span>
                    {t[image.titleKey as string]}
                  </span>
                </div>
              </h1>
              <p className={styles.description}>
                {t[image.descKey as string]}
              </p>
            </div>
          </div>
        ))}

        {/* Persistent UI Elements (SearchBox & visitorBadge) - Stays fixed and focused */}
        <div className={styles.heroPersistentUI}>
          <div className={styles.searchWrapper}>
            <SearchBox 
              placeholder={t.searchPlaceholder} 
              placeholders={[t.searchPlaceholder, t.searchPlaceholderAlt]}
            />
          </div>
          
          <div className={styles.visitorBadge}>
            <span className={styles.pulseDot}></span>
            <span>최근 <strong>{todayVisitorCount.toLocaleString()}명</strong>의 사용자가 활발히 매장을 찾고 있습니다</span>
          </div>
        </div>
        
        <div className={styles.slideIndicators}>
          {HERO_IMAGES.map((_, index) => (
            <button 
              key={index}
              className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        
        {/* Decorative Floating Elements */}
        <div className={`${styles.decoration} ${styles.decoration1}`}></div>
        <div className={`${styles.decoration} ${styles.decoration2}`}></div>
      </header>
      
      <main className={styles.main}>
        <section className={styles.categories}>
          <div className={styles.sectionHeader}>
            <h2>{t.categories}</h2>
            <p>{t.categoriesDesc}</p>
          </div>
          <div className={styles.categoryGrid}>
            {MAIN_CATEGORIES.map((catKey) => {
              const Icon = CATEGORY_ICONS[catKey];
              const label = CATEGORY_LABELS[catKey];
              return (
                <Link 
                  key={catKey}
                  href={`/search?q=${encodeURIComponent(label)}`} 
                  className={styles.categoryCard} 
                  style={{ textDecoration: 'none' }}
                >
                  <div className={styles.catIcon} data-cat={catKey}><Icon size={32}/></div>
                  <div className={styles.catContent}>
                    <h3>{label}</h3>
                    <p>{(t as Record<string, string>)[`cat_${catKey}_desc`] || (translations.ko as Record<string, string>)[`cat_${catKey}_desc`] || '전문 매장 찾기'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>4,000+</span>
            <span className={styles.statLabel}>{t.statsStores}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{todayVisitorCount.toLocaleString()}</span>
            <span className={styles.statLabel}>오늘 방문객</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>AI</span>
            <span className={styles.statLabel}>{t.statsSearch}</span>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img src="/images/logo.png" alt="Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '8px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.1' }}>
                <strong style={{ color: 'white', fontSize: '1.2rem', margin: 0, fontWeight: 900, letterSpacing: '-0.04em' }}>이거 어디에서 팔아요?</strong>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>안산1차유통상가</span>
              </div>
            </div>
            <p style={{ marginTop: '0.25rem', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>{t.address}</p>
            <p style={{ marginTop: '0.5rem' }}>{t.footerDesc}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
