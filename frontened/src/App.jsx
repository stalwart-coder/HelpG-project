import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { AppProvider } from './context/AppContext';
import AppRouter from './router/Router';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AdminProvider>
            <AppProvider>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </AppProvider>
          </AdminProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

