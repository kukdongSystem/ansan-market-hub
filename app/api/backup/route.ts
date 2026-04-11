import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 날짜와 시간(초 단위)까지 포함하여 파일명 생성 (예: 20260411_153022)
    const now = new Date();
    const timestamp = now.getFullYear().toString() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + '_' +
                     String(now.getHours()).padStart(2, '0') +
                     String(now.getMinutes()).padStart(2, '0') +
                     String(now.getSeconds()).padStart(2, '0');

    // CWD 기반으로 '백업파일보관함' 폴더 절대 경로 설정
    const backupDir = path.join(process.cwd(), '백업파일보관함');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `ansan_backup_${timestamp}.json`;
    const filePath = path.join(backupDir, filename);

    // 파일 시스템(fs)을 통해 서버 컴퓨터 하드디스크에 직접 저장
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true, filename, filePath });
  } catch (error: any) {
    console.error('Backup API failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
