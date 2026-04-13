const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SEED_STORES = [
  {
    store_name: '정밀볼트공구',
    category: 'fastener',
    location: '12동 102호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    phone: '031-491-1234',
    keywords: ['볼트', '너트', '피스', '특수볼트'],
    is_verified: true,
    vendor_id: '5f6e9ec5-18cf-4f62-9e6d-f3cce0d4a02a'
  },
  {
    store_name: '신성전기전자',
    category: 'electric',
    location: '21동 205호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    phone: '031-492-5678',
    keywords: ['차단기', '전선', 'LED조명'],
    is_verified: true,
    vendor_id: '5f6e9ec5-18cf-4f62-9e6d-f3cce0d4a02a'
  },
  {
    store_name: '안산종합공구',
    category: 'tool',
    location: '15동 110호',
    road_address: '경기도 안산시 단원구 산단로 326 (안산유통상가 1차)',
    phone: '031-493-9012',
    keywords: ['마키다', '드릴', '측정기'],
    is_verified: true,
    vendor_id: '5f6e9ec5-18cf-4f62-9e6d-f3cce0d4a02a'
  }
];

async function seed() {
  console.log('Starting direct database seed...');
  const { data, error } = await supabase.from('stores').insert(SEED_STORES);
  
  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log('Successfully inserted sample stores into Supabase!');
  }
}

seed();
