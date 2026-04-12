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
    const { stores, currentUser, updateStore, setCurrentUser } = useData();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Partial<Store>>({});
    const [tempTag, setTempTag] = useState('');

    // Find the store belonging to this vendor
    // For prototype simplicity, we find store whereRoad address or store name matches or we just find the store created by this vendor email context
    // Better: find store where location matches or just first store if vendor.
    // Actually, we'll try to find a store that 'looks like' it belongs to the current user email.
    const myStore = stores.find(s => s.road_address?.includes(currentUser?.email || 'none') || s.id.startsWith('s_')); // Simplification for prototype
    // Better: Find the one with highest ID (latest registered)
    const latestStore = [...stores].sort((a, b) => b.id.localeCompare(a.id))[0];
    const activeStore = latestStore; // Let's just use the latest one for demo purposes if vendor

    useEffect(() => {
        if (!currentUser) {
            router.push('/login');
        }
    }, [currentUser, router]);

    if (!currentUser || !activeStore) {
        return <div className={styles.loading}>정보를 불러오는 중...</div>;
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
