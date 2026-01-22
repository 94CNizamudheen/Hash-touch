import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Platform detection for safe area handling
// Add 'android' class to root element on Android devices
// iOS uses native env(safe-area-inset-*) values by default
const isAndroid = /android/i.test(navigator.userAgent);
if (isAndroid) {
  document.documentElement.classList.add('android');
}
import { HashRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './ui/store/store.ts';
import { Provider } from "react-redux";
import { ThemeProvider } from './ui/context/ThemeContext.tsx'
import { AppStateProvider } from './ui/hooks/useAppState.ts'
import { NotificationProvider } from './ui/context/NotificationContext.tsx';

createRoot(document.getElementById('root')!).render(

    <HashRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div className="" >
            <NotificationProvider>
            <ThemeProvider>
              <AppStateProvider>
                <App />
              </AppStateProvider>
            </ThemeProvider>
            </NotificationProvider>
          </div>
        </PersistGate>
      </Provider>
    </HashRouter>
)
