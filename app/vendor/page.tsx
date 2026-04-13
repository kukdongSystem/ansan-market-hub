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

    // Find the store belonging to this vendor by id
    const activeStore = stores.find(s => s.vendor_id === currentUser?.id);

    useEffect(() => {
        if (!isDataLoading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, isDataLoading, router]);

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
            <div className={styles.vendorContainer}>
                <nav className={styles.topNav}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={18} /> 서비스 메인으로
                    </Link>
                    <div className={styles.navRight}>
                        <span className={styles.userEmail}>{currentUser.email} ({currentUser.role === 'admin' ? '시스템 관리자' : currentUser.role === 'sub_admin' ? '부관리자' : '입점주'})</span>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            <LogOut size={16} /> 로그아웃
                        </button>
                    </div>
                </nav>
                <div className={styles.mainContent}>
                    <div className={adminStyles.modalContent} style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3.5rem', border: '2px dashed #f59e0b' }}>
                        <div style={{ backgroundColor: '#fef3c7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <StoreIcon size={40} color="#d97706" />
                        </div>
                        <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '1.5rem' }}>🚨 매장 등록이 필요합니다 🚨</h1>
                        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                            <p style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                "{currentUser.email}" 계정은 아직 매장이 연결되지 않았습니다.
                            </p>
                            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                                부관리자 권한으로 매장을 직접 등록하고 관리를 시작하세요!
                            </p>
                        </div>
                        <button 
                            className={styles.loginBtn} 
                            onClick={() => {
                                const storeName = prompt('✨ 등록하실 매장명을 입력해주세요 (예: 극동계전)');
                                if (!storeName) return;
                                const location = prompt('📍 매장 위치를 입력해주세요 (예: 19동 104호)');
                                if (!location) return;
                                
                                alert('매장 정보를 생성합니다. 잠시만 기다려 주세요...');
                                
                                const { supabase } = require('@/lib/supabase');
                                supabase.from('stores').insert([{
                                    vendor_id: currentUser.id,
                                    vendor_email: currentUser.email,
                                    store_name: storeName,
                                    category: 'etc',
                                    location: location,
                                    keywords: [storeName],
                                    description: `${storeName}입니다.`,
                                    is_verified: false
                                }]).then(({ error }: any) => {
                                    if (error) alert('❌ 오류 발생: ' + error.message);
                                    else {
                                        alert('✅ 매장 등록 성공! 대시보드로 이동합니다.');
                                        window.location.reload();
                                    }
                                });
                            }}
                            style={{ 
                                padding: '1.2rem 3rem', 
                                fontSize: '1.2rem', 
                                backgroundColor: '#f59e0b', 
                                color: 'black',
                                fontWeight: 'bold',
                                borderRadius: '1rem',
                                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
                            }}
                        >
                             내 매장 지금 바로 등록하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const startEdit = () => {
        setEditValues({ ...activeStore });
        setIsEditing(true);
    };

    const handleSave = () => {
        updateStore(activeStore.id, editValues);
        setIsEditing(false);
        alert('매장 정보가 성공적으로 수정되었습니다.');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        router.push('/');
    };

    const addTag = () => {
        const tag = tempTag.trim();
        if (tag && !editValues.keywords?.includes(tag)) {
            setEditValues({
                ...editValues,
                keywords: [...(editValues.keywords || []), tag]
            });
        }
        setTempTag('');
    };

    const removeTag = (tagToRemove: string) => {
        setEditValues({
            ...editValues,
            keywords: editValues.keywords?.filter(t => t !== tagToRemove)
        });
    };

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
                                                    <span className={styles.verifiedText}><CheckCircle2 size={14} /> 인증 완료 된 매장</span>
                                                ) : (
                                                    <span className={styles.pendingText}><Clock size={14} /> 승인 대기 중</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section className={adminStyles.detailSection}>
                                    <h4><Plus size={16} /> 취급 품목 및 키워드</h4>
                                    {isEditing ? (
                                        <div className={adminStyles.tagInputContainer}>
                                            <div className={adminStyles.tagListEdit}>
                                                {editValues.keywords?.map((t, idx) => (
                                                    <span key={idx} className={adminStyles.modalTagEdit}>
                                                        #{t}
                                                        <button onClick={() => removeTag(t)} className={adminStyles.tagRemoveBtn}>
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className={adminStyles.tagInputWrapper}>
                                                <input
                                                    className={adminStyles.tagInput}
                                                    placeholder="키워드 입력..."
                                                    value={tempTag}
                                                    onChange={(e) => setTempTag(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                                />
                                                <button className={adminStyles.tagAddBtn} onClick={addTag}>
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={adminStyles.tagList}>
                                            {activeStore.keywords?.map((t, idx) => (
                                                <span key={idx} className={adminStyles.modalTag}>#{t}</span>
                                            ))}
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
