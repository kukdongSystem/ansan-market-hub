'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Home, ArrowLeft } from 'lucide-react';
import styles from './login.module.css';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useData } from '@/context/DataContext';

export default function LoginPage() {
  const { currentUser, isLoading: isDataLoading, setCurrentUser } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isDataLoading && currentUser) {
      router.replace('/admin');
    }
  }, [currentUser, isDataLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
        const timeoutMs = 20000;
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
        );

        const loginPromise = supabase.auth.signInWithPassword({ email, password });

        const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as {
          data: { user: { id: string; email?: string | null } | null } | null;
          error: Error | null;
        };

        if (error) throw error;

        const user = data?.user;
        if (!user) throw new Error('세션을 가져오지 못했습니다.');

        // onAuthStateChange보다 navigation이 먼저 일어나면 /admin이 currentUser=null로 보고 /login으로 튕깁니다.
        setCurrentUser({
          id: user.id,
          email: user.email,
          role: 'vendor',
        });

        // profiles는 네트워크/RLS 등으로 지연·무응답일 수 있어 로그인 완료를 막지 않음 (백그라운드 반영)
        void supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile) {
              setCurrentUser((prev: any) => ({
                ...prev,
                ...profile,
                role: profile.role || 'vendor',
              }));
            }
          })
          .catch(() => {});

        setMessage('로그인 성공! 이동 중...');
        router.push('/admin');
    } catch (err: any) {
        let msg = err.message || '로그인에 실패했습니다.';
        if (msg === 'TIMEOUT') msg = '서버 응답이 없습니다. Supabase 프로젝트가 일시 정지 상태일 수 있습니다. 잠시 후 다시 시도하세요.';
        if (msg.includes('Invalid login credentials')) msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
        if (msg.includes('Email not confirmed')) msg = '이메일 인증이 완료되지 않았습니다. 메일함을 확인하세요.';
        setMessage(msg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} animate-fade-in`}>
        <header className={styles.header}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logo}>
              <img src="/images/logo.png" alt="Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', marginRight: '0.5rem', borderRadius: '8px' }} />
              ANSAN MARKET HUB
            </div>
          </Link>
          <h1>관리 시스템 로그인</h1>
          <p>관리자 또는 입점주 계정으로 접속하세요.</p>
          <Link href="/" className={styles.homeLink}>
            <ArrowLeft size={16} /> 메인 페이지로 돌아가기
          </Link>
        </header>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>이메일 주소</label>
            <input 
              type="email" 
              className={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>비밀번호</label>
            <div className={styles.passwordWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={styles.input} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required 
                />
                <button 
                    type="button" 
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>
          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? '인증 중...' : '로그인'}
          </button>
        </form>

        {message && <div className={styles.errorMessage}>{message}</div>}
        
        <div className={styles.footer}>
          <p>© 2026 안산유통단지 AI 관제센터</p>
        </div>
      </div>
    </div>
  );
}
