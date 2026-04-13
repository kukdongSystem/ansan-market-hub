'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, MapPin, Building2, UserPlus, Briefcase, X } from 'lucide-react';
import { CATEGORY_LABELS, StoreCategory } from '@/types';
import { supabase } from '@/lib/supabase';
import { useData } from '@/context/DataContext';
import styles from '../login/login.module.css';

const ADDRESS_MAP: Record<string, string> = {
  '지상 (1~23동)': '안산시 단원구 산단로 326 (안산유통상가 1차)',
  '지하 (가~사열)': '안산시 단원구 산단로 326 (안산유통상가 1차)',
  '편익 A동': '안산시 단원구 산단로 342 (안산유통상가 1차)',
  '편익 B동': '안산시 단원구 풍전로 7 (안산유통상가 1차)'
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    storeName: '',
    category: '' as StoreCategory | '',
    dong: '',
    ho: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addStore, addAccount } = useData();
  const router = useRouter();

  const currentAddress = formData.dong ? ADDRESS_MAP[formData.dong] : '구역 선택 시 주소 자동 표시';
  
  // Dynamic placeholder for Ho based on selection
  const getHoPlaceholder = () => {
    if (formData.dong === '지하 (가~사열)') return '예: 가열 101호';
    if (formData.dong === '지상 (1~23동)') return '예: 1동 101호';
    if (formData.dong.includes('편익')) return '예: 1층 101호';
    return '예: 101호';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dong || !formData.ho || !formData.category) {
        alert('모든 필수 정보를 입력해 주세요.');
        return;
    }
    if (formData.password !== formData.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    setIsLoading(true);

    try {
        // 1. Sign up user (or handle existing)
        let userId = '';
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });

        if (signUpError) {
            if (signUpError.message.includes('already registered')) {
                // If already registered, we try to get the user ID via sign in to proceed
                // In a real app, we'd confirm with the user, but for this specific request:
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (signInError) throw new Error('사용 중인 이메일입니다. 비밀번호가 틀렸거나 인증이 필요합니다.');
                userId = signInData.user?.id || '';
            } else {
                throw signUpError;
            }
        } else {
            userId = signUpData.user?.id || '';
        }

        if (!userId) throw new Error('계정 정보를 확인할 수 없습니다.');

        // 2. Create/Update Profile (Role is kept or updated to vendor)
        await supabase.from('profiles').upsert([{
            id: userId,
            role: 'vendor', // Ensure they have vendor capability
            unit_info: `${formData.dong} ${formData.ho}`
        }], { onConflict: 'id' });

        // 3. Create Store
        const { error: storeError } = await supabase.from('stores').insert([{
            vendor_id: userId,
            store_name: formData.storeName,
            category: formData.category as StoreCategory,
            location: `${formData.dong} ${formData.ho}`,
            road_address: currentAddress,
            description: `${formData.storeName}입니다. 신규 신청된 매장입니다.`,
            is_verified: false
        }]);
        
        if (storeError) throw storeError;

        setIsSuccess(true);
    } catch (err: any) {
        console.error("Registration error:", err);
        
        // 에러 메시지 한글 번역
        let errorMessage = '등록 중 오류가 발생했습니다.';
        const rawMessage = err.message || '';

        if (rawMessage.includes('User already registered')) {
            errorMessage = '이미 등록된 이메일 주소입니다. 로그인을 시도하거나 다른 이메일을 사용해 주세요.';
        } else if (rawMessage.includes('Password should be at least 6 characters')) {
            errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
        } else if (rawMessage.includes('Invalid email')) {
            errorMessage = '유효하지 않은 이메일 형식입니다.';
        } else {
            errorMessage = rawMessage || errorMessage;
        }

        alert(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ textAlign: 'center' }}>
                <h1 style={{ color: 'white', marginBottom: '1rem' }}>🎉 신청 완료</h1>
                <p style={{ color: '#94a3b8' }}>{formData.dong} {formData.ho} 신청 완료.</p>
                <Link href="/login" className={styles.loginBtn} style={{ marginTop: '2rem', display: 'block' }}>로그인</Link>
            </div>
        </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.cardWide} animate-fade-in`}>
        <header className={styles.headerCompact}>
          <div className={styles.logoSmall}>
            <img src="/images/logo.png" alt="Logo" style={{ height: '24px', width: '24px', objectFit: 'contain', marginRight: '0.4rem', borderRadius: '4px' }} />
            ANSAN MARKET HUB
          </div>
          <h2>업체 신규 등록</h2>
        </header>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Left Column: Location & Store */}
          <div className={styles.formCol}>
            <h3 className={styles.colTitle}><MapPin size={16}/> 위치 및 매장 정보</h3>
            <div className={styles.inputGroup}>
                <label className={styles.labelSmall}>단지/구역 선택</label>
                <select 
                    className={styles.selectSmall}
                    value={formData.dong}
                    onChange={(e) => setFormData({...formData, dong: e.target.value})}
                    required
                >
                    <option value="" className={styles.optionItem}>구역 선택</option>
                    {Object.keys(ADDRESS_MAP).map(d => (
                        <option key={d} value={d} className={styles.optionItem}>{d}</option>
                    ))}
                </select>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.labelSmall}>자동 지정 주소</label>
                <div className={styles.addressDisplaySmall}>
                    {currentAddress}
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.labelSmall}>상세 호수</label>
                <input 
                    type="text" 
                    className={styles.inputSmall} 
                    value={formData.ho}
                    onChange={(e) => setFormData({...formData, ho: e.target.value})}
                    placeholder={getHoPlaceholder()}
                    required 
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.labelSmall}>매장명</label>
                <input 
                type="text" 
                className={styles.inputSmall} 
                value={formData.storeName}
                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                placeholder="사업자등록상 명칭"
                required 
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.labelSmall}>업종 카테고리</label>
                <select 
                    className={styles.selectSmall}
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as StoreCategory})}
                    required
                >
                    <option value="" className={styles.optionItem}>상세 업종 선택</option>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key} className={styles.optionItem}>{label}</option>
                    ))}
                </select>
            </div>
          </div>

          {/* Right Column: Account & Security */}
          <div className={styles.formCol}>
            <h3 className={styles.colTitle}><Building2 size={16}/> 계정 설정</h3>
            <div className={styles.inputGroup}>
                <label className={styles.labelSmall}>로그인용 이메일</label>
                <input 
                type="email" 
                className={styles.inputSmall} 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="id@example.com"
                required 
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.labelSmall}>비밀번호</label>
                <div className={styles.passwordWrapper}>
                    <input 
                    type={showPassword ? "text" : "password"} 
                    className={styles.inputSmall} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="6자 이상"
                    required 
                    />
                    <button type="button" className={styles.eyeBtnSmall} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.labelSmall}>비밀번호 확인</label>
                <div className={styles.passwordWrapper}>
                    <input 
                    type={showPassword ? "text" : "password"} 
                    className={styles.inputSmall} 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="비밀번호 재입력"
                    required 
                    />
                    <button type="button" className={styles.eyeBtnSmall} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>
            
            <div className={styles.formFooterCompact}>
                <button type="submit" className={styles.submitBtnWide} disabled={isLoading}>
                    {isLoading ? '신청 처리 중...' : '매장 등록 신청'}
                </button>
                <Link href="/" className={styles.exitBtnWide}>취소 및 나가기</Link>
                <p className={styles.helpText}>신청 후 관리자 승인이 필요합니다.</p>
            </div>
          </div>
        </form>

        <div className={styles.footerCompact}>
          <p className={styles.policyWarning}>※ 본 서비스는 안산유통상가 주소지 내 실제 입점자만 등록 가능하며, 허위 정보 입력 시 승인이 거절될 수 있습니다.</p>
          이미 계정이 있나요? <Link href="/login">관리자/입점주 로그인</Link>
        </div>
      </div>
    </div>
  );
}
