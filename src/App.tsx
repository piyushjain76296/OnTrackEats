import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './pages/LandingPage';
import PaymentPage from './pages/PaymentPage';
import TrackOrderPage from './pages/TrackOrderPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import OrderPage from './pages/OrderPage';
import OrdersPage from './pages/OrdersPage';


import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navbar />

            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
