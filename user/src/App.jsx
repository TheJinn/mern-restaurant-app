import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store.jsx'
import Home from './pages/Home.jsx'
import Checkout from './pages/Checkout.jsx'
import ThankYou from './pages/ThankYou.jsx'

export default function AppRouter(){
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/checkout" element={<Checkout/>}/>
          <Route path="/thanks" element={<ThankYou/>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
