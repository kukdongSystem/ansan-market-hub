'use client';

import { useState, useEffect } from 'react';
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
    LogOut,
    Home,
    MessageSquare,
    BarChart3,
    Settings
} from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboard() {
    const { stores, currentUser, updateStore, setCurrentUser, isLoading: isDataLoading } = useData();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editValues, setEditValues] = useState<Partial<Store>>({});
    const [tempTag, setTempTag] = useState('');

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [newStoreData, setNewStoreData] = useState({
        storeName: '',
        category: 'etc' as StoreCategory,
        dong: '',
        ho: '',
        phone: '',
        image_url: ''
    });

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

    const handleRegisterStore = async () => {
        if (!newStoreData.storeName || !newStoreData.dong || !newStoreData.ho) {
            alert('⚠️ 모든 필수 정보를 입력해 주세요.');
            return;
        }

        try {
            const { supabase } = require('@/lib/supabase');
            const locationString = `${newStoreData.dong}동 ${newStoreData.ho}호`;
            
            const dbData: any = {
                owner_id: currentUser.id,
                name: newStoreData.storeName,
                category: newStoreData.category,
                phone: newStoreData.phone,
                is_verified: false,
                description: `${newStoreData.storeName} - 신규 등록 매장\n(상세위치: ${locationString})`,
                image_url: newStoreData.image_url || ''
            };

            const { error } = await supabase.from('stores').insert([dbData]);
            if (error) throw error;

            alert('✅ 매장 등록이 완료되었습니다!');
            setShowRegisterModal(false);
            window.location.reload();
        } catch (err: any) {
            console.error('등록 실패:', err);
            alert(`❌ 등록 중 문제가 발생했습니다.\n\n오류: ${err.message}`);
        }
    };

    const handleSave = async () => {
        if (activeStore) {
            const saveData: any = { ...editValues };
            
            // Database field mapping normalization
            if (saveData.store_name) {
                saveData.name = saveData.store_name;
                delete saveData.store_name;
            }
            if (saveData.vendor_id) {
                saveData.owner_id = saveData.vendor_id;
                delete saveData.vendor_id;
            }
            if (saveData.location === undefined && activeStore.location === null) {
                // If location is null, we might want to allow editing it
            }
            
            await updateStore(activeStore.id, saveData);
            setIsEditing(false);
            setShowDetailModal(false);
            alert('매장 정보가 성공적으로 수정되었습니다.');
        }
    };

    if (isDataLoading) return <div className={styles.loading}>정보를 불러오는 중...</div>;
    if (!currentUser) return null;

    return (
        <div className={styles.vendorDashboard}>
            {/* Sidebar (좌측 화면 구성) */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={16} /> <span className={styles.logoText}>안산유통상가</span>
                    </Link>
                </div>

                <nav className={styles.navSection}>
                    <button className={`${styles.sideNavItem} ${styles.active}`}><Home size={18}/> 대시보드</button>
                    <button className={styles.sideNavItem}><BarChart3 size={18}/> 운영 통계</button>
                    <button className={styles.sideNavItem}><MessageSquare size={18}/> 고객 문의</button>
                    <button className={styles.sideNavItem}><Settings size={18}/> 계정 설정</button>
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.sideNavItem} style={{marginBottom: '1rem'}}>
                        <LogOut size={18} /> 로그아웃
                    </button>
                    
                    {/* 하단 좌측 업체정보사진 (핵심 트리거) */}
                    {activeStore ? (
                        <button className={styles.storeProfileTrigger} onClick={() => setShowDetailModal(true)}>
                            {activeStore.image_url ? (
                                <img src={activeStore.image_url} alt="Store" className={styles.miniPhoto} />
                            ) : (
                                <div className={styles.placeholderMini}><StoreIcon size={20} /></div>
                            )}
                            <div className={styles.triggerText}>
                                <span className={styles.triggerName}>{activeStore.store_name}</span>
                                <span className={styles.triggerSub}>정보 관리하기</span>
                            </div>
                        </button>
                    ) : (
                        <button className={styles.storeProfileTrigger} onClick={() => setShowRegisterModal(true)}>
                            <div className={styles.placeholderMini}><Plus size={20} /></div>
                            <div className={styles.triggerText}>
                                <span className={styles.triggerName}>매장 등록</span>
                                <span className={styles.triggerSub}>새로운 시작</span>
                            </div>
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content Area (우측 작업 영역) */}
            <main className={styles.contentArea}>
                <header className={adminStyles.modalHeader} style={{ background: 'white', padding: '1.5rem 2.5rem' }}>
                    <div>
                        <h1 style={{fontSize: '1.6rem', fontWeight: 800, color: '#1e293b'}}>대시보드</h1>
                        <p style={{color: '#64748b'}}>{currentUser.email}님, 환영합니다.</p>
                    </div>
                </header>

                <div className={styles.dashboardMain}>
                    {!activeStore ? (
                         <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '30px', border: '2px dashed #e2e8f0' }}>
                            <div style={{ width: '80px', height: '80px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <StoreIcon size={40} color="#f59e0b" />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>아직 등록된 매장이 없습니다</h2>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>안산유통상가 스마트 명부에 매장을 등록하고 비즈니스를 시작해보세요.</p>
                            <button className={adminStyles.saveBtn} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }} onClick={() => setShowRegisterModal(true)}>매장 신규 등록하기</button>
                        </div>
                    ) : (
                        <div className={styles.welcomeGrid}>
                            <div className={styles.summaryCard}>
                                <h3 style={{fontWeight: 800, color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase'}}>내 매장 현황</h3>
                                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                    <div style={{fontSize: '2.5rem', fontWeight: 900}}>{activeStore.store_name}</div>
                                    <div style={{marginTop: '0.5rem'}}>
                                        {activeStore.is_verified ? (
                                            <span className={styles.verifiedText}><CheckCircle2 size={16} /> 정상 노출 중</span>
                                        ) : (
                                            <span className={styles.pendingText}><Clock size={16} /> 승인 대기 중</span>
                                        )}
                                    </div>
                                </div>
                                <p style={{marginTop: '1.5rem', color: '#64748b', lineHeight: 1.6}}>{activeStore.description?.split('\n')[0]}</p>
                            </div>

                            <div className={styles.summaryCard}>
                                <h3 style={{fontWeight: 800, color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase'}}>빠른 관리</h3>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                    <button onClick={() => setShowDetailModal(true)} style={{padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', cursor: 'pointer'}}>
                                        <Edit2 size={24} color="#3b82f6" />
                                        <span style={{fontWeight: 700}}>정보 수정</span>
                                    </button>
                                    <button onClick={() => window.open(`/store/${activeStore.id}`, '_blank')} style={{padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', cursor: 'pointer'}} disabled={!activeStore.is_verified}>
                                        <ExternalLink size={24} color="#10b981" />
                                        <span style={{fontWeight: 700}}>페이지 열기</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* --- Modals (상세/고급 편집) --- */}
            
            {/* Detail & Edit Modal (사용자님의 스크린샷 1, 2번 복구) */}
            {showDetailModal && activeStore && (
                <div className={adminStyles.modalOverlay} onClick={() => { if(!isEditing) setShowDetailModal(false); }}>
                    <div className={adminStyles.modalContent} style={{ maxWidth: '950px' }} onClick={e => e.stopPropagation()}>
                        <header className={adminStyles.modalHeader}>
                            <div>
                                <h2 style={{fontSize: '1.8rem'}}>{isEditing ? '매장 고급 편집' : '매장 상세 정보'}</h2>
                                <p style={{color: '#3b82f6', fontWeight: 700}}>가입·등록번호: {new Date(activeStore.created_at || Date.now()).toISOString().split('T')[0].replace(/-/g, '')}-{activeStore.id.slice(-4)}</p>
                            </div>
                            <button className={adminStyles.closeBtn} onClick={() => { setIsEditing(false); setShowDetailModal(false); }}>
                                <X size={24} />
                            </button>
                        </header>

                        <div className={adminStyles.modalBody} style={{ background: '#fff' }}>
                            <div className={adminStyles.modalSplit}>
                                {/* Image Column */}
                                <div className={adminStyles.imageSection}>
                                    <label className={adminStyles.sectionLabel}><ImageIcon size={14} /> 매장 외관 사진</label>
                                    <div className={adminStyles.photoContainer} style={{ height: '320px' }}>
                                        {isEditing ? (
                                            <div className={adminStyles.uploadBox}>
                                                <div className={adminStyles.previewContainer} style={{ flex: 1 }}>
                                                    {(editValues.image_url || activeStore.image_url) ? (
                                                        <img src={editValues.image_url || activeStore.image_url || ''} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1.5rem' }} />
                                                    ) : (
                                                        <div className={adminStyles.placeholderImg}><Upload size={32} /><p>새 사진 업로드</p></div>
                                                    )}
                                                </div>
                                                <input type="file" id="vendorImg" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) {
                                                        const r = new FileReader();
                                                        r.onload = e => setEditValues({ ...editValues, image_url: e.target?.result as string });
                                                        r.readAsDataURL(f);
                                                    }
                                                }} />
                                                <button className={styles.loginBtn} style={{ marginTop: '1rem', width: '100%', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }} onClick={() => document.getElementById('vendorImg')?.click()}>이미지 선택</button>
                                            </div>
                                        ) : (
                                            <div className={adminStyles.photoDisplay}>
                                                {activeStore.image_url ? (
                                                    <img src={activeStore.image_url} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1.5rem' }} />
                                                ) : (
                                                    <div className={adminStyles.placeholderImgLarge}><ImageIcon size={48} /><p>사진 없음</p></div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p style={{marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6}}>매장 간판과 입구가 잘 보이도록 촬영해 주세요. 고화질 사진일수록 고객 신뢰도가 높아집니다.</p>
                                </div>

                                {/* Info Column */}
                                <div className={adminStyles.formSection}>
                                    <section className={adminStyles.detailSection}>
                                        <h4 style={{ color: '#1e293b' }}><StoreIcon size={18} /> 매장 기본 정보</h4>
                                        <div className={adminStyles.infoGrid} style={{ gap: '1.5rem' }}>
                                            <div className={adminStyles.infoItem}>
                                                <label>매장명</label>
                                                {isEditing ? (
                                                    <input className={adminStyles.modalInput} value={editValues.store_name || activeStore.store_name} onChange={e => setEditValues({...editValues, store_name: e.target.value})} />
                                                ) : <p style={{fontSize: '1.1rem', fontWeight: 700}}>{activeStore.store_name}</p>}
                                            </div>
                                            <div className={adminStyles.infoItem} style={{ gridColumn: 'span 2' }}>
                                                <label>위치/상세주소</label>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <input className={adminStyles.modalInput} placeholder="도로명 주소" value={editValues.road_address || activeStore.road_address || ''} onChange={e => setEditValues({...editValues, road_address: e.target.value})} />
                                                        <input className={adminStyles.modalInput} placeholder="상세 위치 (동/호수)" value={editValues.location || activeStore.location || (activeStore.description?.match(/\[상세위치: (.*?)\]/)?.[1]) || ''} onChange={e => setEditValues({...editValues, location: e.target.value})} />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p style={{fontSize: '1.1rem', fontWeight: 700}}>{activeStore.location || (activeStore.description?.match(/\[상세위치: (.*?)\]/)?.[1]) || '상세위치 미등록'}</p>
                                                        <p style={{fontSize: '0.9rem', color: '#64748b', marginTop: '0.2rem'}}>{activeStore.road_address}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={adminStyles.infoItem}>
                                                <label>연락처</label>
                                                {isEditing ? (
                                                    <input className={adminStyles.modalInput} value={editValues.phone || activeStore.phone || ''} onChange={e => setEditValues({...editValues, phone: e.target.value})} />
                                                ) : <p style={{fontSize: '1.1rem', fontWeight: 700}}>{activeStore.phone || '등록 대기'}</p>}
                                            </div>
                                            <div className={adminStyles.infoItem}>
                                                <label>업종 카테고리</label>
                                                {isEditing ? (
                                                    <select className={adminStyles.modalSelect} value={editValues.category || activeStore.category} onChange={e => setEditValues({...editValues, category: e.target.value as StoreCategory})}>
                                                        {Object.entries(CATEGORY_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                                                    </select>
                                                ) : <p style={{fontSize: '1.1rem', fontWeight: 700}}>{CATEGORY_LABELS[activeStore.category]}</p>}
                                            </div>
                                            <div className={adminStyles.infoItem} style={{ gridColumn: 'span 2' }}>
                                                <label>인증 상태</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: activeStore.is_verified ? '#10b981' : '#f59e0b', fontWeight: 800 }}>
                                                    {activeStore.is_verified ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                                    {activeStore.is_verified ? '인증 완료 된 매장' : '관리자 승인 대기 중'}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className={adminStyles.detailSection} style={{ marginTop: '2rem' }}>
                                        <h4 style={{ color: '#1e293b' }}><Plus size={18} /> 취급 품목 및 키워드</h4>
                                        <div className={adminStyles.tagList} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}>
                                            <div className={adminStyles.tagListEdit}>
                                                {(isEditing ? (editValues.keywords || activeStore.keywords || []) : (activeStore.keywords || [])).map((t: string, i: number) => (
                                                    <span key={i} className={adminStyles.modalTagEdit} style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 0.8rem', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        #{t} {isEditing && <button onClick={() => setEditValues({...editValues, keywords: (editValues.keywords || activeStore.keywords || []).filter((k: string) => k !== t)})} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={14}/></button>}
                                                    </span>
                                                ))}
                                            </div>
                                            {isEditing && (
                                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                    <input className={adminStyles.modalInput} style={{ flex: 1 }} placeholder="단어 입력 후 Enter..." value={tempTag} onChange={e => setTempTag(e.target.value)} onKeyDown={e => {
                                                        if (e.key === 'Enter' && tempTag.trim()) {
                                                            const k = editValues.keywords || activeStore.keywords || [];
                                                            if(!k.includes(tempTag.trim())) setEditValues({...editValues, keywords: [...k, tempTag.trim()]});
                                                            setTempTag('');
                                                            e.preventDefault();
                                                        }
                                                    }} />
                                                    <button className={adminStyles.addBtn} onClick={() => { if(tempTag.trim()) { const k = editValues.keywords || activeStore.keywords || []; if(!k.includes(tempTag.trim())) setEditValues({...editValues, keywords: [...k, tempTag.trim()]}); setTempTag(''); } }}><Plus size={20}/></button>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        <footer className={adminStyles.modalFooter} style={{ padding: '2rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {isEditing ? (
                                    <>
                                        <button className={adminStyles.saveBtn} style={{ flex: 2, padding: '1.2rem', fontSize: '1.1rem' }} onClick={handleSave}><Save size={18}/> 모든 변경사항 저장</button>
                                        <button className={adminStyles.cancelBtn} style={{ flex: 1 }} onClick={() => setIsEditing(false)}>취소</button>
                                    </>
                                ) : (
                                    <>
                                        <button className={adminStyles.actionBtn} style={{ flex: 1 }} onClick={() => { setEditValues({...activeStore}); setIsEditing(true); }}><Edit2 size={18}/> 매장 정보/사진 수정</button>
                                        <button className={adminStyles.actionBtn} style={{ flex: 1 }} onClick={() => window.open(`/store/${activeStore.id}`, '_blank')}><ExternalLink size={18}/> 매장 페이지 열기</button>
                                        <button className={`${adminStyles.actionBtn} ${adminStyles.danger}`} style={{ flex: 1 }}><Trash2 size={18}/> 매장 정보 삭제</button>
                                    </>
                                )}
                            </div>
                        </footer>
                    </div>
                </div>
            )}

            {/* Register Modal (신규 등록) */}
            {showRegisterModal && (
                <div className={adminStyles.modalOverlay} onClick={() => setShowRegisterModal(false)}>
                    <div className={adminStyles.modalContent} onClick={e => e.stopPropagation()}>
                        <header className={adminStyles.modalHeader}>
                            <div>
                                <h2 style={{fontSize: '1.8rem'}}>새 매장 등록하기</h2>
                                <p style={{color: '#64748b'}}>정확한 정보를 입력해 주세요.</p>
                            </div>
                            <button className={adminStyles.closeBtn} onClick={() => setShowRegisterModal(false)}><X size={24} /></button>
                        </header>
                        <div className={adminStyles.modalBody}>
                           <div className={adminStyles.infoItem} style={{ marginBottom: '1.5rem' }}>
                                <label>매장명</label>
                                <input className={adminStyles.modalInput} placeholder="예: 극동계전" value={newStoreData.storeName} onChange={e => setNewStoreData({...newStoreData, storeName: e.target.value})} />
                           </div>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className={adminStyles.infoItem}>
                                    <label>동 (상가 번호)</label>
                                    <input className={adminStyles.modalInput} placeholder="19동" value={newStoreData.dong} onChange={e => setNewStoreData({...newStoreData, dong: e.target.value})} />
                                </div>
                                <div className={adminStyles.infoItem}>
                                    <label>호 (상세 위치)</label>
                                    <input className={adminStyles.modalInput} placeholder="104호" value={newStoreData.ho} onChange={e => setNewStoreData({...newStoreData, ho: e.target.value})} />
                                </div>
                           </div>
                           <div className={adminStyles.infoItem} style={{ marginBottom: '1.5rem' }}>
                                <label>업종</label>
                                <select className={adminStyles.modalSelect} value={newStoreData.category} onChange={e => setNewStoreData({...newStoreData, category: e.target.value as StoreCategory})}>
                                    {Object.entries(CATEGORY_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                           </div>
                           <div className={adminStyles.infoItem}>
                                <label>연락처 (선택)</label>
                                <input className={adminStyles.modalInput} placeholder="031-492-0895" value={newStoreData.phone} onChange={e => setNewStoreData({...newStoreData, phone: e.target.value})} />
                           </div>
                        </div>
                        <footer className={adminStyles.modalFooter} style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className={adminStyles.saveBtn} style={{ flex: 1 }} onClick={handleRegisterStore}>등록 완료하기</button>
                                <button className={adminStyles.cancelBtn} style={{ flex: 1 }} onClick={() => setShowRegisterModal(false)}>취소</button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
