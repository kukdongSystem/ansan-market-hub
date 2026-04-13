'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Store as StoreIcon, Lock, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase, signInWithPasswordDirect } from '@/lib/supabase';
import { useData } from '@/context/DataContext';
import styles from './login.module.css';

export default function LoginPage() {
  const { currentUser, isLoading: isDataLoading, setCurrentUser, t } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
        const { user: authUser, error: signError } = await signInWithPasswordDirect(
          email,
          password,
          15000
        );

        if (signError) throw signError;
        if (!authUser) throw new Error('인증 정보를 가져오지 못했습니다.');

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        const role = profile?.role || 'vendor';

        setCurrentUser({
          id: authUser.id,
          email: authUser.email,
          ...profile,
          role: role,
        });

        // Redirect based on role
        router.push(role === 'admin' ? '/admin' : '/vendor');
    } catch (err: any) {
        let msg = err.message || '로그인에 실패했습니다.';
        if (msg.includes('Invalid login credentials')) {
             msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (msg === 'TIMEOUT') {
             msg = '서버 응답 시간이 초과되었습니다. 다시 시도해 주세요.';
        }
        setErrorMsg(msg);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isDataLoading && currentUser) {
      return (
          <div className={styles.screen}>
              <div className={styles.premiumCard}>
                   <div className={styles.iconCircle}>
                      <ShieldCheck size={32} />
                   </div>
                   <h1>이미 접속 중입니다</h1>
                   <p className={styles.sub}>이미 <strong>{currentUser.email}</strong> 계정으로 로그인되어 있습니다.</p>
                   
                   <div className={styles.actionGroup}>
                      <button 
                          onClick={() => router.push(currentUser.role === 'admin' ? '/admin' : '/vendor')}
                          className={styles.primaryBtn}
                      >
                          대시보드 바로가기
                      </button>
                      <button 
                          onClick={async () => {
                              await supabase.auth.signOut();
                              window.location.reload();
                          }}
                          className={styles.secondaryBtn}
                      >
                          다른 계정으로 로그인
                      </button>
                   </div>
                   <Link href="/" className={styles.backLink}>
                      <ArrowLeft size={16} /> 메인으로 돌아가기
                   </Link>
              </div>
          </div>
      );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.premiumCard}>
        <Link href="/" className={styles.logoGroup}>
          <div className={styles.logoBadge}>
            <img src="/images/logo.png" alt="Logo" />
          </div>
          <h1>이거 어디에서 팔아요?</h1>
          <p>안산유통상가 스마트 관리 시스템</p>
        </Link>

        <div className={styles.formHeader}>
          <h2>로그인</h2>
          <p>관리자 또는 파트너 계정으로 로그인하세요.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label><Mail size={14} /> 이메일 주소</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@store.com"
              required 
            />
          </div>

          <div className={styles.field}>
            <label><Lock size={14} /> 비밀번호</label>
            <div className={styles.inputWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required 
                />
                <button 
                    type="button" 
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <Loader2 className={styles.spin} size={20} /> : '로그인'}
          </button>
        </form>

        {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}
        
        <div className={styles.cardFooter}>
          <p>© 2026 안산유통단지 스마트 시스템</p>
          <div className={styles.footerLinks}>
            <Link href="/register">입점신청</Link>
            <span className={styles.dot}>•</span>
            <Link href="/">홈페이지</Link>
          </div>
        </div>
      </div>
      
      <div className={styles.bgDecoration}>
         <div className={styles.blob1}></div>
         <div className={styles.blob2}></div>
      </div>
    </div>
  );
}
