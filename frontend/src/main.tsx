import Rollbar from 'rollbar';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rollbar = new Rollbar({
  accessToken: import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN_FRONTEND,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: import.meta.env.MODE || 'development',
});
(window as any).rollbar = rollbar;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);