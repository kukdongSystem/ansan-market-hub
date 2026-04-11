'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Home, ArrowLeft } from 'lucide-react';
import styles from './login.module.css';
import Link from 'next/link';
import { useData } from '@/context/DataContext';

export default function LoginPage() {
  const { accounts, setCurrentUser } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Check against live accounts from context
    setTimeout(() => {
      const account = accounts.find(acc => acc.email === email && acc.password === password);
      
      if (account) {
        setCurrentUser(account);
        if (account.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/vendor');
        }
      } else {
        setMessage('아이디 또는 비밀번호가 틀렸습니다.');
      }
      setIsLoading(false);
    }, 1000);
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
              placeholder="admin@ansan.com"
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
        
        <div className={styles.testAccountInfo}>
            <p><strong>테스트 계정:</strong></p>
            {accounts.map(acc => (
                <p key={acc.email}>• {acc.role === 'admin' ? '관리자' : '입점주'}: {acc.email} / {acc.password}</p>
            ))}
        </div>

        <div className={styles.footer}>
          <p>© 2026 안산유통단지 AI 관제센터</p>
        </div>
      </div>
    </div>
  );
}
