export type UserRole = 'admin' | 'vendor';

export interface Profile {
  id: string;
  role: UserRole;
  unit_info: string | null;
  contact: string | null;
  created_at: string;
}

export type StoreCategory =
  | 'fastener'     // 볼트, 너트, 체결류
  | 'tool'         // 공구, 전동공구, 수공구
  | 'bearing'      // 베어링, 동력전달장치
  | 'welding'      // 용접, 가스, 절단
  | 'electric'     // 전기, 조명, 자동화
  | 'electronics'  // 전자부품, 통신, 반도체
  | 'pipe'         // 배관, 펌프, 밸브
  | 'packaging'    // 포장, 물류, 산업자재
  | 'safety'       // 안전용품, 소방, 보안
  | 'cnc'          // 공작기계, 금형, 가공
  | 'printing'     // 인쇄, 광고, 명함, 간판
  | 'food'         // 식당, 카페, 편의점
  | 'service'      // 은행, 부동산, 배송, 세무
  | 'chemical'     // 화학용품, 페인트, 케미칼
  | 'etc';         // 기타

export const CATEGORY_LABELS: Record<StoreCategory, string> = {
  fastener: '볼트/너트/체결',
  tool: '공구/전동/수공구',
  bearing: '베어링/동력전달',
  welding: '용접/가스/안전',
  electric: '전기/조명/자동화',
  electronics: '전자부품/반도체',
  pipe: '배관/펌프/밸브',
  packaging: '포장/물류/자재',
  safety: '안전/소방/보안',
  cnc: '기계/금형/가공',
  printing: '인쇄/광고/간판',
  food: '식당/까페/간식',
  service: '서비스/금융/행정',
  chemical: '화학/페인트/케미칼',
  etc: '기타/미분류'
};

export interface Store {
  id: string;
  vendor_id?: string;
  store_name: string;
  category: StoreCategory;
  sub_category?: string;
  location: string | null;
  building?: string;
  floor?: string;
  room?: string;
  road_address: string;
  keywords: string[];
  description: string | null;
  image_url: string | null;
  phone?: string;
  is_verified?: boolean;
  vendor_email?: string;
  created_at: string;
}

export const MOCK_STORES: Store[] = [
  {
    id: '1',
    store_name: '안산 정밀 볼트',
    category: 'fastener',
    location: '지상 (1~23동) 1층 102호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    keywords: ['볼트', '너트', '와셔', '특수볼트'],
    description: '모든 규격의 산업용 볼트와 너트를 취급합니다.',
    image_url: null,
    phone: '031-123-4567',
    is_verified: true,
    vendor_email: 'vendor@ansan.com',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    store_name: '상가 분식',
    category: 'food',
    location: '편익 B동 지하 1층 B105호',
    road_address: '경기도 안산시 단원구 풍전로 7 (안산유통상가 1차)',
    keywords: ['김밥', '라면', '떡볶이', '점심'],
    description: '오랜 전통의 단지 내 대표 분식점입니다.',
    image_url: null,
    phone: '031-987-6543',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    store_name: '하이테크 전자',
    category: 'electronics',
    location: '지상 (1~23동) 2층 210호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    keywords: ['IC', '저항', '콘덴서', '센서'],
    description: '정밀 전자 부속 전문 매장입니다.',
    image_url: null,
    is_verified: false,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    store_name: '극동계전',
    category: 'electric',
    location: '지상 (1~23동) 21동 205호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    keywords: ['계전기', '자동제어', 'LS산전', '전지자재'],
    description: 'LS산전 전문 대리점, 자동제어 부품 일체 취급.',
    image_url: null,
    phone: '031-492-3311',
    is_verified: true,
    vendor_email: 'soons28@naver.com',
    created_at: new Date().toISOString()
  }
];

export const MOCK_ACCOUNTS = [
  { email: 'admin@ansan.com', password: 'admin1234', role: 'admin' },
  { email: 'vendor@ansan.com', password: 'vendor1234', role: 'vendor' },
  { email: 'soons28@naver.com', password: 'password123', role: 'vendor' },
];
