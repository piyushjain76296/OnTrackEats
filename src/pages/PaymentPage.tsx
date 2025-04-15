  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { CreditCard, Banknote, Building2, Loader2 } from 'lucide-react';
  import { useCart } from '../context/CartContext';
  import { useAuth } from '../context/AuthContext';
  import { createOrder } from '../lib/api';

  const PaymentPage = () => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trainDetails, setTrainDetails] = useState({
      train_no: '',
      coach: '',
      seat: '',
      station_code: ''
    });
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [selectedBank, setSelectedBank] = useState('');

    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
      const orders = localStorage.getItem('pendingOrders');
      if (!orders) {
        navigate('/cart');
        return;
      }
      setPendingOrders(JSON.parse(orders));
    }, [navigate]);

    const total = pendingOrders.reduce((sum, order) => sum + order.total, 0);

    const handlePayment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!paymentMethod || !user) return;

      setLoading(true);
      setError(null);

      try {
        for (const orderData of pendingOrders) {
          const order = {
            user_id: user.id,
            restaurant_id: orderData.restaurant_id,
            delivery_location: deliveryLocation,
            train_details: {
              train_no: trainDetails.train_no,
              coach: trainDetails.coach,
              seat: trainDetails.seat,
              station_code: trainDetails.station_code,
              eta: orderData.train_details?.eta || null,
            },
            items: orderData.items,
            special_instructions: specialInstructions,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'unpaid' : 'paid',
            total: orderData.total,
            status: 'placed',
          };

          await createOrder(order);
        }

        clearCart();
        localStorage.removeItem('pendingOrders');

        if (paymentMethod === 'cod') {
          navigate('/track-order');
          return;
        }

        const invoice = {
          user: user.email || user.phone || 'Guest',
          orders: pendingOrders,
          deliveryLocation,
          total: total + 50,
          date: new Date().toLocaleString(),
          paymentMethod,
          selectedBank,
        };
        localStorage.setItem('invoice', JSON.stringify(invoice));

        setTimeout(() => navigate('/track-order'), 300);
      } catch (err) {
        console.error('Payment error:', err);
        setError(err instanceof Error ? err.message : 'Payment failed');
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      navigate('/auth');
      return null;
    }

    if (pendingOrders.length === 0) {
      return null;
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-6">Checkout & Payment</h2>

          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Cart Items</h3>
            {pendingOrders.map((order, index) => (
              <div key={index} className="mb-2">
                <p className="font-medium">{order.restaurant_name}</p>
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="text-sm flex justify-between px-2">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              {['Train Number', 'Coach', 'Seat', 'Station Code'].map((label, i) => {
                const keys = ['train_no', 'coach', 'seat', 'station_code'] as const;
                return (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      required
                      value={trainDetails[keys[i]]}
                      onChange={(e) => setTrainDetails({ ...trainDetails, [keys[i]]: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
              <input
                required
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="Berth 12, Platform 5"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., Call when you arrive"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Payment Method</label>
              <div className="grid md:grid-cols-2 gap-4">
                {[{ label: 'Cash on Delivery', value: 'cod', Icon: Banknote },
                  { label: 'Net Banking', value: 'netbanking', Icon: Building2 }
                ].map(({ label, value, Icon }) => (
                  <label
                    key={value}
                    className={`border rounded-lg p-4 cursor-pointer hover:border-blue-500 ${paymentMethod === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      className="sr-only"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="flex flex-col items-center">
                      <Icon className="w-6 h-6 mb-2 text-blue-600" />
                      <span className="font-medium">{label}</span>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === 'netbanking' && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Yes Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`border px-3 py-2 rounded ${selectedBank === bank ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹50.00</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>₹{(total + 50).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!paymentMethod || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Pay'}
            </button>
          </form>
        </div>  
      </div>
    );
  };

  export default PaymentPage;
