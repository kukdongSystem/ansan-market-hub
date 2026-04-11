'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
interface VendorAccountRequest {
  unit_info: string;
  contact: string;
}

export async function createVendorAccount(data: VendorAccountRequest) {
  const { unit_info, contact } = data;

  // 1. 임시 비밀번호 생성 (8자리 랜덤)
  const tempPassword = Math.random().toString(36).slice(-8);
  
  // 2. 이메일 생성 (동/호수 기반 가상 이메일 또는 연락처 기반)
  // 예: unit_a101@ansan.com
  const formattedUnit = unit_info.replace(/\s+/g, '_').toLowerCase();
  const email = `${formattedUnit}@ansan-market.com`;

  try {
    // 3. Supabase Auth 사용자 생성
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'vendor', unit_info }
    });

    if (authError) throw authError;

    // 4. profiles 테이블에 정보 삽입
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        role: 'vendor',
        unit_info,
        contact
      });

    if (profileError) throw profileError;

    return {
      success: true,
      data: {
        email,
        password: tempPassword,
        unit_info
      }
    };
  } catch (error: any) {
    console.error('Error creating vendor account:', error);
    return {
      success: false,
      error: error.message || '계정 생성 중 오류가 발생했습니다.'
    };
  }
}
