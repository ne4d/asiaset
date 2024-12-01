import React from 'react';
import ReactDOM from 'react-dom/client';
// import './css/sidebars.css'; // Подключаем стили для боковой панели
import App from './App'; // Подключаем основной компонент
import 'bootstrap/dist/css/bootstrap.min.css'; // Подключение стилей Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Подключение JS Bootstrap (для dropdown, modals и т.д.)
// import 'font-awesome/css/font-awesome.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
