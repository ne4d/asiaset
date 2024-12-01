import React, { useState } from 'react';
import './menu.css';
import { Link } from 'react-router-dom';

function SideMenu() {
  const [isCollapsed, setIsCollapsed] = useState(true); // Состояние свернутости панели

  return (
    <nav
      className={`main-menu ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={() => setIsCollapsed(false)} // Разворачиваем при наведении
      onMouseLeave={() => setIsCollapsed(true)} // Сворачиваем при уходе
    >
      {/* Заголовок панели */}
      <div className={`menu-header ${isCollapsed ? 'collapsed' : ''}`}>
        <span className="menu-title">AsiaSeti CRM</span>
      </div>
      <hr className="menu-divider" />
      <div className="scrollbar" id="style-1">
        <ul>
          <li>
            <Link to="/statistic">
              <i className="fa fa-home fa-lg"></i>
              <span className="nav-text">Статистика</span>
            </Link>
          </li>
          <li>
            <Link to="/salepoint">
              <i className="fa fa-user fa-lg"></i>
              <span className="nav-text">Точки продаж</span>
            </Link>
          </li>
          <li>
            <Link to="/storage">
              <i className="fa fa-envelope-o fa-lg"></i>
              <span className="nav-text">Склады</span>
            </Link>
          </li>
          <li>
            <Link to="/items">
              <i className="fa fa-heart-o fa-lg"></i>
              <span className="nav-text">Товары</span>
            </Link>
          </li>
          <li className="darkerlishadow">
            <Link to="/debtbook">
              <i className="fa fa-clock-o fa-lg"></i>
              <span className="nav-text">Долговая книга</span>
            </Link>
          </li>
          <li className="darkerli">
            <Link to="/customer">
              <i className="fa fa-desktop fa-lg"></i>
              <span className="nav-text">Контрагенты</span>
            </Link>
          </li>
          <li className="darkerli">
            <Link to="/worker">
              <i className="fa fa-plane fa-lg"></i>
              <span className="nav-text">Сотрудники</span>
            </Link>
          </li>
          <li className="darkerli">
            <Link to="/order">
              <i className="fa fa-shopping-cart"></i>
              <span className="nav-text">Заказы</span>
            </Link>
          </li>
          <li className="darkerli">
            <Link to="/analitic">
              <i className="fa fa-microphone fa-lg"></i>
              <span className="nav-text">Аналитика</span>
            </Link>
          </li>
          <li className="darkerli">
            <Link to="/0">
              <i className="fa fa-flask fa-lg"></i>
              <span className="nav-text">-</span>
            </Link>
          </li>
          <li className="darkerli">
            <Link to="/0">
              <i className="fa fa-picture-o fa-lg"></i>
              <span className="nav-text">-</span>
            </Link>
          </li>
          <li className="darkerli">
            <Link to="/0">
              <i className="fa fa-align-left fa-lg"></i>
              <span className="nav-text">-</span>
            </Link>
          </li>
          <li className="darkerli">
            <Link to="/0">
              <i className="fa fa-gamepad fa-lg"></i>
              <span className="nav-text">-</span>
            </Link>
          </li>
          <li className="darkerli">
            <Link to="/0">
              <i className="fa fa-glass fa-lg"></i>
              <span className="nav-text">-</span>
            </Link>
          </li>
          <li className="darkerlishadowdown">
            <Link to="/0">
              <i className="fa fa-rocket fa-lg"></i>
              <span className="nav-text">-</span>
            </Link>
          </li>
        </ul>
        <ul className="logout">
          <li>
            <Link to="/setting">
              <i className="fa fa-lightbulb-o fa-lg"></i>
              <span className="nav-text">Настройка</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default SideMenu;
