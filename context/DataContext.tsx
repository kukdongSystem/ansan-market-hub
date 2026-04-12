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
    setStores(prev => {
        const updated = [store, ...prev];
        if (typeof window !== 'undefined') localStorage.setItem('ansan_stores', JSON.stringify(updated));
        return updated;
    });
  };

  const updateStore = (id: string, updates: Partial<Store>) => {
    setStores(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
        if (typeof window !== 'undefined') localStorage.setItem('ansan_stores', JSON.stringify(updated));
        return updated;
    });
  };

  const deleteStore = (id: string) => {
    setStores(prev => {
        const updated = prev.filter(s => s.id !== id);
        if (typeof window !== 'undefined') localStorage.setItem('ansan_stores', JSON.stringify(updated));
        return updated;
    });
  };

  const addAccount = (account: any) => {
    setAccounts(prev => {
        const updated = [...prev, account];
        if (typeof window !== 'undefined') localStorage.setItem('ansan_accounts', JSON.stringify(updated));
        return updated;
    });
  };

  const updateAccount = (email: string, updates: any) => {
    setAccounts(prev => {
        const updated = prev.map(acc => acc.email === email ? { ...acc, ...updates } : acc);
        if (typeof window !== 'undefined') localStorage.setItem('ansan_accounts', JSON.stringify(updated));
        return updated;
    });
  };

  const deleteAccount = (email: string) => {
    setAccounts(prev => {
        const updated = prev.filter(a => a.email !== email);
        if (typeof window !== 'undefined') localStorage.setItem('ansan_accounts', JSON.stringify(updated));
        return updated;
    });
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
