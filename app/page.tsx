'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Hammer, Zap, ShieldCheck, Utensils, UploadCloud, UserPlus, LogIn, Settings, Package, Cog, Building2, Beaker, Monitor, Globe, ChevronDown } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { translations, Language } from '@/constants/translations';

const HERO_IMAGES = [
  {
    url: '/images/hydraulics-bg.png', // New professional hydraulics image
    titleKey: 'heroTitle',
    descKey: 'heroDesc'
  },
  {
    url: '/images/construction-bg.png',
    title: '기초를 다지는 건축자재',
    desc: '시공에 필요한 시멘트부터 파이프, 배관까지 모든 건설의 시작점.'
  },
  {
    url: '/images/automotive-bg.png',
    title: '쉬지 않는 원동력, 모터',
    desc: '핵심 동력 전달 장치와 정밀 유공압 실린더를 한곳에서.'
  },
  {
    url: '/images/it-bg.png',
    title: '스마트 비즈니스 파트너',
    desc: '사무기기 임대와 안정적인 네트워크 통신 구축의 중심.'
  },
  {
    url: '/images/industrial-bg.png',
    title: '강력한 산업 솔루션',
    desc: '4,000여 개 전문 매장의 산업 용품과 부품을 한눈에.'
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

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPageDragging, setIsPageDragging] = useState(false);
  const [lang, setLang] = useState<Language>('ko');
  const [isLanOpen, setIsLanOpen] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const router = useRouter();

  const t = translations[lang];

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

  const isKorea = country === 'KR' || country === null; // null means check still in progress

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
                <img src="/images/logo.png" alt="Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', marginRight: '0.5rem', borderRadius: '8px' }} />
                ANSAN MARKET HUB
             </Link>
          </div>
          
          <div className={styles.navLinks}>
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

            {/* Admin Buttons - Only visible in Korea */}
            {isKorea && (
              <>
                <Link href="/register" className={styles.registerBtn}>
                    <UserPlus size={16} /> {t.register}
                </Link>
                <Link href="/login" className={styles.loginBtn}>
                    <LogIn size={16} /> {t.login}
                </Link>
              </>
            )}
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
            {lang === 'ko' ? '안산유통상가' : ''} <br />
            <span>
              {HERO_IMAGES[currentSlide].titleKey 
                ? (translations[lang] as any)[HERO_IMAGES[currentSlide].titleKey!]
                : HERO_IMAGES[currentSlide].title}
            </span>
          </h1>
          <p className={styles.description}>
            {HERO_IMAGES[currentSlide].descKey 
              ? (translations[lang] as any)[HERO_IMAGES[currentSlide].descKey!]
              : HERO_IMAGES[currentSlide].desc}
          </p>
          <div className={styles.searchWrapper}>
            <SearchBox 
              placeholder={t.searchPlaceholder} 
            />
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
            <Link href="/search?q=공구" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><Hammer size={32}/></div>
              <div className={styles.catContent}>
                <h3>기계·공구·철물</h3>
                <p>수공구부터 중장비 부속, 베어링까지 체계적인 분류</p>
              </div>
            </Link>
            <Link href="/search?q=전자" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><Zap size={32}/></div>
              <div className={styles.catContent}>
                <h3>전기·전자·반도체</h3>
                <p>소형 전자 부품 및 자동화, LS산전 등 전문 대리점 종합</p>
              </div>
            </Link>
            <Link href="/search?q=배관" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><Building2 size={32}/></div>
              <div className={styles.catContent}>
                <h3>건축자재·배관</h3>
                <p>시공에 필요한 모든 파이프, 목재, 시멘트 및 기초 설비</p>
              </div>
            </Link>
            <Link href="/search?q=유공압" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><Cog size={32}/></div>
              <div className={styles.catContent}>
                <h3>유공압·실린더·모터</h3>
                <p>동력 전달 장치 핵심 부품, 정밀 유공압 실린더 완벽 구비</p>
              </div>
            </Link>
            <Link href="/search?q=화학" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><Beaker size={32}/></div>
              <div className={styles.catContent}>
                <h3>화학·도료·고무</h3>
                <p>각종 산업용 화공약품, 페인트, 그리고 맞춤형 고무 패킹</p>
              </div>
            </Link>
            <Link href="/search?q=포장" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><Package size={32}/></div>
              <div className={styles.catContent}>
                <h3>포장·안전·소모품</h3>
                <p>보호 장구, 테이프, 박스 등 현장 작업에 필수적인 물품들</p>
              </div>
            </Link>
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>4,000+</span>
            <span className={styles.statLabel}>{t.statsStores}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>300+</span>
            <span className={styles.statLabel}>{t.statsFandB}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <img src="/images/logo.png" alt="Logo" style={{ height: '28px', width: '28px', objectFit: 'contain', borderRadius: '6px' }} />
              <strong>ANSAN MARKET HUB</strong>
            </div>
            <p>© 2026 안산유통상가 입점주를 위한 공식 통합 탐색 서비스. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
