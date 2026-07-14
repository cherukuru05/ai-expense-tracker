import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

window.addEventListener('error', (event) => {
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
    <h2>Runtime Error</h2>
    <p>${event.message}</p>
    <pre>${event.error?.stack}</pre>
  </div>`;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
