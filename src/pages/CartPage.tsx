// CartPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const groupedItems = cart.reduce((acc, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        items: [],
        restaurantName: item.restaurantName,
        stationCode: item.stationCode
      };
    }
    acc[item.restaurantId].items.push(item);
    return acc;
  }, {} as Record<string, { items: typeof cart; restaurantName: string; stationCode: string }>);

  const calculateTotal = (items: typeof cart) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Store order data in localStorage for payment page
      const orderData = Object.entries(groupedItems).map(([restaurantId, group]) => ({
        user_id: user.id,
        restaurant_id: restaurantId,
        total: calculateTotal(group.items),
        delivery_location: 'Train',
        train_details: {
          train_no: "12345",
          coach: "B1",
          seat: "23",
          station_code: group.stationCode,
          eta: new Date(Date.now() + 30 * 60000).toISOString()
        },
        items: group.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      }));

      // Store order data temporarily
      localStorage.setItem('pendingOrders', JSON.stringify(orderData));
      
      // Navigate to payment page
      navigate('/payment');
    } catch (error) {
      console.error('Error processing checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {Object.entries(groupedItems).map(([restaurantId, group]) => (
        <div key={restaurantId} className="mb-8 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {group.restaurantName} ({group.stationCode})
          </h2>
          <div className="space-y-4">
            {group.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600">₹{item.price}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="px-2 py-1 border rounded"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 border rounded"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <p className="text-right font-semibold">
                Subtotal: ₹{calculateTotal(group.items)}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-8 border-t pt-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Total</span>
          <span className="text-xl font-semibold">
            ₹{calculateTotal(cart)}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Proceed to Checkout'
          )}
        </button>
      </div>
    </div>
  );
};

export default CartPage;