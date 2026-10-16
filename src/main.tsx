import { createRoot } from 'react-dom/client';
import { AppProvider, getDefaultConfig } from '@solana/connector/react';
import App from './App.tsx';
import './index.css';

const connectorConfig = getDefaultConfig({
  appName: 'Trust Wallet Agent Terminal',
  appUrl: window.location.origin,
  network: 'mainnet',
  autoConnect: true,
});

createRoot(document.getElementById('root')!).render(
  <AppProvider connectorConfig={connectorConfig}>
    <App />
  </AppProvider>,
);
