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
    const { 
        stores, 
        addStore, 
        updateStore, 
        deleteStore, 
        accounts, 
        updateAccount, 
        deleteAccount, 
        resetAllData,
        currentUser,
        isLoading: isDataLoading
    } = useData();
    const router = useRouter();

    // Authentication Protection
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        // Give it a tiny bit of time to sync the auth state if we just logged in
        const timer = setTimeout(() => {
            setIsCheckingAuth(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isDataLoading && !isCheckingAuth && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, isDataLoading, isCheckingAuth, router]);

    if (isDataLoading || isCheckingAuth) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f8fafc',
                color: '#64748b'
            }}>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '3px solid #e2e8f0', 
                    borderTopColor: '#3b82f6', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1rem'
                }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p>관리자 세션을 확인 중입니다...</p>
            </div>
        );
    }

    if (!currentUser) return null; // Prevents flash of content while redirecting
    const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'accounts' | 'approvals' | 'settings'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Partial<Store>>({});

    // Account Edit State
    const [editingAccount, setEditingAccount] = useState<any | null>(null);
    const [accountEditValues, setAccountEditValues] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);

    // Tag Input Local State
    const [tempTag, setTempTag] = useState('');

    const pendingApprovals = stores.filter(s => !s.is_verified);

    const stats = [
        { label: '전체 매장', value: stores.length.toString(), icon: <StoreIcon size={20} />, color: '#3b82f6' },
        { label: '승인 대기', value: pendingApprovals.length.toString(), icon: <Clock size={20} />, color: '#f59e0b' },
        { label: '활성 관리자', value: '12', icon: <Users size={20} />, color: '#10b981' },
        { label: '금일 방문자', value: '1,245', icon: <BarChart3 size={20} />, color: '#8b5cf6' },
    ];

    const filteredStores = stores.filter(s =>
        s.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    const handleAccountSave = () => {
        if (!editingAccount) return;
        updateAccount(editingAccount.email, accountEditValues);
        setEditingAccount(null);
        alert('계정 정보가 성공적으로 변경되었습니다.');
    };

    const handleDeleteAccount = (acc: any) => {
        try {
            if (!acc || !acc.email) return;

            const isUserSure = window.confirm(`[${acc.email}] 계정과 연동된 모든 매장 정보를 영구 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);

            if (isUserSure) {
                console.log("Starting deletion process for:", acc.email);

                // Find associated store by vendor_email
                const associatedStore = stores.find(s => s.vendor_email === acc.email);

                if (associatedStore) {
                    console.log("Found associated store:", associatedStore.store_name);
                    deleteStore(associatedStore.id);
                } else {
                    console.warn("No associated store found for account:", acc.email);
                }

                deleteAccount(acc.email);
                console.log("Deletion completed for:", acc.email);
                alert('계정과 매장 정보가 성공적으로 삭제되었습니다.');
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert('삭제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
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
                alert(`자동 백업이 완료되었습니다!\n파일: 백업파일보관함 / ${result.filename}`);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error(err);
            alert('서버 자동 백업 중 오류가 발생했습니다. 개발 서버가 켜져 있는지 확인해 주세요.');
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
                    if (confirm('백업 데이터를 복구하시겠습니까? 현재 등록된 모든 데이터가 덮어씌워집니다.')) {
                        localStorage.setItem('ansan_stores', JSON.stringify(data.stores));
                        localStorage.setItem('ansan_accounts', JSON.stringify(data.accounts));
                        alert('데이터가 성공적으로 복구되었습니다. 변경사항을 반영하기 위해 페이지를 새로고침합니다.');
                        window.location.reload();
                    }
                } else {
                    alert('올바른 백업 파일이 아닙니다.');
                }
            } catch (err) {
                alert('파일을 읽는 중 오류가 발생했습니다.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleExcelExport = async () => {
        try {
            const headers = ['매장번호', '매장명', '업종', '위치(동/호)', '도로명주소', '전화번호', '담당자이메일', '가입일시', '키워드'];
            const rows = stores.map(s => {
                const displayId = `${new Date(s.created_at || Date.now()).toISOString().split('T')[0].replace(/-/g, '')}-${s.id.replace('s_', '').slice(-4)}`;
                const escapedKeywords = s.keywords ? '"' + s.keywords.join(', ').replace(/"/g, '""') + '"' : '""';

                return [
                    displayId,
                    `"${s.store_name?.replace(/"/g, '""') || ''}"`,
                    `"${CATEGORY_LABELS[s.category] || ''}"`,
                    `"${s.location?.replace(/"/g, '""') || ''}"`,
                    `"${s.road_address?.replace(/"/g, '""') || ''}"`,
                    `"${s.phone?.replace(/"/g, '""') || ''}"`,
                    `"${s.vendor_email?.replace(/"/g, '""') || ''}"`,
                    `"${new Date(s.created_at || Date.now()).toLocaleString()}"`,
                    escapedKeywords
                ].join(',');
            });

            const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');

            const response = await fetch('/api/export-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csvContent })
            });
            const result = await response.json();

            if (result.success) {
                alert(`엑셀 추출이 완료되었습니다!\n파일 위치: 엑셀파일보관함 / ${result.filename}`);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error(err);
            alert('서버 엑셀 자동 저장 중 오류가 발생했습니다. 개발 서버가 켜져 있는지 확인해 주세요.');
        }
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
                                <p>가입·등록번호: {new Date(selectedStore.created_at || Date.now()).toISOString().split('T')[0].replace(/-/g, '')}-{selectedStore.id.replace('s_', '').slice(-4)}</p>
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
                                                <div className={styles.previewContainer} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                    {editValues.image_url ? (
                                                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <img src={editValues.image_url} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }} />
                                                        </div>
                                                    ) : (
                                                        <div className={styles.placeholderImg} style={{ flex: 1 }}>
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
                                                <button
                                                    className={styles.uploadTrigger}
                                                    onClick={() => document.getElementById('storeImageUpload')?.click()}
                                                    style={{ marginTop: '1rem' }}
                                                >
                                                    이미지 선택
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.photoDisplay} style={{ width: '100%', height: '100%' }}>
                                                {selectedStore.image_url ? (
                                                    <img src={selectedStore.image_url} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }} />
                                                ) : (
                                                    <div className={styles.placeholderImgLarge}>
                                                        <ImageIcon size={48} />
                                                        <p>매장 사진이 등록되지 않았습니다.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className={styles.photoHelp}>매장 간판과 입구가 잘 보이도록 촬영해 주세요.</p>
                                </div>

                                {/* Info Column */}
                                <div className={styles.formSection}>
                                    <section className={styles.detailSection}>
                                        <h4><StoreIcon size={16} /> 매장 기본 정보</h4>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <label>매장명</label>
                                                {isEditing ? (
                                                    <input
                                                        className={styles.modalInput}
                                                        value={editValues.store_name || ''}
                                                        onChange={(e) => setEditValues({ ...editValues, store_name: e.target.value })}
                                                    />
                                                ) : <p>{selectedStore.store_name}</p>}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>위치/상세주소</label>
                                                {isEditing ? (
                                                    <input
                                                        className={styles.modalInput}
                                                        value={editValues.location || ''}
                                                        onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                                                    />
                                                ) : <p>{selectedStore.location}</p>}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>연락처 (전화번호)</label>
                                                {isEditing ? (
                                                    <input
                                                        className={styles.modalInput}
                                                        value={editValues.phone || ''}
                                                        onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                                                        placeholder="031-000-0000"
                                                    />
                                                ) : <p>{selectedStore.phone || '등록되지 않음'}</p>}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>영업 시간</label>
                                                {isEditing ? (
                                                    <input
                                                        className={styles.modalInput}
                                                        value={editValues.operating_hours || ''}
                                                        onChange={(e) => setEditValues({ ...editValues, operating_hours: e.target.value })}
                                                        placeholder="예: 평일 09:00 - 18:00 (토요일 휴무)"
                                                    />
                                                ) : <p>{selectedStore.operating_hours || '정보 없음'}</p>}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>업종 카테고리</label>
                                                {isEditing ? (
                                                    <select
                                                        className={styles.modalSelect}
                                                        value={editValues.category}
                                                        onChange={(e) => setEditValues({ ...editValues, category: e.target.value as StoreCategory })}
                                                    >
                                                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                            <option key={key} value={key}>{label}</option>
                                                        ))}
                                                    </select>
                                                ) : <p>{CATEGORY_LABELS[selectedStore.category]}</p>}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>인증 상태</label>
                                                {isEditing ? (
                                                    <select
                                                        className={styles.modalSelect}
                                                        value={editValues.is_verified ? 'true' : 'false'}
                                                        onChange={(e) => setEditValues({ ...editValues, is_verified: e.target.value === 'true' })}
                                                    >
                                                        <option value="true">인증 완료</option>
                                                        <option value="false">미인증 (임시)</option>
                                                    </select>
                                                ) : <p>{selectedStore.is_verified ? '인증 완료 된 매장' : '미인증 (임시등록)'}</p>}
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
                                                            #{t}
                                                            <button onClick={() => removeTag(t)} className={styles.tagRemoveBtn}>
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className={styles.tagInputWrapper}>
                                                    <input
                                                        className={styles.tagInput}
                                                        placeholder="단어 입력 후 Enter..."
                                                        value={tempTag}
                                                        onChange={(e) => setTempTag(e.target.value)}
                                                        onKeyDown={handleTagKeyDown}
                                                    />
                                                    <button className={styles.tagAddBtn} onClick={addTag}>
                                                        <Plus size={16} />
                                                    </button>
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
                                            <button className={styles.saveBtn} onClick={handleSave}>
                                                <Save size={16} /> 모든 변경사항 저장
                                            </button>
                                            <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                                                취소
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className={styles.actionBtn} onClick={startEdit}>
                                                <Edit2 size={16} /> 매장 정보/사진 수정
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => window.open(`/store/${selectedStore.id}`, '_blank')}
                                            >
                                                <ExternalLink size={16} /> 매장 페이지 열기
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.danger}`}
                                                onClick={() => handleDeleteStore(selectedStore)}
                                            >
                                                <Trash2 size={16} /> 매장 정보 삭제
                                            </button>
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
                                <h2>계정 정보 수정 (보안)</h2>
                                <p>사용자 이메일 및 비밀번호를 직접 변경합니다.</p>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setEditingAccount(null)}>
                                <X size={20} />
                            </button>
                        </header>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>계정 이메일(ID)</label>
                                <input
                                    className={styles.modalInput}
                                    type="email"
                                    value={accountEditValues.email || ''}
                                    onChange={(e) => setAccountEditValues({ ...accountEditValues, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>현재 비밀번호 (확인용)</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        className={styles.modalInput}
                                        type={showPassword ? "text" : "password"}
                                        value={editingAccount.password}
                                        readOnly
                                    />
                                    <button
                                        className={styles.visibilityBtn}
                                        onClick={() => setShowPassword(!showPassword)}
                                        type="button"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>새 비밀번호로 변경</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        className={styles.modalInput}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="변경할 새 비밀번호 입력"
                                        value={accountEditValues.password || ''}
                                        onChange={(e) => setAccountEditValues({ ...accountEditValues, password: e.target.value })}
                                    />
                                    <button
                                        className={styles.visibilityBtn}
                                        onClick={() => setShowPassword(!showPassword)}
                                        type="button"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>권한 레벨</label>
                                <select
                                    className={styles.modalSelect}
                                    value={accountEditValues.role}
                                    onChange={(e) => setAccountEditValues({ ...accountEditValues, role: e.target.value })}
                                >
                                    <option value="vendor">VENDOR (일반 업체)</option>
                                    <option value="admin">ADMIN (시스템 관리자)</option>
                                </select>
                            </div>
                        </div>
                        <footer className={styles.modalFooterActions}>
                            <button className={styles.saveBtn} onClick={handleAccountSave}>
                                <Save size={16} /> 계정 정보 업데이트
                            </button>
                            <button className={styles.cancelBtn} onClick={() => setEditingAccount(null)}>
                                취소
                            </button>
                        </footer>
                    </div>
                </div>
            )}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>ANSAN ADMIN</div>
                </div>

                <nav className={styles.sideNav}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <BarChart3 size={20} /> 대시보드
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'approvals' ? styles.active : ''}`}
                        onClick={() => setActiveTab('approvals')}
                    >
                        <UserCheck size={20} />
                        신규 입점 승인
                        {pendingApprovals.length > 0 && <span className={styles.countBadge}>{pendingApprovals.length}</span>}
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'stores' ? styles.active : ''}`}
                        onClick={() => setActiveTab('stores')}
                    >
                        <StoreIcon size={20} /> 매장 관리
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'accounts' ? styles.active : ''}`}
                        onClick={() => setActiveTab('accounts')}
                    >
                        <Users size={20} /> 계정·권한 설정
                    </button>
                    <div className={styles.navDivider}></div>
                    <button
                        className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> 시스템 설정
                    </button>
                </nav>

                <div className={styles.sidebarFooter}>
                    <button 
                        onClick={async () => {
                            if (confirm('정말로 로그아웃 하시겠습니까?')) {
                                await resetAllData();
                            }
                        }} 
                        className={styles.logoutBtn}
                        style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}
                    >
                        <LogOut size={18} /> 서비스 종료
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topHeader}>
                    <div className={styles.headerInfo}>
                        <h1>
                            {activeTab === 'overview' ? '관리자 대시보드' :
                                activeTab === 'approvals' ? '신규 입점 승인' :
                                    activeTab === 'stores' ? '매장 관리' :
                                        activeTab === 'accounts' ? '계정 관리' : '시스템 설정'}
                        </h1>
                        <p>안산유통상가 통합 관리 시스템</p>
                    </div>
                    <div className={styles.adminProfile}>
                        <div className={styles.profileText}>
                            <span className={styles.profileName}>{currentUser?.store_name || currentUser?.email || '사용자'}</span>
                            <span className={styles.profileRole}>{currentUser?.role === 'admin' ? '시스템 관리자' : '입점사 관리'}</span>
                        </div>
                        <div className={styles.avatar}>
                            {currentUser?.email?.[0].toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                <div className={styles.scrollArea}>
                    {activeTab === 'overview' && (
                        <div className={styles.overviewGrid}>
                            <div className={styles.statsRow}>
                                {stats.map((s, i) => (
                                    <div key={i} className={styles.statCard}>
                                        <div className={styles.statIcon} style={{ background: `${s.color}15`, color: s.color }}>
                                            {s.icon}
                                        </div>
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
                                        <div className={styles.activityItem}>
                                            <div className={styles.actDot} style={{ background: '#f59e0b' }}></div>
                                            <div className={styles.actContent}>
                                                <p><strong>새로운 입점 신청</strong>이 3건 대기 중입니다.</p>
                                                <span>방금 전</span>
                                            </div>
                                        </div>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={styles.activityItem}>
                                                <div className={styles.actDot}></div>
                                                <div className={styles.actContent}>
                                                    <p><strong>정밀볼트(A동 102호)</strong> 매장 정보가 수정되었습니다.</p>
                                                    <span>1시간 전</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.subCard}>
                                    <h3>상태 요약</h3>
                                    <div className={styles.statusBox}>
                                        <div className={styles.statusItem}>
                                            <span>내부 서버 상태</span>
                                            <span className={styles.green}>정상</span>
                                        </div>
                                        <div className={styles.statusItem}>
                                            <span>DB 연동</span>
                                            <span className={styles.green}>정상</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div className={styles.approvalsTab}>
                            <div className={styles.tabHeader}>
                                <h3>입점 신청 목록</h3>
                                <p>신청자의 정보가 실제 단지 내 소유/임차 정보와 일치하는지 확인 후 승인해 주세요.</p>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>신청 일시</th>
                                            <th>매장명</th>
                                            <th>신청 위치</th>
                                            <th>아이디(이메일)</th>
                                            <th>상태</th>
                                            <th>결정</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingApprovals.map(app => (
                                            <tr key={app.id}>
                                                <td>{app.created_at ? new Date(app.created_at).toLocaleString() : '방금 전'}</td>
                                                <td><strong className={styles.tableName}>{app.store_name}</strong></td>
                                                <td>{app.location}</td>
                                                <td>{app.vendor_email || '이메일 없음'}</td>
                                                <td><span className={styles.badgeWarning}>검토 대기</span></td>
                                                <td>
                                                    <div className={styles.btnRow}>
                                                        <button className={styles.approveBtn} onClick={() => {
                                                            if (confirm(`[${app.store_name}] 업체의 입점을 최종 승인하시겠습니까?`)) {
                                                                updateStore(app.id, { is_verified: true });
                                                                alert('승인되었습니다. 이제 검색 결과에 매장이 노출됩니다.');
                                                            }
                                                        }}>승인</button>
                                                        <button className={styles.rejectBtn} onClick={() => {
                                                            if (confirm('신청을 반려하시겠습니까? 데이터가 삭제됩니다.')) {
                                                                deleteStore(app.id);
                                                            }
                                                        }}>반려</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'stores' && (
                        <div className={styles.storesTab}>
                            <div className={styles.tableActions}>
                                <div className={styles.searchBar}>
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="매장명, 동/호수 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>매장번호</th>
                                            <th>매장명</th>
                                            <th>위치 (동/호)</th>
                                            <th>업종</th>
                                            <th>인증상태</th>
                                            <th>상태</th>
                                            <th>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStores.map(s => (
                                            <tr key={s.id}>
                                                <td>{new Date(s.created_at || Date.now()).toISOString().split('T')[0].replace(/-/g, '')}-{s.id.replace('s_', '').slice(-4)}</td>
                                                <td><strong className={styles.tableName}>{s.store_name}</strong></td>
                                                <td>{s.location}</td>
                                                <td>{CATEGORY_LABELS[s.category]}</td>
                                                <td>
                                                    {s.is_verified ? (
                                                        <span className={styles.badgeSuccess}><CheckCircle2 size={12} /> 인증됨</span>
                                                    ) : (
                                                        <span className={styles.badgeMuted}>미인증</span>
                                                    )}
                                                </td>
                                                <td><span className={styles.statusDotActive}></span> 노출 중</td>
                                                <td>
                                                    <button className={styles.iconOpBtn} onClick={() => setSelectedStore(s)}>
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'accounts' && (
                        <div className={styles.accountsTab}>
                            <div className={styles.alertBox}>
                                <ShieldCheck size={20} />
                                <p>보안 정책에 따라 비밀번호는 암호화되어 관리됩니다.</p>
                            </div>
                            <div className={styles.accountGrid}>
                                {accounts.map((acc, idx) => {
                                    let store = stores.find(s => s.vendor_email === acc.email);
                                    
                                    // If no exact email match, try to find a store with a similar name or just marked orphan
                                    if (!store && acc.role === 'vendor') {
                                        // Some stores might have been created without email during proto phase
                                        // Just show it as disconnected if not found
                                    }
                                    return (
                                        <div key={acc.email} className={styles.accountCard}>
                                            <div className={styles.accountHeader}>
                                                <div className={styles.accountInfo}>
                                                    <h4 style={!store && acc.role !== 'admin' ? { color: '#ef4444' } : {}}>
                                                        {store ? store.store_name : acc.role === 'admin' ? '시스템 관리자' : '매장 정보 없음'}
                                                    </h4>
                                                    <span style={!store && acc.role !== 'admin' ? { color: '#64748b', fontSize: '0.75rem' } : {}}>
                                                        {store ? store.location : acc.email}
                                                    </span>
                                                </div>
                                                <div className={`${styles.roleBadge} ${acc.role === 'admin' ? styles.adminMode : ''}`}>
                                                    {acc.role.toUpperCase()}
                                                </div>
                                            </div>
                                            <div className={styles.accountDetails}>
                                                <div className={styles.detailRow}>
                                                    <span>로그인 ID:</span>
                                                    <strong>{acc.email}</strong>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <span>소속 매장:</span>
                                                    <span>{store ? store.store_name : '없음'}</span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <span>임시 식별자:</span>
                                                    <span>
                                                        {acc.role === 'admin' ? (
                                                            <strong style={{ color: '#3b82f6' }}>ADMIN</strong>
                                                        ) : (
                                                            `#${accounts.filter((a, i) => a.role === 'vendor' && i <= idx).length}`
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={styles.accountActions}>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => {
                                                        setEditingAccount(acc);
                                                        setAccountEditValues({ ...acc });
                                                    }}
                                                >
                                                    <Edit2 size={14} /> 계정 정보 수정
                                                </button>
                                                {acc.role !== 'admin' && (
                                                    <button
                                                        className={`${styles.resetBtn} ${styles.dangerLink}`}
                                                        onClick={() => handleDeleteAccount(acc)}
                                                        type="button"
                                                    >
                                                        <Trash2 size={14} /> 삭제
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* 계정이 존재하지 않는 미등록 매장들 표시 */}
                                {stores.filter(s => !accounts.find(a => a.email === s.vendor_email)).map((orphanStore) => (
                                    <div key={orphanStore.id} className={styles.accountCard} style={{ opacity: 0.8, borderStyle: 'dashed' }}>
                                        <div className={styles.accountHeader}>
                                            <div className={styles.accountInfo}>
                                                <h4 style={{ color: '#ef4444' }}>{orphanStore.store_name}</h4>
                                                <span>{orphanStore.location || '위치 미지정'}</span>
                                            </div>
                                            <div className={styles.roleBadge} style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                                                계정 미등록
                                            </div>
                                        </div>
                                        <div className={styles.accountDetails}>
                                            <div className={styles.detailRow}>
                                                <span>연결된 ID:</span>
                                                <strong style={{ color: '#ef4444' }}>없음 (가입 대기)</strong>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span>상태:</span>
                                                <span>업체에서 직접 회원가입을 해야 계정이 생성됩니다.</span>
                                            </div>
                                        </div>
                                        <div className={styles.accountActions}>
                                            <button className={styles.editBtn} style={{ opacity: 0.5, cursor: 'not-allowed' }} type="button">
                                                계정 연결 대기 중...
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div className={styles.settingsTab}>
                            <div className={styles.tabHeader}>
                                <h3>시스템 및 데이터 관리</h3>
                                <p>브라우저에 저장된 모든 로컬 데이터를 초기화하거나 시스템 설정을 조정합니다.</p>
                            </div>

                            <div className={styles.settingsContent}>
                                <div className={styles.settingsCard} style={{ borderLeftColor: '#3b82f6', marginBottom: '2rem' }}>
                                    <div className={styles.cardHeader}>
                                        <h4>💾 시스템 데이터 백업 및 복구</h4>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <p style={{ marginBottom: '1rem', color: '#64748b' }}>등록된 매장 및 계정 정보를 JSON 파일 형태로 PC에 백업하거나, 백업된 데이터를 복구할 수 있습니다.</p>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                className={styles.resetFullBtn}
                                                style={{ backgroundColor: '#3b82f6', color: 'white' }}
                                                onClick={handleBackup}
                                            >
                                                <Download size={16} style={{ marginRight: '0.5rem' }} /> 데이터 백업 (다운로드)
                                            </button>
                                            <input
                                                type="file"
                                                id="restoreJsonUpload"
                                                accept="application/json"
                                                style={{ display: 'none' }}
                                                onChange={handleRestore}
                                            />
                                            <button
                                                className={styles.resetFullBtn}
                                                style={{ backgroundColor: '#10b981', color: 'white' }}
                                                onClick={() => document.getElementById('restoreJsonUpload')?.click()}
                                            >
                                                <UploadCloud size={16} style={{ marginRight: '0.5rem' }} /> 백업 파일 복구
                                            </button>
                                            <button
                                                className={styles.resetFullBtn}
                                                style={{ backgroundColor: '#f59e0b', color: 'white' }}
                                                onClick={handleExcelExport}
                                            >
                                                <FileSpreadsheet size={16} style={{ marginRight: '0.5rem' }} /> 엑셀(CSV) 내보내기
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.settingsCard}>
                                    <div className={styles.cardHeader}>
                                        <h4>🛠️ 데이터 초기화 (Danger Zone)</h4>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <p>삭제가 제대로 안 되거나 데이터가 꼬인 경우, 아래 버튼을 눌러 모든 데이터를 초기 상태로 되돌립니다.</p>
                                        <div className={styles.warningBox}>
                                            <strong>주의:</strong> 현재까지 등록/수정된 모든 정보가 초기 Mock 데이터로 대체됩니다.
                                        </div>
                                        <button
                                            className={styles.resetFullBtn}
                                            onClick={() => {
                                                if (confirm('정말로 모든 데이터를 초기화하고 페이지를 새로고침하시겠습니까?')) {
                                                    resetAllData();
                                                }
                                            }}
                                        >
                                            모든 로컬 데이터 초기화 및 시스템 재시작
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
