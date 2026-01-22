import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Platform detection for safe area handling
// Android: uses injected --android-* variables from SystemInsetsBridge
// iOS: uses native env(safe-area-inset-*) values
const userAgent = navigator.userAgent.toLowerCase();
const isAndroid = /android/i.test(userAgent);
const isIOS = /iphone|ipad|ipod/i.test(userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad detection

if (isAndroid) {
  document.documentElement.classList.add('android');
} else if (isIOS) {
  document.documentElement.classList.add('ios');
}

// Debug: log platform detection
console.log('[Platform]', { isAndroid, isIOS, userAgent: navigator.userAgent });
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
