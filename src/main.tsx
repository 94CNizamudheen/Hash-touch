
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './ui/store/store.ts';
import { Provider } from "react-redux";
import { ThemeProvider } from './ui/context/ThemeContext.tsx'
import { AppStateProvider } from './ui/hooks/useAppState.ts'
import { NotificationProvider } from './ui/context/NotificationContext.tsx';

createRoot(document.getElementById('root')!).render(

    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div className="safe-area" >
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
    </BrowserRouter>
)
