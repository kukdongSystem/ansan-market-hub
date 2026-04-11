'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Store, MOCK_STORES, MOCK_ACCOUNTS } from '@/types';

interface DataContextType {
  stores: Store[];
  accounts: any[];
  addStore: (store: Store) => void;
  updateStore: (id: string, updates: Partial<Store>) => void;
  deleteStore: (id: string) => void;
  addAccount: (account: any) => void;
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  updateAccount: (email: string, updates: any) => void;
  deleteAccount: (email: string) => void;
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Direct initialization from localStorage to prevent "flash" of old data
  const getInitialStores = () => {
    if (typeof window === 'undefined') return MOCK_STORES;
    const saved = localStorage.getItem('ansan_stores');
    return saved ? JSON.parse(saved) : MOCK_STORES;
  };

  const getInitialAccounts = () => {
    if (typeof window === 'undefined') return MOCK_ACCOUNTS;
    const saved = localStorage.getItem('ansan_accounts');
    return saved ? JSON.parse(saved) : MOCK_ACCOUNTS;
  };

  const [stores, setStores] = useState<Store[]>(getInitialStores);
  const [accounts, setAccounts] = useState<any[]>(getInitialAccounts);
  const [currentUser, setCurrentUserState] = useState<any | null>(null);

  // Sync state to LocalStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ansan_stores', JSON.stringify(stores));
      localStorage.setItem('ansan_accounts', JSON.stringify(accounts));
      if (currentUser) {
        localStorage.setItem('ansan_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('ansan_current_user');
      }
    }
  }, [stores, accounts, currentUser]);

  // Load current user on mount (client side only)
  useEffect(() => {
    const savedUser = localStorage.getItem('ansan_current_user');
    if (savedUser) {
        try {
            setCurrentUserState(JSON.parse(savedUser));
        } catch(e) {
            console.error("Auth init failed", e);
        }
    }
  }, []);

  const setCurrentUser = (user: any | null) => {
    setCurrentUserState(user);
  };

  const addStore = (store: Store) => {
    setStores(prev => [store, ...prev]);
  };

  const updateStore = (id: string, updates: Partial<Store>) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStore = (id: string) => {
    console.log("DataContext: Deterministic delete store", id);
    if (typeof window !== 'undefined') {
        const updated = stores.filter(s => s.id !== id);
        localStorage.setItem('ansan_stores', JSON.stringify(updated));
        setStores(updated);
    }
  };

  const addAccount = (account: any) => {
    setAccounts(prev => [...prev, account]);
  };

  const updateAccount = (email: string, updates: any) => {
    setAccounts(prev => prev.map(acc => acc.email === email ? { ...acc, ...updates } : acc));
  };

  const deleteAccount = (email: string) => {
    console.log("DataContext: Deterministic delete account", email);
    if (typeof window !== 'undefined') {
        // 1. Get MOST RECENT data from state to ensure no stale data
        const updated = accounts.filter(a => a.email !== email);
        
        // 2. IMMEDIATE Synchronous save to disk
        localStorage.setItem('ansan_accounts', JSON.stringify(updated));
        
        // 3. Update state for React
        setAccounts(updated);
        
        // 4. Hard navigation to /admin to force context reload from the fresh disk data
        window.location.href = '/admin';
    }
  };

  const resetAllData = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('ansan_stores');
        localStorage.removeItem('ansan_accounts');
        localStorage.removeItem('ansan_current_user');
        window.location.href = '/admin'; // Force full restart to clear state
    }
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
        resetAllData
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
