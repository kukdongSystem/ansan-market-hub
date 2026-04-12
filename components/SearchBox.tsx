'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  initialValue?: string;
  placeholder?: string;
  placeholders?: string[];
}

export default function SearchBox({ initialValue = '', placeholder, placeholders }: SearchBoxProps) {
  const [query, setQuery] = useState(initialValue);
  const [isScanning, setIsScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!placeholders || placeholders.length <= 1) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
       alert('이미지 파일만 업로드 가능합니다.');
       return;
    }
    setIsScanning(true);
    setIsDragging(false);
    
    // Simulate Image Analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsScanning(false);
    router.push(`/search?q=${encodeURIComponent('볼트')}&mode=image`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={styles.wrapper}>
      <form 
        className={`${styles.container} ${isDragging ? styles.dragOver : ''}`} 
        onSubmit={handleSearch}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
            <div className={styles.dragOverlay}>
                <UploadCloud size={24} className={styles.bounce} />
                <span>여기에 이미지를 놓으세요</span>
            </div>
        )}
        
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isScanning ? '이미지를 분석하고 있습니다...' : (placeholders ? placeholders[placeholderIndex] : placeholder || '어떤 매장을 찾으시나요?')} 
          className={styles.input}
          disabled={isScanning}
        />
        
        <div className={styles.actions}>
          <input 
            type="file" 
            ref={fileInputRef} 
            className={styles.hiddenFile} 
            accept="image/*"
            onChange={handleFileChange}
          />
          <button 
            type="button" 
            title="이미지로 찾기 (Drag & Drop 가능)" 
            className={styles.iconBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
          >
            {isScanning ? <Loader2 size={20} className={styles.spin} /> : <ImageIcon size={20} />}
          </button>
          <button type="submit" className={styles.searchBtn} disabled={isScanning}>
            {isScanning ? '분석 중...' : (
              <>
                <Search size={20} />
                <span>검색</span>
              </>
            )}
          </button>
        </div>
      </form>
      {isScanning && (
        <div className={styles.scanningBar}></div>
      )}
    </div>
  );
}
