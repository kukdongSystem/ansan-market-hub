export type UserRole = 'admin' | 'sub_admin' | 'vendor';

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  display_name: string | null;
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
  food: '식당/카페/간식',
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
  operating_hours?: string;
  is_verified?: boolean;
  vendor_email?: string;
  created_at: string;
}

export const MOCK_STORES: Store[] = [
  {
    id: 's_1',
    store_name: '정밀볼트공구',
    category: 'fastener',
    location: '12동 102호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    phone: '031-491-1234',
    keywords: ['볼트', '너트', '피스', '특수볼트'],
    description: '모든 규격의 산업용 볼트/너트 전문 취급점입니다.',
    image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 's_2',
    store_name: '신성전기전자',
    category: 'electric',
    location: '21동 205호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    phone: '031-492-5678',
    keywords: ['LS산전', '차단기', '전선', 'LED조명'],
    description: '자동제어 부품 및 전기 자재 일체를 공급합니다.',
    image_url: 'https://images.unsplash.com/photo-1558444479-c8ad5162e0b0?q=80&w=800',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 's_3',
    store_name: '안산종합공구',
    category: 'tool',
    location: '15동 110호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    phone: '031-493-9012',
    keywords: ['마키다', '드릴', '측정기', '수공구'],
    description: '브랜드 전동공구 및 수공구 전문 종합 백화점입니다.',
    image_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615ad?q=80&w=800',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 's_4',
    store_name: '대성베어링',
    category: 'bearing',
    location: '17동 105호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    phone: '031-494-1111',
    keywords: ['베어링', '체인', '동력전달장치'],
    description: null,
    image_url: null,
    is_verified: true,
    created_at: new Date().toISOString()
  }
];

export const MOCK_ACCOUNTS = [
  { email: 'admin@ansan.com', password: 'admin1234', role: 'admin' },
  { email: 'soons28@naver.com', password: 'password123', role: 'vendor' },
];
