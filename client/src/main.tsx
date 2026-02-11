import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axios from 'axios'; // <--- Імпортуємо axios

// --- ГЛОБАЛЬНІ НАЛАШТУВАННЯ AXIOS ---
// Встановлюємо базову адресу, щоб не писати всюди 'http://localhost:5000'
axios.defaults.baseURL = 'http://localhost:5000'; 

// !!! НАЙВАЖЛИВІШЕ ДЛЯ СЕСІЙ !!!
// Дозволяє передавати Cookie (сесію) між браузером і сервером
axios.defaults.withCredentials = true; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)