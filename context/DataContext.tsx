'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Store, MOCK_STORES } from '@/types';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  stores: Store[];
  accounts: any[];
  addStore: (store: Store) => Promise<void>;
  updateStore: (id: string, updates: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
  addAccount: (account: any) => Promise<void>;
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  updateAccount: (email: string, updates: any) => Promise<void>;
  deleteAccount: (email: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Sync with Supabase Auth
  useEffect(() => {
    // onAuthStateChange handles both initial session and subsequent changes.
    // 'INITIAL_SESSION' event will trigger on subscribe if a session exists.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      
      if (session?.user) {
        // Optimistic update for minimal session info to avoid Auth Guard kick-outs
        setCurrentUser((prev: any) => prev && prev.id === session.user.id ? prev : {
            id: session.user.id,
            email: session.user.email,
            role: 'vendor'
        });

        setIsAuthLoading(true);
        try {
          // 5초 타임아웃 적용하여 프로필 조회가 늦어져도 로그인은 진행되도록 개선
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('PROFILE_FETCH_TIMEOUT')), 10000)
          );

          const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;

          if (profile) {
            setCurrentUser((prev: any) => ({
                ...prev,
                ...profile,
                role: profile.role || 'vendor'
            }));
          }
        } catch (err) {
          console.error("Profile fetch error or timeout:", err);
          // 타임아웃이나 에러가 발생해도 currentUser 기본 정보는 이미 설정되어 있으므로 계속 진행
        } finally {
          setIsAuthLoading(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch initial stores from Supabase with timeout
  const fetchStores = async () => {
    setIsLoading(true);
    try {
        const storePromise = supabase
            .from('stores')
            .select('*')
            .order('created_at', { ascending: false });
            
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('STORES_FETCH_TIMEOUT')), 5000)
        );

        const { data, error } = await Promise.race([storePromise, timeoutPromise]) as any;
        
        if (error) throw error;
        
        const mappedStores = (data || []).map((s: any) => ({
            ...s,
            keywords: s.keywords || [],
            is_verified: s.is_verified ?? true
        }));
        
        setStores(mappedStores);
    } catch (err) {
        console.error("Failed to fetch stores or timeout:", err);
        // Fallback to MOCK_STORES if DB fetch fails or times out
        if (stores.length === 0) setStores(MOCK_STORES);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();

    // Emergency loading canceler: if after 10s it's still loading, force it off.
    const timer = setTimeout(() => {
        setIsLoading(false);
        setIsAuthLoading(false);
        console.warn("Emergency loading cancel triggered after 10s.");
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const addStore = async (store: Store) => {
    try {
        const { error } = await supabase.from('stores').insert([{
            ...store,
            vendor_id: currentUser?.id // Link to current user
        }]);
        if (error) throw error;
        await fetchStores(); // Refresh
    } catch (err) {
        console.error("Add store failed:", err);
        // Optimistic local update
        setStores(prev => [store, ...prev]);
    }
  };

  const updateStore = async (id: string, updates: Partial<Store>) => {
    try {
        const { error } = await supabase
            .from('stores')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
        await fetchStores();
    } catch (err) {
        console.error("Update store failed:", err);
        setStores(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }
  };

  const deleteStore = async (id: string) => {
    try {
        const { error } = await supabase
            .from('stores')
            .delete()
            .eq('id', id);
        if (error) throw error;
        await fetchStores();
    } catch (err) {
        console.error("Delete store failed:", err);
        setStores(prev => prev.filter(s => s.id !== id));
    }
  };

  const addAccount = async (account: any) => {
    // This usually happens through supabase.auth.signUp
    setAccounts(prev => [...prev, account]);
  };

  const updateAccount = async (email: string, updates: any) => {
    // Update profile in DB
    setAccounts(prev => prev.map(acc => acc.email === email ? { ...acc, ...updates } : acc));
  };

  const deleteAccount = async (email: string) => {
    setAccounts(prev => prev.filter(a => a.email !== email));
  };

  const resetAllData = async () => {
    // Resetting DB data is dangerous, so just clear local and logout
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <DataContext.Provider value={{ 
        stores, 
        accounts, 
        addStore, 
        updateStore, 
        deleteStore, 
        addAccount, 
        updateAccount, 
        deleteAccount, 
        currentUser, 
        setCurrentUser,
        resetAllData,
        isLoading: isLoading || isAuthLoading
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
