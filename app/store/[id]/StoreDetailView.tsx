'use client';

import { useState } from 'react';
import { Store, CATEGORY_LABELS, Profile as UserProfile } from '@/types';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Share2, 
  ArrowLeft, 
  ShieldCheck, 
  Image as ImageIcon,
  Tag,
  Building2,
  Navigation,
  AlertTriangle,
  X,
  MessageSquare,
  Edit2,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './store.module.css';

interface StoreDetailViewProps {
    store: Store;
    currentUser: UserProfile | null;
    updateStore: (id: string, updates: Partial<Store>) => Promise<void>;
}

export default function StoreDetailView({ store, currentUser, updateStore }: StoreDetailViewProps) {
  const router = useRouter();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportSent, setReportSent] = useState(false);
  
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editPhone, setEditPhone] = useState(store.phone || '');
  const [editHours, setEditHours] = useState(store.operating_hours || '');

  const isOwner = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.role === 'sub_admin' ||
    (store.vendor_id === currentUser.id) ||
    (store.vendor_email && currentUser.email?.toLowerCase().trim() === store.vendor_email.toLowerCase().trim())
  );

  const handleEditContact = () => {
    setEditPhone(store.phone || '');
    setEditHours(store.operating_hours || '');
    setIsEditingContact(true);
  };

  const handleSaveContact = () => {
    updateStore(store.id, { phone: editPhone, operating_hours: editHours });
    setIsEditingContact(false);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSent(true);
    setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSent(false);
        setReportContent('');
        alert('신고가 접수되었습니다. 관리자 검토 후 반영하겠습니다.');
    }, 1500);
  };

  return (
    <div className={styles.container}>
      {/* Report Modal */}
      {isReportModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsReportModalOpen(false)}>
              <div className={styles.reportModal} onClick={e => e.stopPropagation()}>
                  <header className={styles.modalHeader}>
                      <h3><AlertTriangle size={18} color="#f59e0b"/> 정보 수정 제안</h3>
                      <button onClick={() => setIsReportModalOpen(false)}><X size={20}/></button>
                  </header>
                  <form onSubmit={handleReportSubmit} className={styles.reportForm}>
                      <p>잘못된 정보(위치, 전화번호, 품목 등)를 알려주세요.</p>
                      <textarea 
                        required
                        placeholder="예: 여기가 아니고 12동으로 이사갔어요. / 전화번호가 031-xxx-xxxx 로 바뀌었습니다."
                        value={reportContent}
                        onChange={(e) => setReportContent(e.target.value)}
                      />
                      <button type="submit" disabled={reportSent}>
                          {reportSent ? '제출 중...' : '신고 제출하기'}
                      </button>
                  </form>
              </div>
          </div>
      )}

      <header className={styles.header}>
        <button 
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }} 
          className={styles.backBtn}
          type="button"
        >
          <ArrowLeft size={24} />
        </button>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn}><Share2 size={20} /></button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Store Visuals */}
        <section className={styles.visualSection}>
          <div className={styles.mainImage}>
             <div className={styles.imagePlaceholder}>
                <ImageIcon size={64} />
                <p>등록된 매장 사진이 없습니다.</p>
             </div>
          </div>
          <div className={styles.storeBasicInfo}>
            <div className={styles.categoryBadge}>{CATEGORY_LABELS[store.category]}</div>
            <h1 className={styles.storeName}>
                {store.store_name}
                {store.is_verified && <ShieldCheck className={styles.verifyIcon} size={24} />}
            </h1>
            <p className={styles.storeDescription}>{store.description || '안산유통상가 인증 매장입니다.'}</p>
          </div>
        </section>

        {/* Store Details Grid */}
        <div className={styles.contentGrid}>
          <div className={styles.infoColumn}>
            <section className={styles.infoCard}>
                <h3>🏠 매장 위치 정보</h3>
                <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                        <MapPin size={20} />
                        <div>
                            <strong>도로명 주소</strong>
                            <p>{store.road_address}</p>
                        </div>
                    </div>
                    <div className={styles.infoItem}>
                        <Building2 size={20} />
                        <div>
                            <strong>상세 위치 (동/호수)</strong>
                            <p>{store.location}</p>
                        </div>
                        <button className={styles.mapLinkBtn}><Navigation size={14}/> 지도보기</button>
                    </div>
                </div>
            </section>

            <section className={styles.infoCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ margin: 0 }}>📞 연락처 및 영업정보</h3>
                        {isOwner && <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>관리 모드</span>}
                    </div>
                    {isOwner && !isEditingContact && (
                        <button onClick={handleEditContact} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <Edit2 size={14} /> 수정
                        </button>
                    )}
                    {isOwner && isEditingContact && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleSaveContact} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#3b82f6', color: 'white', border: 'none', padding: '0.35rem 0.6rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                <Check size={14} /> 저장
                            </button>
                            <button onClick={() => setIsEditingContact(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.35rem 0.6rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                <X size={14} /> 취소
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                        <Phone size={20} />
                        <div style={{ width: '100%' }}>
                            <strong>대표번호</strong>
                            {isEditingContact ? (
                                <input 
                                    className={styles.inlineInput}
                                    placeholder="예: 031-123-4567"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }}
                                />
                            ) : (
                                <p>{store.phone || '등록된 번호가 없습니다.'}</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.infoItem}>
                        <Clock size={20} />
                        <div style={{ width: '100%' }}>
                            <strong>영업시간</strong>
                            {isEditingContact ? (
                                <input 
                                    className={styles.inlineInput}
                                    placeholder="예: 평일 09:00 ~ 18:00"
                                    value={editHours}
                                    onChange={(e) => setEditHours(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }}
                                />
                            ) : (
                                <>
                                    <p>{store.operating_hours || '상세 정보 없음'}</p>
                                    {!store.operating_hours && <span>※ 상가 기본 영업시간은 평일 09:00 - 18:00 입니다.</span>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
          </div>

          <div className={styles.tagColumn}>
            <section className={styles.infoCard}>
                <h3><Tag size={18}/> 취급 품목 키워드</h3>
                <div className={styles.tagCloud}>
                    {store.keywords.map((tag, idx) => (
                        <span key={idx} className={styles.tag}>#{tag}</span>
                    ))}
                </div>
            </section>
            
            <div className={styles.adCard}>
                <p>본 매장의 정보가 잘못되었나요?</p>
                <button onClick={() => setIsReportModalOpen(true)}>
                    <MessageSquare size={16} style={{marginRight: '0.5rem'}}/>
                    정보 수정 제안하기
                </button>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <button className={styles.callBtn} onClick={() => store.phone && (window.location.href = `tel:${store.phone}`)}>전화 걸기</button>
        <button className={styles.contactBtn}>문의하기</button>
      </footer>
    </div>
  );
}
