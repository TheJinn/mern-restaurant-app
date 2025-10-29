import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './pages/App.jsx'
import Analytics from './pages/Analytics.jsx'
import Orders from './pages/Orders.jsx'
import Tables from './pages/Tables.jsx'
import Menu from './pages/Menu.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/tables" element={<Tables />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="*" element={<Navigate to="/analytics" />} />
    </Routes>
  </BrowserRouter>
)
