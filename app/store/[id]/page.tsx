'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Store, CATEGORY_LABELS } from '@/types';
import { useData } from '@/context/DataContext';
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
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import styles from './store.module.css';

export default function StoreDetailPage() {
  const { stores } = useData();
  const { id } = useParams();
  const router = useRouter();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportSent, setReportSent] = useState(false);
  
  const store = stores.find(s => s.id === id);

  if (!store) {
    return (
      <div className={styles.notFound}>
        <h1>매장을 찾을 수 없습니다.</h1>
        <Link href="/">홈으로 돌아가기</Link>
      </div>
    );
  }

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
                <h3>📞 연락처 및 영업정보</h3>
                <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                        <Phone size={20} />
                        <div>
                            <strong>대표번호</strong>
                            <p>{store.phone || '등록된 번호가 없습니다.'}</p>
                        </div>
                    </div>
                    <div className={styles.infoItem}>
                        <Clock size={20} />
                        <div>
                            <strong>영업시간</strong>
                            <p>평일 09:00 - 18:00 (토요일 15:00까지)</p>
                            <span>※ 공휴일 및 일요일 휴무</span>
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
        <button className={styles.callBtn}>전화 걸기</button>
        <button className={styles.contactBtn}>문의하기</button>
      </footer>
    </div>
  );
}
