'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, CATEGORY_LABELS, StoreCategory } from '@/types';
import { useData } from '@/context/DataContext';
import styles from './vendor.module.css';
import adminStyles from '../admin/admin.module.css';
import {
    Store as StoreIcon,
    MapPin,
    CheckCircle2,
    Clock,
    Edit2,
    Trash2,
    X,
    ImageIcon,
    Upload,
    Plus,
    ExternalLink,
    Save,
    ArrowLeft,
    LogOut
} from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboard() {
    const { stores, currentUser, updateStore, setCurrentUser, isLoading: isDataLoading } = useData();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Partial<Store>>({});
    const [tempTag, setTempTag] = useState('');

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [newStoreData, setNewStoreData] = useState({
        storeName: '',
        category: 'etc' as StoreCategory,
        dong: '',
        ho: '',
        phone: ''
    });

    const handleRegisterStore = async () => {
        if (!newStoreData.storeName || !newStoreData.dong || !newStoreData.ho) {
            alert('⚠️ 모든 필수 정보를 입력해 주세요.');
            return;
        }

        alert('⚙️ 매장 정보를 시스템에 안전하게 등록하고 있습니다.\n잠시만 기다려 주세요...');
        
        const { supabase } = require('@/lib/supabase');
        const locationString = `${newStoreData.dong}동 ${newStoreData.ho}호`;
        const initialStoreData: any = {
            vendor_id: currentUser.id,
            vendor_email: currentUser.email,
            store_name: newStoreData.storeName,
            category: newStoreData.category,
            phone: newStoreData.phone,
            is_verified: false,
            description: `${newStoreData.storeName} - 신규 등록 매장\n(위치: ${locationString})`,
            location: locationString,
            keywords: [newStoreData.storeName, '신규']
        };

        const insertWithSafety = async (data: any): Promise<any> => {
            const { error } = await supabase.from('stores').insert([data]);
            if (error && error.message.includes('column')) {
                const filteredData = { ...data };
                let fallbackDesc = data.description || '';
                
                if (error.message.includes('location') && 'location' in filteredData) {
                    delete filteredData.location;
                }
                if (error.message.includes('keywords') && 'keywords' in filteredData) {
                    fallbackDesc += `\n[태그: ${filteredData.keywords.join(', ')}]`;
                    delete filteredData.keywords;
                }
                
                if (Object.keys(filteredData).length === Object.keys(data).length) throw error;
                return insertWithSafety({ ...filteredData, description: fallbackDesc.trim() });
            }
            if (error) throw error;
            return true;
        };

        try {
            await insertWithSafety(initialStoreData);
            alert('✅ 축하합니다! 매장 등록이 완료되었습니다.\n이제 대시보드에서 정보를 관리하실 수 있습니다.');
            setShowRegisterModal(false);
            window.location.reload();
        } catch (err: any) {
            console.error('등록 실패:', err);
            alert(`❌ 등록 중 문제가 발생했습니다.\n\n오류: ${err.message || '데이터베이스 통신 오류'}`);
        }
    };

    // Find the store belonging to this vendor by id
    const activeStore = stores.find(s => s.vendor_id === currentUser?.id);

    useEffect(() => {
        if (!isDataLoading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, isDataLoading, router]);

    const handleLogout = () => {
        setCurrentUser(null);
        router.push('/');
    };

    const startEdit = () => {
        setEditValues({ ...activeStore });
        setIsEditing(true);
    };

    const handleSave = () => {
        if (activeStore) {
            // Only update fields that exist in the DB (excluding keywords)
            const { keywords, ...saveData } = editValues as any;
            updateStore(activeStore.id, saveData);
            setIsEditing(false);
            alert('매장 정보가 성공적으로 수정되었습니다.');
        }
    };


    if (isDataLoading || (!currentUser && isDataLoading)) {
        return <div className={styles.loading}>정보를 불러오는 중...</div>;
    }

    if (!currentUser) {
        return (
            <div className={styles.loading}>
                <p>로그인이 필요한 서비스입니다.</p>
                <Link href="/login" className={styles.logoutBtn} style={{ marginTop: '1rem' }}>로그인 페이지로</Link>
            </div>
        );
    }

    if (!activeStore) {
        return (
            <div className={styles.vendorContainer} style={{ backgroundColor: '#0f172a' }}>
                 <nav className={styles.topNav} style={{ borderBottom: '1px solid #1e293b' }}>
                    <Link href="/" className={styles.backLink} style={{ color: '#94a3b8' }}>
                        <ArrowLeft size={18} /> 서비스 메인으로
                    </Link>
                    <div className={styles.navRight}>
                        <span className={styles.userEmail} style={{ color: '#f1f5f9' }}>{currentUser.email} (입점 신청 중)</span>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            <LogOut size={16} /> 로그아웃
                        </button>
                    </div>
                </nav>
                <div className={styles.mainContent}>
                    <div className={adminStyles.modalContent} style={{ 
                        maxWidth: '700px', 
                        margin: '4rem auto', 
                        textAlign: 'center', 
                        padding: '4rem', 
                        backgroundColor: '#1e293b',
                        borderRadius: '2rem',
                        border: '4px solid #334155',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ backgroundColor: '#f59e0b', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <Plus size={40} color="#0f172a" />
                        </div>
                        
                        <h1 style={{ color: '#fbbf24', fontSize: '2.2rem', fontWeight: '900', marginBottom: '1.5rem' }}>
                            매장 등록이 필요합니다
                        </h1>
                        
                        <div style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '1.5rem', marginBottom: '2.5rem', textAlign: 'left', border: '1px solid #334155' }}>
                            <p style={{ color: '#f8fafc', fontSize: '1.2rem', lineHeight: '1.6' }}>
                                📢 "{currentUser.email}" 계정에 등록된 매장이 없습니다.<br/>
                                <strong>안산유통상가 스마트 명부</strong>에 매장을 등록하고 대시보드를 활성화하세요!
                            </p>
                        </div>

                        <button 
                            className={styles.loginBtn} 
                            onClick={() => setShowRegisterModal(true)}
                            style={{ 
                                padding: '1.2rem 3rem', 
                                fontSize: '1.3rem', 
                                backgroundColor: '#fbbf24', 
                                color: '#0f172a',
                                fontWeight: '800',
                                borderRadius: '1rem',
                                width: '100%',
                                cursor: 'pointer',
                                border: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            내 매장 정보 입력하기 (정식 양식)
                        </button>
                    </div>
                </div>

                {/* Registration Modal (The Original Way) */}
                {showRegisterModal && (
                    <div className={adminStyles.modalOverlay} style={{ zIndex: 2000 }}>
                        <div className={adminStyles.modalContent} style={{ maxWidth: '500px', width: '90%', borderRadius: '1.5rem', overflow: 'hidden', backgroundColor: '#fff' }}>
                            <header className={adminStyles.modalHeader} style={{ background: '#f59e0b', color: '#0f172a', padding: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>새 매장 등록하기</h2>
                                    <p style={{ color: 'rgba(15, 23, 42, 0.7)', margin: '0.2rem 0 0' }}>정확한 정보를 입력해 주세요.</p>
                                </div>
                                <button onClick={() => setShowRegisterModal(false)} className={adminStyles.closeBtn} style={{ color: '#0f172a', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </header>
                            
                            <div className={adminStyles.modalBody} style={{ padding: '2rem' }}>
                                <div className={adminStyles.infoGrid} style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                    <div className={adminStyles.infoItem}>
                                        <label style={{ fontSize: '1rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>매장명</label>
                                        <input 
                                            className={adminStyles.modalInput} 
                                            placeholder="예: 극동계전, 중앙통상"
                                            value={newStoreData.storeName}
                                            onChange={e => setNewStoreData({...newStoreData, storeName: e.target.value})}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className={adminStyles.infoItem}>
                                            <label style={{ fontSize: '1rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>동 (상가 번호)</label>
                                            <input 
                                                className={adminStyles.modalInput} 
                                                placeholder="예: 12"
                                                value={newStoreData.dong}
                                                onChange={e => setNewStoreData({...newStoreData, dong: e.target.value})}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                        <div className={adminStyles.infoItem}>
                                            <label style={{ fontSize: '1rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>호 (상세 위치)</label>
                                            <input 
                                                className={adminStyles.modalInput} 
                                                placeholder="예: 104"
                                                value={newStoreData.ho}
                                                onChange={e => setNewStoreData({...newStoreData, ho: e.target.value})}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                    </div>

                                    <div className={adminStyles.infoItem}>
                                        <label style={{ fontSize: '1rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>업종</label>
                                        <select 
                                            className={adminStyles.modalSelect}
                                            value={newStoreData.category}
                                            onChange={e => setNewStoreData({...newStoreData, category: e.target.value as StoreCategory})}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                        >
                                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className={adminStyles.infoItem}>
                                        <label style={{ fontSize: '1rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>연락처 (선택)</label>
                                        <input 
                                            className={adminStyles.modalInput} 
                                            placeholder="예: 031-491-xxxx"
                                            value={newStoreData.phone}
                                            onChange={e => setNewStoreData({...newStoreData, phone: e.target.value})}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className={adminStyles.modalFooter} style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
                                <button 
                                    className={adminStyles.saveBtn} 
                                    style={{ flex: 1, padding: '1rem', background: '#f59e0b', color: '#0f172a', fontWeight: '800', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                                    onClick={handleRegisterStore}
                                >
                                    등록 완료하기
                                </button>
                                <button 
                                    className={adminStyles.cancelBtn} 
                                    style={{ flex: 0.5, padding: '1rem', background: '#e2e8f0', color: '#475569', fontWeight: '700', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                                    onClick={() => setShowRegisterModal(false)}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }


    return (
        <div className={styles.vendorContainer}>
            <nav className={styles.topNav}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={18} /> 서비스 메인으로
                </Link>
                <div className={styles.navRight}>
                    <span className={styles.userEmail}>{currentUser.email} (입점주)</span>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={16} /> 로그아웃
                    </button>
                </div>
            </nav>

            <div className={styles.mainContent}>
                <div className={adminStyles.modalContent} style={{ maxWidth: '900px', margin: '0 auto', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                    <header className={adminStyles.modalHeader}>
                        <div>
                            <h2>{isEditing ? '매장 정보 수정' : '매장 상세 정보'}</h2>
                            <p>가입·등록번호: {new Date(activeStore.created_at || Date.now()).toISOString().split('T')[0].replace(/-/g, '')}-{activeStore.id.replace('s_', '').slice(-4)}</p>
                        </div>
                    </header>

                    <div className={adminStyles.modalBody}>
                        {!activeStore.is_verified && (
                            <div className={styles.pendingBanner}>
                                <Clock size={16} /> 현재 관리자의 입점 승인을 기다리고 있습니다. 승인 후 검색 결과에 노출됩니다.
                            </div>
                        )}

                        <div className={adminStyles.modalSplit}>
                            {/* Image Column */}
                            <div className={adminStyles.imageSection}>
                                <label className={adminStyles.sectionLabel}><ImageIcon size={14} /> 매장 외관 사진</label>
                                <div className={adminStyles.photoContainer}>
                                    {isEditing ? (
                                        <div className={adminStyles.uploadBox}>
                                            <div className={adminStyles.previewContainer} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                {editValues.image_url ? (
                                                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <img src={editValues.image_url} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }} />
                                                    </div>
                                                ) : (
                                                    <div className={adminStyles.placeholderImg} style={{ flex: 1 }}>
                                                        <Upload size={32} />
                                                        <p>새 사진 업로드</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                id="vendorStoreImageUpload"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            setEditValues({ ...editValues, image_url: event.target?.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <button
                                                className={adminStyles.uploadTrigger}
                                                onClick={() => document.getElementById('vendorStoreImageUpload')?.click()}
                                                style={{ marginTop: '1rem' }}
                                            >
                                                이미지 선택
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={adminStyles.photoDisplay} style={{ width: '100%', height: '100%' }}>
                                            {activeStore.image_url ? (
                                                <img src={activeStore.image_url} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }} />
                                            ) : (
                                                <div className={adminStyles.placeholderImgLarge}>
                                                    <ImageIcon size={48} />
                                                    <p>매장 사진이 등록되지 않았습니다.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Column */}
                            <div className={adminStyles.formSection}>
                                <section className={adminStyles.detailSection}>
                                    <h4><StoreIcon size={16} /> 매장 기본 정보</h4>
                                    <div className={adminStyles.infoGrid}>
                                        <div className={adminStyles.infoItem}>
                                            <label>매장명</label>
                                            {isEditing ? (
                                                <input
                                                    className={adminStyles.modalInput}
                                                    value={editValues.store_name || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, store_name: e.target.value })}
                                                />
                                            ) : <p>{activeStore.store_name}</p>}
                                        </div>
                                        <div className={adminStyles.infoItem}>
                                            <label>위치/상세주소</label>
                                            {isEditing ? (
                                                <input
                                                    className={adminStyles.modalInput}
                                                    value={editValues.location || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                                                />
                                            ) : <p>{activeStore.location}</p>}
                                        </div>
                                        <div className={adminStyles.infoItem}>
                                            <label>대표 연락처</label>
                                            {isEditing ? (
                                                <input
                                                    className={adminStyles.modalInput}
                                                    value={editValues.phone || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                                                    placeholder="031-000-0000"
                                                />
                                            ) : <p>{activeStore.phone || '등록되지 않음'}</p>}
                                        </div>
                                        <div className={adminStyles.infoItem}>
                                            <label>영업 시간</label>
                                            {isEditing ? (
                                                <input
                                                    className={adminStyles.modalInput}
                                                    value={editValues.operating_hours || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, operating_hours: e.target.value })}
                                                    placeholder="예: 평일 09:00 - 18:00 (토요일 휴무)"
                                                />
                                            ) : <p>{activeStore.operating_hours || '정보 없음'}</p>}
                                        </div>
                                        <div className={adminStyles.infoItem}>
                                            <label>업종 카테고리</label>
                                            {isEditing ? (
                                                <select
                                                    className={adminStyles.modalSelect}
                                                    value={editValues.category}
                                                    onChange={(e) => setEditValues({ ...editValues, category: e.target.value as StoreCategory })}
                                                >
                                                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            ) : <p>{CATEGORY_LABELS[activeStore.category]}</p>}
                                        </div>
                                        <div className={adminStyles.infoItem}>
                                            <label>인증 상태</label>
                                            <p>
                                                {activeStore.is_verified ? (
                                                    <span className={styles.verifiedText}><CheckCircle2 size={14} /> 인증 완료</span>
                                                ) : (
                                                    <span className={styles.pendingText}><Clock size={14} /> 승인 대기 중</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section className={adminStyles.detailSection}>
                                    <h4><Plus size={16} /> 매장 상세 소개</h4>
                                    {isEditing ? (
                                        <textarea
                                            className={adminStyles.modalInput}
                                            style={{ width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                                            value={editValues.description || ''}
                                            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                            placeholder="매장의 특징이나 주요 취급 품목을 자세히 적어주세요. (예: 삼성 전동공구 대리점, 각종 볼트 제작)"
                                        />
                                    ) : (
                                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                                            <p style={{ lineHeight: '1.7', color: '#475569', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                                                {activeStore.description || '아직 등록된 매장 설명이 없습니다.'}
                                            </p>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>

                        <section className={adminStyles.modalFooterActions}>
                            <div className={adminStyles.actionGrid}>
                                {isEditing ? (
                                    <>
                                        <button className={adminStyles.saveBtn} onClick={handleSave}>
                                            <Save size={16} /> 모든 변경사항 저장
                                        </button>
                                        <button className={adminStyles.cancelBtn} onClick={() => setIsEditing(false)}>
                                            취소
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className={adminStyles.actionBtn} onClick={startEdit}>
                                            <Edit2 size={16} /> 매장 정보/사진 수정
                                        </button>
                                        <button
                                            className={adminStyles.actionBtn}
                                            onClick={() => window.open(`/store/${activeStore.id}`, '_blank')}
                                            disabled={!activeStore.is_verified}
                                            title={!activeStore.is_verified ? "승인 완료 후 활성화됩니다." : ""}
                                        >
                                            <ExternalLink size={16} /> 매장 페이지 열기
                                        </button>
                                        <button className={`${adminStyles.actionBtn} ${adminStyles.danger}`}>
                                            <Trash2 size={16} /> 매장 정보 삭제
                                        </button>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
