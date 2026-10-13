import React from 'react';
import { ToastProvider } from './components/ui/Toast';
import DashboardPage from './pages/DashboardPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <DashboardPage />
    </ToastProvider>
  );
};

export default App;
