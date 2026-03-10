import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Register service worker (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
