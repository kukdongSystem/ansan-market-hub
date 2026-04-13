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
        setStores(data || []);
    } catch (err) {
        console.error("Failed to fetch stores:", err);
    } finally {
        setIsLoading(false);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    // 1. Stores subscription
    const storesChannel = supabase
      .channel('stores-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, () => {
        console.log("Real-time: Store table changed, refreshing...");
        fetchStores();
      })
      .subscribe();

    // 2. Profiles (Accounts) subscription
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log("Real-time: Profiles table changed, refreshing...");
        fetchAccounts();
      })
      .subscribe();

    // 3. Simulated Visitor Increase (to make it feel 'alive')
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

    // Emergency loading canceler: if after 10s it's still loading, force it off.
    const timer = setTimeout(() => {
        setIsLoading(false);
        setIsAuthLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [currentUser?.role]);

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
