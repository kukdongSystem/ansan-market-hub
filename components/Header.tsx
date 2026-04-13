'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Users, Store as StoreIcon, ShieldCheck, LogOut, Search, Menu, X, LayoutDashboard, UserCircle, Globe, ChevronDown } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Language, translations } from '@/constants/translations';
import styles from './Header.module.css';

const LAN_LABELS: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '简体中文',
  de: 'Deutsch',
  es: 'Español'
};

export default function Header() {
  const { currentUser, logout, todayVisitorCount, lang, setLang, t } = useData();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLanOpen, setIsLanOpen] = useState(false);
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    // Country Detection remains local to header if not needed elsewhere
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry(data.country_code))
      .catch(() => setCountry('KR'));

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/';
  const isLocal = typeof window !== 'undefined' && 
                  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const isKorea = country === 'KR' || country === null || isLocal;

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${!isHome ? styles.notHome : ''}`}>
      <div className={styles.container}>
        {/* Brand Logo Section */}
        <Link href="/" className={styles.brand}>
          <div className={styles.logoWrapper}>
            <img src="/images/logo.png" alt="이거어디 로고" className={styles.logoImg} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.title}>이거 어디서 팔아요?</span>
            <span className={styles.subTitle}>안산 1차 유통상가 스마트 검색 플랫폼</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.navDesktop}>
          <div className={styles.visitorBadge}>
            <Users size={14} />
            <span>오늘 방문자 <strong>{todayVisitorCount.toLocaleString()}</strong></span>
          </div>
          
          <div className={styles.navLinks}>
            {/* Language Selector */}
            <div className={styles.langSelector}>
              <button 
                className={styles.langBtn}
                onClick={() => setIsLanOpen(!isLanOpen)}
              >
                <Globe size={16} />
                <span>{LAN_LABELS[lang]}</span>
                <ChevronDown size={12} style={{ transform: isLanOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
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

            {currentUser ? (
              <>
                <Link 
                  href={currentUser.role === 'admin' ? '/admin' : '/vendor'} 
                  className={styles.pillsBtn}
                >
                  <LayoutDashboard size={14} />
                  <span>내 대시보드</span>
                </Link>
                <button onClick={logout} className={styles.iconBtn} title="로그아웃">
                  <LogOut size={16} />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <>
                {isKorea && (
                  <Link href="/login" className={styles.navLink}>
                    <UserCircle size={16} />
                    <span>입점사 로그인</span>
                  </Link>
                )}
                <Link href="/login" className={styles.adminLink}>
                  <ShieldCheck size={16} />
                  <span>관리자</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Toggle */}
        <button className={styles.mobileToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {currentUser ? (
            <>
              <div className={styles.mobileUser}>
                <strong>{currentUser.store_name || currentUser.email}</strong>님
              </div>
              <Link href={currentUser.role === 'admin' ? '/admin' : '/vendor'} onClick={() => setMobileMenuOpen(false)}>대시보드</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }}>로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>입점사 로그인</Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>관리자 페이지</Link>
            </>
          )}
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>홈으로</Link>
        </div>
      )}
    </header>
  );
}
