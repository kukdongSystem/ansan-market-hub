'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Hammer, Zap, ShieldCheck, Utensils, UploadCloud, UserPlus, LogIn, Settings, Package, Cog, Building2, Beaker, Monitor } from 'lucide-react';
import SearchBox from '@/components/SearchBox';

const HERO_IMAGES = [
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
  {
    url: '/images/chemicals-bg.png',
    title: '특수 산업 화공 전산망',
    desc: '고품질 페인트 도료부터 현장 맞춤형 고무 패킹 재질 완비.'
  },
  {
    url: '/images/safety-bg.png',
    title: '가장 중요한 기본, 안전',
    desc: '작업 현장의 철저한 안전을 약속하는 핵심 보호구 및 소모품.'
  },
  {
    url: '/images/logistic-bg.png',
    title: '끊김 없는 물류 인프라',
    desc: '입주사를 든든하게 받쳐주는 신속하고 정확한 화물 운송 서비스.'
  },
  {
    url: '/images/electronics-bg.png',
    title: '첨단 전자·정밀 부품',
    desc: '반도체, 회로 부품부터 최신 자동화 장비까지 완벽 지원.'
  },
  {
    url: '/images/restaurant-bg.png',
    title: '오늘의 맛있는 발견',
    desc: '상가 내 숨겨진 맛집부터 편리한 생활 서비스까지 탐색하세요.'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPageDragging, setIsPageDragging] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPageDragging(true);
  };

  const handlePageDragLeave = (e: React.DragEvent) => {
    if (e.relatedTarget === null) {
        setIsPageDragging(false);
    }
  };

  const handlePageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsPageDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        router.push(`/search?q=${encodeURIComponent('볼트')}&mode=image-drop`);
    }
  };

  return (
    <div 
        className={styles.container}
        onDragOver={handlePageDragOver}
        onDragLeave={handlePageDragLeave}
        onDrop={handlePageDrop}
    >
      {/* Global Drag Overlay */}
      {isPageDragging && (
          <div className={styles.globalDragOverlay}>
              <div className={styles.dropZoneBox}>
                  <UploadCloud size={64} className={styles.bounce} />
                  <h2>사진을 여기에 놓으세요</h2>
                  <p>안산유통상가의 전문 매장을 즉시 찾아드립니다.</p>
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
            <Link href="/register" className={styles.registerBtn}>
                <UserPlus size={16} /> 업체 신규 등록
            </Link>
            <Link href="/login" className={styles.loginBtn}>
                <LogIn size={16} /> 파트너 로그인
            </Link>
          </div>
        </div>
      </nav>

      <header className={styles.hero}>
        {/* Admin Secret Shortcut */}
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
          <div className={styles.badge}>안산유통상가 입점주를 위한 통합 마켓 허브</div>
          <h1 className={styles.title}>
            안산유통상가 <br />
            <span>{HERO_IMAGES[currentSlide].title}</span>
          </h1>
          <p className={styles.description}>
            {HERO_IMAGES[currentSlide].desc}
          </p>
          <div className={styles.searchWrapper}>
            <SearchBox 
              placeholder="품목, 매장명, 혹은 먹거리를 검색해보세요..." 
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
            <h2>다양한 상업 카테고리</h2>
            <p>안산유통상가의 모든 업종을 한 번에 찾아보세요.</p>
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
            <Link href="/search?q=기계" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><Cog size={32}/></div>
              <div className={styles.catContent}>
                <h3>자동차·모터·펌프</h3>
                <p>동력 전달 장치 핵심 부품, 유공압 실린더 완벽 구비</p>
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
            <Link href="/search?q=식당" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><Utensils size={32}/></div>
              <div className={styles.catContent}>
                <h3>식음료·편의시설</h3>
                <p>한식당, 커피숍, 은행 등 단지 내에서 해결하는 생활 인프라</p>
              </div>
            </Link>
            <Link href="/search?q=서비스" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><ShieldCheck size={32}/></div>
              <div className={styles.catContent}>
                <h3>경비·운송·서비스</h3>
                <p>물류와 화물, 단속 등 입주사를 위한 맞춤형 비즈니스 지원</p>
              </div>
            </Link>
            <Link href="/search?q=네트워크" className={styles.categoryCard} style={{ textDecoration: 'none' }}>
              <div className={styles.catIcon}><Monitor size={32}/></div>
              <div className={styles.catContent}>
                <h3>컴퓨터·IT·OA</h3>
                <p>PC 조립 및 수리, 네트워크 공사부터 사무기기 임대까지</p>
              </div>
            </Link>
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>4,000+</span>
            <span className={styles.statLabel}>입점 업체</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>300+</span>
            <span className={styles.statLabel}>식음료 시설</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>AI</span>
            <span className={styles.statLabel}>통합 검색</span>
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
