import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { csvContent } = await request.json();
    
    const now = new Date();
    const timestamp = now.getFullYear().toString() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + '_' +
                     String(now.getHours()).padStart(2, '0') +
                     String(now.getMinutes()).padStart(2, '0') +
                     String(now.getSeconds()).padStart(2, '0');

    // CWD 기반으로 '엑셀파일보관함' 폴더 절대 경로 설정
    const dir = path.join(process.cwd(), '엑셀파일보관함');
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `ansan_excel_${timestamp}.csv`;
    const filePath = path.join(dir, filename);

    // 파일 시스템(fs)을 통해 서버 컴퓨터 하드디스크에 직접 저장 (BOM 포함)
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    return NextResponse.json({ success: true, filename, filePath });
  } catch (error: any) {
    console.error('Excel Export API failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
