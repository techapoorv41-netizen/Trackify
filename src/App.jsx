import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { PrefsProvider } from '@/context/PrefsContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { onStorageError } from '@/services/storageService';
import AppRoutes from '@/routes/AppRoutes';

function StorageWatcher() {
  const toast = useToast();
  useEffect(() => {
    onStorageError(() =>
      toast.error('Changes could not be saved', 'Browser storage is full or blocked. Your demo changes will be lost on refresh.'),
    );
  }, [toast]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <PrefsProvider>
          <AuthProvider>
            <DataProvider>
              <StorageWatcher />
              <AppRoutes />
            </DataProvider>
          </AuthProvider>
        </PrefsProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
