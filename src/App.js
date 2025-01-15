import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SideMenu from './components/SideMenu';
import Welcome from './pages/Welcome';
import Statistic from './pages/Statistic';
import Salepoint from './pages/Salepoint';
import Storage from './pages/Storage';
import Items from './pages/Items';
import Debtbook from './pages/Debtbook';
import Customer from './pages/Customer';
import Worker from './pages/Worker';
import Order from './pages/Order';
import Analitic from './pages/Analitic';
import Products from './pages/Products';
import Setting from './pages/Setting';
import ItemDetails from './pages/ItemDetails';
import StorageDetails from './pages/StorageDetails';

function App() {
  return (
    <Router>
      <div className="d-flex">
        {/* Левая панель меню */}
        <SideMenu />

        {/* Правая часть с контентом */}
        {/* <div className="main-content p-4" style={{ flex: 1 }}> */}
        <div className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/statistic" element={<Statistic />} />
            <Route path="/salepoint" element={<Salepoint />} />
            <Route path="/storage" element={<Storage />} />
            <Route path="/items" element={<Items />} />
            <Route path="/item/:id" element={<ItemDetails />} /> {/* Добавлен маршрут */}
            <Route path="/debtbook" element={<Debtbook />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/worker" element={<Worker />} />
            <Route path="/order" element={<Order />} />
            <Route path="/analitic" element={<Analitic />} />
            <Route path="/0" element={<Products />} />
            <Route path="/0" element={<Products />} />
            <Route path="/0" element={<Products />} />
            <Route path="/0" element={<Products />} />
            <Route path="/0" element={<Products />} />
            <Route path="/0" element={<Products />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/storages/:id" element={<StorageDetails />} />
            <Route path="/salespoints/:id" element={<StorageDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

