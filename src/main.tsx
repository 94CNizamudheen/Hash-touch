import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './ui/store/store.ts';
import { Provider } from "react-redux";
import { ThemeProvider } from './ui/context/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div className="safe-area" >
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </div>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>
)
