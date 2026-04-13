-- 기존 테이블 삭제 (순서 주의)
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS profiles;

-- 1. profiles 테이블 생성
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'vendor')) NOT NULL DEFAULT 'vendor',
  unit_info TEXT, -- 동/호수
  contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. stores 테이블 생성
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  store_name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  location TEXT,
  road_address TEXT,
  keywords TEXT[] DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  phone TEXT,
  operating_hours TEXT,
  is_verified BOOLEAN DEFAULT false,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- [무한 재귀 방지] 관리자 체크 함수 생성
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- profiles 정책
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- 관리자 전용 정책 (함수 사용으로 재귀 방지)
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (public.check_is_admin());

-- stores 정책
CREATE POLICY "Stores are viewable by everyone" ON stores FOR SELECT USING (true);
CREATE POLICY "Vendors can manage own store" ON stores
  FOR ALL USING (auth.uid() = vendor_id);
-- 관리자 전용 정책
CREATE POLICY "Admins can manage all stores" ON stores
  FOR ALL USING (public.check_is_admin());

-- 3. 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'vendor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
