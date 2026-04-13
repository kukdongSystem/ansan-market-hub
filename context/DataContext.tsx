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
  updateAccount: (id: string, updates: any) => Promise<void>;
  updateCurrentUserPassword: (password: string) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  todayVisitorCount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [todayVisitorCount, setTodayVisitorCount] = useState(1245); // Mock initial value

  // Sync with Supabase Auth
  useEffect(() => {
    // 1. Check current session immediately on mount
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("Initial Session Found:", session.user.email);
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            role: 'vendor' // Default role while fetching profile
          });
          
          // Trigger profile fetch
          fetchProfile(session.user.id);
        } else {
          setIsAuthLoading(false);
        }
      } catch (err) {
        console.error("Initial session check failed:", err);
        setIsAuthLoading(false);
      }
    };

    checkInitialSession();

    // 2. Listen for Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      
      if (session?.user) {
        setCurrentUser((prev: any) => prev && prev.id === session.user.id ? prev : {
            id: session.user.id,
            email: session.user.email,
            role: 'vendor'
        });
        
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          fetchProfile(session.user.id);
        }
      } else {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setIsAuthLoading(true);
    try {
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PROFILE_FETCH_TIMEOUT')), 8000)
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
    } finally {
      setIsAuthLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
        console.log("Seeding database with sample stores...");
        // id를 제외한 데이터만 추출하여 insert (DB에서 자동 생성하거나 겹치지 않게 처리)
        const seedData = MOCK_STORES.map(({ id, ...rest }) => ({
            ...rest,
            vendor_id: currentUser?.id || '5f6e9ec5-18cf-4f62-9e6d-f3cce0d4a02a'
        }));
        
        const { error } = await supabase.from('stores').insert(seedData);
        if (error) throw error;
        console.log("Database seeded successfully!");
        await fetchStores(); // Refresh after seeding
    } catch (err) {
        console.error("Failed to seed database:", err);
    }
  };

  // Fetch accounts (profiles) from DB
  const fetchAccounts = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
        setAccounts([]);
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        setAccounts(data || []);
    } catch (err) {
        console.error("Failed to fetch accounts:", err);
    }
  };

  // Fetch initial stores from Supabase with timeout
  const fetchStores = async () => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // DB 컬럼명 매핑 (name -> store_name, owner_id -> vendor_id)
        const mappedData = (data || []).map((d: any) => ({
            ...d,
            store_name: d.name || d.store_name, 
            vendor_id: d.owner_id || d.vendor_id
        }));
        
        setStores(mappedData);
    } catch (err) {
        console.error("Failed to fetch stores:", err);
    } finally {
        setIsLoading(false);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    const storesChannel = supabase
      .channel('stores-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, () => {
        fetchStores();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchAccounts();
      })
      .subscribe();

    const visitorTimer = setInterval(() => {
        setTodayVisitorCount(prev => prev + Math.floor(Math.random() * 2));
    }, 15000);

    return () => {
      supabase.removeChannel(storesChannel);
      supabase.removeChannel(profilesChannel);
      clearInterval(visitorTimer);
    };
  }, [currentUser?.role]);

  useEffect(() => {
    fetchStores();
    if (currentUser?.role === 'admin') {
        fetchAccounts();
    }
  }, [currentUser?.role]);

  const addStore = async (store: Store) => {
    try {
        const dbData: any = {
            name: store.store_name,
            owner_id: currentUser?.id,
            road_address: store.road_address || '',
            phone: store.phone || '',
            category: store.category,
            is_verified: store.is_verified ?? false
        };

        let finalDescription = store.description || '';
        if (store.location) {
            finalDescription = `[상세위치: ${store.location}]\n${finalDescription}`;
        }
        if (store.keywords && store.keywords.length > 0) {
            finalDescription = `${finalDescription}\n[키워드: ${store.keywords.join(', ')}]`;
        }
        dbData.description = finalDescription.trim();

        const { error } = await supabase.from('stores').insert([dbData]);
        if (error) throw error;

        await fetchStores();
    } catch (err: any) {
        console.error("Add store failed:", err);
        throw err;
    }
  };

  const updateStore = async (id: string, updates: Partial<Store>) => {
    try {
        // DB 컬럼에 맞게 매핑 변환
        const dbUpdates: any = { ...updates };
        
        if (updates.store_name) {
            dbUpdates.name = updates.store_name;
            delete dbUpdates.store_name;
        }
        if (updates.vendor_id) {
            dbUpdates.owner_id = updates.vendor_id;
            delete dbUpdates.vendor_id;
        }

        // location이나 keywords가 포함된 경우 description에 통합 처리
        if (updates.location || updates.keywords) {
            const currentStore = stores.find(s => s.id === id);
            let finalDesc = updates.description !== undefined ? updates.description : (currentStore?.description || '');
            
            const loc = updates.location !== undefined ? updates.location : currentStore?.location;
            const keys = updates.keywords !== undefined ? updates.keywords : currentStore?.keywords;

            if (loc) finalDesc = `[상세위치: ${loc}]\n${finalDesc}`;
            if (keys && keys.length > 0) finalDesc = `${finalDesc}\n[키워드: ${keys.join(', ')}]`;
            
            dbUpdates.description = finalDesc.trim();
            delete dbUpdates.location;
            delete dbUpdates.keywords;
        }

        const { error } = await supabase.from('stores').update(dbUpdates).eq('id', id);
        if (error) throw error;
        
        await fetchStores();
    } catch (err: any) {
        console.error("Update store failed:", err);
        alert(`수정 실패: ${err.message}`);
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
    await fetchAccounts();
  };

  const updateAccount = async (id: string, updates: any) => {
    try {
        console.log("Updating account profile:", id, updates);
        const { error } = await supabase
            .from('profiles')
            .update({
                role: updates.role
            })
            .eq('id', id);
        if (error) throw error;

        // If this is the current user and email is being updated, we should also try to update auth (this is complex in Supabase side without admin key)
        // But for password, we can provide a separate method for current user.

        await fetchAccounts();
    } catch (err) {
        console.error("Update account profile failed:", err);
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
    }
  };

  const updateCurrentUserPassword = async (password: string): Promise<boolean> => {
    try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Failed to update password:", err);
        return false;
    }
  };

  const deleteAccount = async (id: string): Promise<void> => {
    try {
        console.log("계정 삭제 시도 중... ID:", id);
        // 프로필 삭제 (실제 Auth 유저는 Admin API 권한이 필요하여 명부만 정리)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);
            
        if (error) {
            console.error("DB 삭제 실패:", error.message);
            throw error;
        }
        
        // 목록 새로고침
        await fetchAccounts();
    } catch (err: any) {
        console.error("계정 삭제 프로세스 오류:", err);
        // 로컬 목록에서라도 우선 제거하여 사용자 경험 유지
        setAccounts(prev => prev.filter(a => a.id !== id));
        throw err;
    }
  };

  const logout = async () => {
    try {
        await supabase.auth.signOut();
        setCurrentUser(null);
        window.location.href = '/';
    } catch (err) {
        console.error("Logout failed:", err);
        // Fallback for failed signout
        window.location.href = '/';
    }
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
        updateCurrentUserPassword,
        deleteAccount, 
        currentUser, 
        setCurrentUser,
        resetAllData,
        logout,
        isLoading: isLoading || isAuthLoading,
        todayVisitorCount
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
