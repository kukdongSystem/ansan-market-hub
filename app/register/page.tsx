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

    // 버전: 1.0.4 (이미 계정이 있는 경우 처리 강화)
    try {
        console.log("매장 등록 시작:", formData.email);
        
        let userId = '';
        
        // 1. 신규 가입 시도
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });

        if (signUpError) {
            const rawMsg = signUpError.message.toLowerCase();
            // 계정이 이미 있는 경우 (부관리자 등)
            if (rawMsg.includes('already') || rawMsg.includes('이미') || rawMsg.includes('exists')) {
                console.log("기존 계정 발견, 로그인을 시도하여 연결합니다.");
                
                // 로그인을 통해 진짜 내 계정인지 확인
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                
                if (signInError) {
                    throw new Error('이미 등록된 이메일입니다. 기존 계정의 비밀번호를 입력해 주세요. (관리자 문의: 031-xxx-xxxx)');
                }
                userId = signInData.user?.id || '';
            } else {
                throw new Error(`회원가입 요청 실패: ${signUpError.message}`);
            }
        } else {
            userId = signUpData.user?.id || '';
        }

        if (!userId) throw new Error('사용자 인증 정보를 가져올 수 없습니다.');

        // 2. 프로필 및 매장 정보 등록 (계정이 이미 있어도 정보는 업데이트/추가)
        try {
            await supabase.from('profiles').upsert([{
                id: userId,
                role: 'vendor', // 일반 업체로 등록 (기존 부관리자 권한은 유지될 수 있도록 DB 설정 필요 가능성 있으나 로직상 진행)
                unit_info: `${formData.dong} ${formData.ho}`
            }], { onConflict: 'id' });
        } catch (e) {
            console.warn("프로필 업데이트 생략");
        }

        // 매장 정보 저장
        const storeData: any = {
            vendor_id: userId,
            store_name: formData.storeName,
            category: formData.category as StoreCategory,
            road_address: currentAddress,
            location: `${formData.dong} ${formData.ho}`,
            description: `${formData.storeName} - 신규 신청 매장입니다.`,
            is_verified: false,
            keywords: [formData.storeName, formData.category]
        };

        const { error: sError } = await supabase.from('stores').insert([storeData]);

        if (sError) {
            // 컬럼 매칭 오류 등 예외 처리 (location 컬럼 유무 확인)
            if (sError.message.includes('column')) {
                const { location, ...restData } = storeData;
                const { error: sError2 } = await supabase.from('stores').insert([restData]);
                if (sError2) throw sError2;
            } else {
                throw sError;
            }
        }

        console.log("모든 프로세스 완료");
        setIsSuccess(true);
    } catch (err: any) {
        console.error("최종 에러:", err);
        alert(err.message || '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
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
