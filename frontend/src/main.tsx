import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
    <Toaster richColors position="top-right" duration={1300} />
  </AuthProvider>

);
