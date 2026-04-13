'use client';

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { useState, KeyboardEvent, useEffect } from 'react';
import { Store, CATEGORY_LABELS, StoreCategory } from '@/types';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import {
    Users,
    Store as StoreIcon,
    Settings,
    Search,
    MoreVertical,
    ShieldCheck,
    Key,
    LogOut,
    BarChart3,
    CheckCircle2,
    Clock,
    UserCheck,
    X,
    ExternalLink,
    Edit2,
    Trash2,
    Save,
    Image as ImageIcon,
    Upload,
    Download,
    UploadCloud,
    FileSpreadsheet,
    Plus,
    Eye,
    EyeOff
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return '시스템 관리자';
            case 'sub_admin': return '부관리자';
            case 'vendor': return '입점주';
            default: return '사용자';
        }
    };

    const { 
        stores, 
        addStore, 
        updateStore, 
        deleteStore, 
        accounts, 
        updateAccount, 
        deleteAccount, 
        resetAllData,
        logout,
        currentUser,
        isLoading: isDataLoading,
        todayVisitorCount,
        updateCurrentUserPassword
    } = useData();
    const router = useRouter();
    
    // All hooks must be here
    const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'accounts' | 'approvals' | 'settings'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Partial<Store>>({});
    const [editingAccount, setEditingAccount] = useState<any | null>(null);
    const [accountEditValues, setAccountEditValues] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);
    const [tempTag, setTempTag] = useState('');
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!isDataLoading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, isDataLoading, router]);

    // Safety check for stores/accounts being undefined
    const safeStores = stores || [];
    const safeAccounts = accounts || [];

    if (isDataLoading) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.spinner}></div>
                <p>시스템 무결성 확인 중...</p>
            </div>
        );
    }

    if (!currentUser) return null;

    const pendingApprovals = safeStores.filter(s => !s.is_verified);

    const stats = [
        { label: '전체 매장', value: stores.length.toString(), icon: <StoreIcon size={20} />, color: '#3b82f6' },
        { label: '승인 대기', value: pendingApprovals.length.toString(), icon: <Clock size={20} />, color: '#f59e0b' },
        { label: '활성 관리자', value: accounts.filter(a => a.role === 'admin').length.toString(), icon: <Users size={20} />, color: '#10b981' },
        { label: '금일 방문자', value: todayVisitorCount.toLocaleString(), icon: <BarChart3 size={20} />, color: '#8b5cf6' },
    ];

    const filteredStores = (stores || []).filter(s =>
        (s.store_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (s.location || '').includes(searchTerm)
    );

    const startEdit = () => {
        if (!selectedStore) return;
        setEditValues({ ...selectedStore });
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!selectedStore || !editValues.id) return;
        updateStore(selectedStore.id, editValues);
        setSelectedStore({ ...selectedStore, ...editValues } as Store);
        setIsEditing(false);
        alert('매장 정보가 성공적으로 업데이트되었습니다.');
    };

    const handleDeleteStore = (store: Store) => {
        if (window.confirm(`[${store.store_name}] 매장 정보를 정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            deleteStore(store.id);
            setSelectedStore(null);
            alert('매장 정보가 삭제되었습니다.');
        }
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

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const removeTag = (tagToRemove: string) => {
        setEditValues({
            ...editValues,
            keywords: editValues.keywords?.filter(t => t !== tagToRemove)
        });
    };

    const handleAddNewAccount = () => {
        const newId = `v_${Date.now()}`;
        setEditingAccount({ id: newId, isNew: true });
        setAccountEditValues({
            id: newId,
            email: '',
            password: '',
            role: 'vendor',
            store_name: '',
            isVendorEdit: true,
            isNew: true
        });
        setShowPassword(true);
    };

    // Move visibility check logic here
    const isShowingDashboard = !isDataLoading && currentUser;

    const handleAccountSave = async () => {
        if (!editingAccount) return;
        
        try {
            // Validation: Admin cannot change their own email through this UI if they are logged in
            if (editingAccount.role === 'admin' && editingAccount.id === currentUser.id && accountEditValues.email !== currentUser.email) {
                alert('시스템 관리자 ID는 보안 정책상 본인이 직접 변경할 수 없습니다.');
                return;
            }

            // Check if the account actually exists in our accounts list
            const existingAcc = accounts.find(a => a.id === editingAccount.id);
            
            if (!existingAcc) {
                // If it's a fallback account (mock store without real account object), 
                // we need to actually create it so the user can login with it.
                const newAccount = {
                    ...accountEditValues,
                    id: editingAccount.id,
                    role: accountEditValues.role || 'vendor',
                    created_at: new Date().toISOString()
                };
                
                // This will push the new account into the context and storage
                await updateAccount(editingAccount.id, newAccount);
            } else {
                // Perform regular update
                await updateAccount(editingAccount.id, accountEditValues);
            }

            // Special handling if updating currently logged in user
            if (editingAccount.id === currentUser.id && accountEditValues.password) {
                const success = await updateCurrentUserPassword(accountEditValues.password);
                if (!success) {
                    alert('비밀번호 변경에 실패했습니다. (기존 비밀번호 불일치)');
                    return;
                }
            }
            
            setEditingAccount(null);
            setShowPassword(false);
            alert(`[${accountEditValues.email}] 계정 정보가 성공적으로 반영되었습니다.\n이제 이 계정으로 실제 로그인이 가능합니다.`);
        } catch (err) {
            console.error(err);
            alert('정보 반영 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteAccount = (acc: any) => {
        try {
            if (!acc || !acc.id) return;
            const isUserSure = window.confirm(`[${acc.email}] 계정과 연동된 모든 매장 정보를 영구 삭제하시겠습니까?`);
            if (isUserSure) {
                const associatedStore = stores.find(s => s.vendor_id === acc.id);
                if (associatedStore) deleteStore(associatedStore.id);
                deleteAccount(acc.id);
                alert('계정과 매장 정보가 성공적으로 삭제되었습니다.');
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert('삭제 처리 중 오류가 발생했습니다.');
        }
    };

    const handleBackup = async () => {
        try {
            const backupData = { stores, accounts };
            const response = await fetch('/api/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backupData)
            });
            const result = await response.json();
            if (result.success) {
                alert(`자동 백업 완료: ${result.filename}`);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            alert('서버 백업 중 오류가 발생했습니다.');
        }
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.stores && data.accounts) {
                    if (confirm('백업 데이터를 복구하시겠습니까?')) {
                        localStorage.setItem('ansan_stores', JSON.stringify(data.stores));
                        localStorage.setItem('ansan_accounts', JSON.stringify(data.accounts));
                        window.location.reload();
                    }
                }
            } catch (err) { alert('데이터 복구 실패'); }
        };
        reader.readAsText(file);
    };

    const handleExcelExport = async () => {
        // Logic for Excel Export
        alert('엑셀 추출은 개발 서버 전용 기능입니다.');
    };

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className={styles.adminLayout}>
            {/* Detail & Edit Modal */}
            {selectedStore && (
                <div className={styles.modalOverlay} onClick={() => { if (!isEditing) setSelectedStore(null); }}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <header className={styles.modalHeader}>
                            <div>
                                <h2>{isEditing ? '매장 고급 편집' : '매장 상세 정보'}</h2>
                                <p>등록번호: {new Date(selectedStore.created_at || Date.now()).toISOString().split('T')[0].replace(/-/g, '')}-{selectedStore.id.replace('s_', '').slice(-4)}</p>
                            </div>
                            <button className={styles.closeBtn} onClick={() => { setSelectedStore(null); setIsEditing(false); }}>
                                <X size={20} />
                            </button>
                        </header>

                        <div className={styles.modalBody}>
                            <div className={styles.modalSplit}>
                                {/* Image Column */}
                                <div className={styles.imageSection}>
                                    <label className={styles.sectionLabel}><ImageIcon size={14} /> 매장 외관 사진</label>
                                    <div className={styles.photoContainer}>
                                        {isEditing ? (
                                            <div className={styles.uploadBox}>
                                                <div className={styles.previewContainer}>
                                                    {editValues.image_url ? (
                                                        <img src={editValues.image_url} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }} />
                                                    ) : (
                                                        <div className={styles.placeholderImg}>
                                                            <Upload size={32} />
                                                            <p>새 사진 업로드</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    id="storeImageUpload"
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
                                                <button className={styles.uploadTrigger} onClick={() => document.getElementById('storeImageUpload')?.click()}>이미지 선택</button>
                                            </div>
                                        ) : (
                                            <div className={styles.photoDisplay}>
                                                {selectedStore.image_url ? (
                                                    <img src={selectedStore.image_url} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }} />
                                                ) : (
                                                    <div className={styles.placeholderImgLarge}>
                                                        <ImageIcon size={48} />
                                                        <p>사진 미등록</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info Column */}
                                <div className={styles.formSection}>
                                    <section className={styles.detailSection}>
                                        <h4><StoreIcon size={16} /> 매장 기본 정보</h4>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <label>매장명</label>
                                                {isEditing ? <input className={styles.modalInput} value={editValues.store_name || ''} onChange={(e) => setEditValues({ ...editValues, store_name: e.target.value })} /> : <p>{selectedStore.store_name}</p>}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>위치/상세주소</label>
                                                {isEditing ? <input className={styles.modalInput} value={editValues.location || ''} onChange={(e) => setEditValues({ ...editValues, location: e.target.value })} /> : <p>{selectedStore.location}</p>}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>연락처</label>
                                                {isEditing ? <input className={styles.modalInput} value={editValues.phone || ''} onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })} /> : <p>{selectedStore.phone || '등록되지 않음'}</p>}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>업종 카테고리</label>
                                                {isEditing ? (
                                                    <select className={styles.modalSelect} value={editValues.category} onChange={(e) => setEditValues({ ...editValues, category: e.target.value as StoreCategory })}>
                                                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                            <option key={key} value={key}>{label}</option>
                                                        ))}
                                                    </select>
                                                ) : <p>{CATEGORY_LABELS[selectedStore.category]}</p>}
                                            </div>
                                        </div>
                                    </section>
                                    <section className={styles.detailSection}>
                                        <h4><Users size={16} /> 취급 품목 및 키워드</h4>
                                        {isEditing ? (
                                            <div className={styles.tagInputContainer}>
                                                <div className={styles.tagListEdit}>
                                                    {editValues.keywords?.map((t, idx) => (
                                                        <span key={idx} className={styles.modalTagEdit}>
                                                            #{t} <button onClick={() => removeTag(t)}><X size={12} /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className={styles.tagInputWrapper}>
                                                    <input className={styles.tagInput} placeholder="태그 입력..." value={tempTag} onChange={(e) => setTempTag(e.target.value)} onKeyDown={handleTagKeyDown} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.tagList}>
                                                {selectedStore.keywords?.map((t: string, idx: number) => <span key={idx} className={styles.modalTag}>#{t}</span>)}
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                            <section className={styles.modalFooterActions}>
                                <div className={styles.actionGrid}>
                                    {isEditing ? (
                                        <>
                                            <button className={styles.saveBtn} onClick={handleSave}><Save size={16} /> 저장</button>
                                            <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>취소</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className={styles.actionBtn} onClick={startEdit}><Edit2 size={16} /> 수정</button>
                                            <button className={styles.actionBtn} onClick={() => window.open(`/store/${selectedStore.id}`, '_blank')}><ExternalLink size={16} /> 열기</button>
                                            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteStore(selectedStore)}><Trash2 size={16} /> 삭제</button>
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Edit Modal */}
            {editingAccount && (
                <div className={styles.modalOverlay}>
                    <div className={styles.accountModal} onClick={e => e.stopPropagation()}>
                        <header className={styles.modalHeader}>
                            <div>
                                {accountEditValues.isNew ? (
                                    <>
                                        <h2>신규 입점 업체 계정 등록</h2>
                                        <p>새로운 업체의 관리자 계정을 생성합니다.</p>
                                    </>
                                ) : accountEditValues.isVendorEdit ? (
                                    <>
                                        <h2>{accountEditValues.store_name || '입점 업체'} 정보 수정</h2>
                                        <p>업체 로그인 계정 및 비밀번호 관리</p>
                                    </>
                                ) : (
                                    <>
                                        <h2>시스템 관리자 보안 설정</h2>
                                        <p>전체 시스템 관리 권한 계정</p>
                                    </>
                                )}
                            </div>
                            <button className={styles.closeBtn} onClick={() => { setEditingAccount(null); setShowPassword(false); }}>
                                <X size={20} />
                            </button>
                        </header>
                        <div className={styles.modalBody}>
                                {accountEditValues.isNew && (
                                    <div className={styles.formGroup}>
                                        <label>업체명 (상호)</label>
                                        <div className={styles.inputWithIcon}>
                                            <StoreIcon size={16} className={styles.inputPrefixIcon} />
                                            <input
                                                className={styles.modalInput}
                                                type="text"
                                                placeholder="예: 정밀볼트"
                                                value={accountEditValues.store_name || ''}
                                                onChange={(e) => setAccountEditValues({ ...accountEditValues, store_name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label>로그인 ID (이메일)</label>
                                <div className={styles.inputWithIcon}>
                                    <ShieldCheck size={16} className={styles.inputPrefixIcon} />
                                    <input
                                        className={styles.modalInput}
                                        type="email"
                                        placeholder="example@email.com"
                                        value={accountEditValues.email || ''}
                                        readOnly={!accountEditValues.isVendorEdit}
                                        style={!accountEditValues.isVendorEdit ? { backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' } : {}}
                                        onChange={(e) => setAccountEditValues({ ...accountEditValues, email: e.target.value })}
                                    />
                                </div>
                                {!accountEditValues.isVendorEdit ? (
                                    <p className={styles.inputHelp}>본인인 시스템 관리자 계정 ID는 보안상 변경이 불가능합니다.</p>
                                ) : (
                                    <p className={styles.inputHelp}>업체가 로그인 시 사용할 이메일 주소를 입력해 주세요.</p>
                                )}
                            </div>

                            <div className={styles.passwordFieldsGrid}>
                                <div className={styles.formGroup}>
                                    <label>현재 비밀번호 확인</label>
                                    <div className={styles.passwordInputWrapper}>
                                        <input
                                            className={styles.modalInput}
                                            type={showPassword ? "text" : "password"}
                                            value={accountEditValues.password || ''}
                                            readOnly
                                            style={{ backgroundColor: '#f8fafc' }}
                                        />
                                        <button className={styles.visibilityBtn} onClick={() => setShowPassword(!showPassword)} type="button">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>재설정할 비밀번호</label>
                                    <div className={styles.passwordInputWrapper}>
                                        <input
                                            className={styles.modalInput}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="새 비밀번호 입력"
                                            onChange={(e) => setAccountEditValues({ ...accountEditValues, password: e.target.value })}
                                        />
                                    </div>
                                    <p className={styles.inputHelp}>변경 시에만 입력하세요.</p>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>계정 권한 레벨</label>
                                <select
                                    className={styles.modalSelect}
                                    value={accountEditValues.role || 'vendor'}
                                    disabled={editingAccount.id === currentUser.id}
                                    onChange={(e) => setAccountEditValues({ ...accountEditValues, role: e.target.value })}
                                >
                                    <option value="vendor">VENDOR (일반 업체)</option>
                                    <option value="admin">ADMIN (시스템 관리자)</option>
                                    <option value="sub_admin">SUB_ADMIN (부관리자)</option>
                                </select>
                            </div>
                        </div>
                        <footer className={styles.modalFooterActions}>
                            <button className={styles.saveBtn} onClick={handleAccountSave}>
                                <Save size={16} /> 정보 변경 내용 저장
                            </button>
                            <button className={styles.cancelBtn} onClick={() => { setEditingAccount(null); setShowPassword(false); }}>
                                취소
                            </button>
                        </footer>
                    </div>
                </div>
            )}


            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}><div className={styles.logo}>ANSAN ADMIN</div></div>
                <nav className={styles.sideNav}>
                    <button className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => setActiveTab('overview')}><BarChart3 size={20} /> 대시보드</button>
                    <button className={`${styles.navItem} ${activeTab === 'approvals' ? styles.active : ''}`} onClick={() => setActiveTab('approvals')}><UserCheck size={20} /> 입점 승인 {pendingApprovals.length > 0 && <span className={styles.countBadge}>{pendingApprovals.length}</span>}</button>
                    <button className={`${styles.navItem} ${activeTab === 'stores' ? styles.active : ''}`} onClick={() => setActiveTab('stores')}><StoreIcon size={20} /> 매장 관리</button>
                    <button className={`${styles.navItem} ${activeTab === 'accounts' ? styles.active : ''}`} onClick={() => setActiveTab('accounts')}><Users size={20} /> 계정 관리</button>
                    <div className={styles.navDivider}></div>
                    <button className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}><Settings size={20} /> 시스템 설정</button>
                </nav>
                <div className={styles.sidebarFooter}>
                    <button 
                        onClick={logout} 
                        className={styles.logoutBtn}
                    >
                        <LogOut size={18} /> 관리자 로그아웃
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topHeader}>
                    <div className={styles.headerInfo}>
                        <h1>{activeTab === 'overview' ? '관리자 대시보드' : activeTab === 'approvals' ? '신규 입점 승인' : activeTab === 'stores' ? '매장 관리' : activeTab === 'accounts' ? '계정 관리' : '시스템 설정'}</h1>
                        <p>안산유통상가 통합 관리 시스템</p>
                    </div>
                    <div className={styles.adminProfile}>
                        <div className={styles.profileText}>
                            <span className={styles.profileName}>{currentUser?.store_name || currentUser?.email || '사용자'}</span>
                            <span className={styles.profileRole}>{currentUser?.role === 'admin' ? '시스템 관리자' : '입점사 관리'}</span>
                        </div>
                        <div className={styles.avatar}>{String(currentUser?.email || 'U')[0].toUpperCase()}</div>
                    </div>
                </header>

                <div className={styles.scrollArea}>
                    {activeTab === 'overview' && (
                        <div className={styles.overviewGrid}>
                            <div className={styles.statsRow}>
                                {stats.map((s, i) => (
                                    <div key={i} className={styles.statCard}>
                                        <div className={styles.statIcon} style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                                        <div className={styles.statText}>
                                            <span className={styles.statLabel}>{s.label}</span>
                                            <span className={styles.statValue}>{s.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.dashboardGrid}>
                                <div className={styles.mainCard}>
                                    <h3>최근 활동 이력</h3>
                                    <div className={styles.activityList}>
                                        <div className={styles.activityItem}><div className={styles.actDot} style={{ background: '#f59e0b' }}></div><div className={styles.actContent}><p><strong>새로운 입점 신청</strong>이 대기 중입니다.</p><span>방금 전</span></div></div>
                                        <div className={styles.activityItem}><div className={styles.actDot}></div><div className={styles.actContent}><p>시스템 데이터 정기 백업이 수행되었습니다.</p><span>1시간 전</span></div></div>
                                    </div>
                                </div>
                                <div className={styles.subCard}>
                                    <h3>상태 요약</h3>
                                    <div className={styles.statusBox}>
                                        <div className={styles.statusItem}><span>내부 서버 상태</span><span className={styles.green}>정상</span></div>
                                        <div className={styles.statusItem}><span>DB 연동</span><span className={styles.green}>정상</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead><tr><th>매장명</th><th>위치</th><th>이메일</th><th>상태</th><th>결정</th></tr></thead>
                                <tbody>
                                    {pendingApprovals.map(app => (
                                        <tr key={app.id}>
                                            <td><strong className={styles.tableName}>{app.store_name}</strong></td>
                                            <td>{app.location}</td>
                                            <td>{app.vendor_email}</td>
                                            <td><span className={styles.badgeWarning}>검토 대기</span></td>
                                            <td><button className={styles.approveBtn} onClick={() => updateStore(app.id, { is_verified: true })}>승인</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'stores' && (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead><tr><th>매장명</th><th>위치</th><th>업종</th><th>상태</th><th>관리</th></tr></thead>
                                <tbody>
                                    {filteredStores.map(s => (
                                        <tr key={s.id}>
                                            <td><strong className={styles.tableName}>{s.store_name}</strong></td>
                                            <td>{s.location}</td>
                                            <td>{CATEGORY_LABELS[s.category]}</td>
                                            <td><span className={styles.statusDotActive}></span> 노출 중</td>
                                            <td><button className={styles.iconOpBtn} onClick={() => setSelectedStore(s)}><MoreVertical size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'accounts' && (
                        <div className={styles.accountsTab}>
                            <div className={styles.tabHeader}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3>시스템 계정 전체 관리</h3>
                                        <p>총 {safeAccounts.length}개의 계정이 등록되어 있습니다.</p>
                                    </div>
                                    <button className={styles.addBtn} onClick={handleAddNewAccount} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <Plus size={16} /> 신규 계정 등록
                                    </button>
                                </div>
                            </div>
                            <div className={styles.accountGrid}>
                            {/* System Admins & Sub-Admins first */}
                            {accounts.filter(a => a.role === 'admin' || a.role === 'sub_admin').map((acc) => (
                                <div key={acc.id} className={`${styles.accountCard} ${acc.id === currentUser.id ? styles.myAccount : ''}`}>
                                    <div className={styles.accountHeader}>
                                        <div className={styles.accountInfo}>
                                            <h4>{acc.id === currentUser.id ? '시스템 관리자 (본인)' : (acc.role === 'admin' ? '공동 관리자' : '부관리자 계정')}</h4>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{acc.role === 'admin' ? '전체 관리 권한' : '운영 지원 권한'}</span>
                                        </div>
                                        <div className={`${styles.roleBadge} ${acc.role === 'admin' ? styles.adminMode : styles.subAdminMode}`}>
                                            {acc.role === 'admin' ? 'ADMIN' : 'SUB-ADMIN'}
                                        </div>
                                    </div>
                                    <div className={styles.accountDetails}>
                                        <div className={styles.detailRow}>
                                            <span>로그인 ID:</span>
                                            <strong>{acc.email}</strong>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span>비밀번호:</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <strong>{visiblePasswords[acc.id] ? (acc.password || '••••••••') : '••••••••'}</strong>
                                                <button className={styles.iconOpBtn} onClick={() => togglePasswordVisibility(acc.id)}>
                                                    {visiblePasswords[acc.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.accountActions}>
                                        <button className={styles.editBtn} onClick={() => { 
                                            setEditingAccount(acc); 
                                            setAccountEditValues({ ...acc, email: acc.email, store_name: acc.role === 'admin' ? '시스템 관리자' : '부관리자', isVendorEdit: false }); 
                                        }}><Edit2 size={14} /> 보안 관리</button>
                                        {acc.id !== currentUser.id && (
                                            <button className={`${styles.resetBtn} ${styles.dangerLink}`} onClick={() => handleDeleteAccount(acc)} style={{ marginLeft: 'auto', border: 'none', background: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}>탈퇴</button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Store Vendors */}
                            {stores.map((store) => {
                                const acc = accounts.find(a => a.id === store.vendor_id);
                                const accountId = acc?.id || store.vendor_id;
                                const currentEmail = acc?.email || store.vendor_email || '계정미설정';
                                const currentPassword = acc?.password || '123456';
                                const isVerified = store.is_verified;
                                
                                return (
                                    <div key={store.id} className={styles.accountCard}>
                                        <div className={styles.accountHeader}>
                                            <div className={styles.accountInfo}>
                                                <h4>{store.store_name}</h4>
                                                <span>{store.location} | 입점 채널</span>
                                            </div>
                                            <div className={styles.roleBadge}>VENDOR</div>
                                        </div>
                                        <div className={styles.accountDetails}>
                                            <div className={styles.detailRow}>
                                                <span>로그인 ID:</span>
                                                <strong>{currentEmail}</strong>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span>비밀번호:</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <strong>{visiblePasswords[accountId] ? currentPassword : '••••••••'}</strong>
                                                    <button className={styles.iconOpBtn} onClick={() => togglePasswordVisibility(accountId)}>
                                                        {visiblePasswords[accountId] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span>승인 현황:</span>
                                                {isVerified ? (
                                                    <span className={styles.statusVerified}><CheckCircle2 size={14} /> 입점 승인됨</span>
                                                ) : (
                                                    <span className={styles.statusPending}><Clock size={14} /> 승인 대기 중</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.accountActions}>
                                            <div className={styles.primaryActions}>
                                                <button className={styles.editBtn} onClick={() => { 
                                                    const targetAcc = acc || { id: store.vendor_id, email: currentEmail, role: 'vendor', password: currentPassword };
                                                    setEditingAccount(targetAcc); 
                                                    setAccountEditValues({ ...targetAcc, store_name: store.store_name, isVendorEdit: true });
                                                }}><Key size={14} /> 정보 수정</button>
                                                {!isVerified && (
                                                    <button className={styles.quickApproveBtn} onClick={() => updateStore(store.id, { is_verified: true })}>
                                                        <UserCheck size={14} /> 즉시 승인
                                                    </button>
                                                )}
                                            </div>
                                            <button className={`${styles.resetBtn} ${styles.dangerLink}`} onClick={() => handleDeleteAccount(acc || {id: store.vendor_id})}><Trash2 size={14} /> 탈퇴</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}



                    {activeTab === 'settings' && (
                        <div className={styles.settingsContent}>
                            <div className={styles.settingsCard} style={{ borderLeft: '4px solid #3b82f6' }}>
                                <div className={styles.cardHeader}><h4>💾 시스템 데이터 백업 및 복구</h4></div>
                                <div className={styles.cardBody}>
                                    <p>현재 시스템에 등록된 매장 정보, 계정 데이터 등을 로컬 파일로 백업하거나 복구합니다.</p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className={styles.resetFullBtn} style={{ backgroundColor: '#3b82f6', color: 'white', maxWidth: '200px' }} onClick={handleBackup}><Download size={16} /> 데이터 백업</button>
                                        <button className={styles.resetFullBtn} style={{ backgroundColor: '#10b981', color: 'white', maxWidth: '200px' }} onClick={() => document.getElementById('restoreJsonUpload')?.click()}><UploadCloud size={16} /> 데이터 복구</button>
                                        <input type="file" id="restoreJsonUpload" accept="application/json" style={{ display: 'none' }} onChange={handleRestore} />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.settingsCard} style={{ borderLeft: '4px solid #ef4444', marginTop: '2rem' }}>
                                <div className={styles.cardHeader}><h4 style={{ color: '#ef4444' }}>⚠️ 위험구역: 서비스 초기화</h4></div>
                                <div className={styles.cardBody}>
                                    <div className={styles.warningBox}>
                                        <p><strong>주의:</strong> 아래 버튼을 클릭하면 모든 매장 정보와 계정 데이터가 삭제되고 <strong>데모 데이터</strong>로 초기화됩니다.</p>
                                    </div>
                                    <button 
                                        className={styles.resetFullBtn} 
                                        onClick={async () => {
                                            if (confirm('시스템을 공장 초기화 상태로 되돌리시겠습니까?\n이 작업은 모든 실매장 데이터를 지웁니다.')) {
                                                await resetAllData();
                                                alert('시스템이 성공적으로 초기화되었습니다.');
                                                router.push('/');
                                            }
                                        }}
                                    >
                                        <Trash2 size={18} /> 전체 데이터 시스템 초기화
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

