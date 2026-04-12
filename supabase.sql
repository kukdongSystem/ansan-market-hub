-- profiles 테이블 생성
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'vendor')) NOT NULL DEFAULT 'vendor',
  unit_info TEXT, -- 동/호수 (예: A동 101호)
  contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- stores 테이블 생성
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  store_name TEXT NOT NULL,
  location TEXT,
  keywords TEXT[] DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  phone TEXT,
  operating_hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security) 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 프로필만 수정 가능, 조회는 모두 가능 (또는 관리자만)
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 정책: 관리자는 모든 프로필 수정 가능
CREATE POLICY "Admins can do everything on profiles" ON profiles 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 정책: 매장 정보는 누구나 조회 가능
CREATE POLICY "Stores are viewable by everyone" ON stores FOR SELECT USING (true);

-- 정책: 입점주는 본인 매장만 관리 가능
CREATE POLICY "Vendors can manage own store" ON stores
  FOR ALL USING (auth.uid() = vendor_id);

-- 정책: 관리자는 모든 매장 관리 가능
CREATE POLICY "Admins can manage all stores" ON stores
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
