'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Hammer, Zap, ShieldCheck, Utensils, UploadCloud, UserPlus, LogIn, Settings, Package, Cog, Building2, Beaker, Monitor, Globe, ChevronDown, Menu, X } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { translations, Language } from '@/constants/translations';
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
  const [lang, setLang] = useState<Language>('ko');
  const [isLanOpen, setIsLanOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const { todayVisitorCount } = useData();
  const router = useRouter();

  const t = translations[lang] as any;

  useEffect(() => {
    // 1. Language Detection
    const browserLang = navigator.language.split('-')[0];
    if (Object.keys(translations).includes(browserLang)) {
      setLang(browserLang as Language);
    }

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

      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.wrapper}>
             <Link href="/" className={styles.logo}>
                <img src="/images/logo.png" alt="Logo" className={styles.logoImage} />
                <div className={styles.logoTextContainer}>
                  <span className={styles.logoTitle}>이거 어디에서 팔아요?</span>
                  <span className={styles.logoSubtitle}>안산1차유통상가</span>
                </div>
             </Link>
          </div>

          <button className={styles.mobileMenuBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          
          <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.navLinksOpen : ''}`}>
            {/* Admin Buttons - Only visible in Korea */}
            {isKorea && (
              <>
                <Link href="/register" className={styles.registerBtn}>
                    <UserPlus size={16} /> <span className={styles.btnText}>{t.register}</span>
                </Link>
                <Link href="/login" className={styles.loginBtn}>
                    <LogIn size={16} /> <span className={styles.btnText}>{t.login}</span>
                </Link>
              </>
            )}

            {/* Language Selector */}
            <div className={styles.langSelector}>
              <button 
                className={styles.langBtn}
                onClick={() => setIsLanOpen(!isLanOpen)}
              >
                <Globe size={18} />
                <span>{LAN_LABELS[lang]}</span>
                <ChevronDown size={14} style={{ transform: isLanOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
              </button>
              {isLanOpen && (
                <div className={styles.langDropdown}>
                  {(Object.keys(LAN_LABELS) as Language[]).map((l) => (
                    <button 
                      key={l}
                      onClick={() => { setLang(l); setIsLanOpen(false); }}
                      className={l === lang ? styles.activeLang : ''}
                    >
                      {LAN_LABELS[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <header className={styles.hero}>
        <Link href="/login" className={styles.adminShortcut} title="관리자 전용">
            <Settings size={18} />
        </Link>

        {HERO_IMAGES.map((image, index) => (
          <div 
            key={index}
            className={`${styles.heroSlide} ${index === currentSlide ? styles.active : ''}`}
            style={{ backgroundImage: `url(${image.url})` }}
          >
            <div className={styles.heroOverlay}></div>
          </div>
        ))}
        
        <div className={styles.heroContent}>
          <div className={styles.badge}>{t.badge}</div>
          <h1 className={styles.title}>
            {t.heroPrefix} <br />
            <span>
              {t[HERO_IMAGES[currentSlide].titleKey as string]}
            </span>
          </h1>
          <p className={styles.description}>
            {t[HERO_IMAGES[currentSlide].descKey as string]}
          </p>
          <div className={styles.searchWrapper}>
            <SearchBox 
              placeholder={t.searchPlaceholder} 
              placeholders={[t.searchPlaceholder, t.searchPlaceholderAlt]}
            />
          </div>
          <div className={styles.visitorBadge}>
            <span className={styles.pulseDot}></span>
            <span>현재 <strong>{todayVisitorCount.toLocaleString()}명</strong>의 사용자가 검색 서비스를 이용 중입니다</span>
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
