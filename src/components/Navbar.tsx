import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Train, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const ADMIN_EMAILS = ['piyushjain76296@gmail.com'];
 // ⬅️ Replace with your real admin email(s)

const Navbar = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">OnTrackEats</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Admin Dashboard
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/orders"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
