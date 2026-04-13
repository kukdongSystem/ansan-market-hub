'use client';

import { Store } from '@/types';
import { useData } from '@/context/DataContext';
import StoreDetailView from './StoreDetailView';

interface Props {
    initialStore: Store;
}

export default function StoreDetailViewWrapper({ initialStore }: Props) {
    const { stores, currentUser, updateStore } = useData();
    
    // Use data from context if available (more up-to-date), otherwise fallback to server data
    const store = stores.find(s => s.id === initialStore.id) || initialStore;

    return (
        <StoreDetailView 
            store={store} 
            currentUser={currentUser} 
            updateStore={updateStore} 
        />
    );
}
