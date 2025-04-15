import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getUserOrders } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../lib/types';
import jsPDF from 'jspdf';



const generateInvoice = (order: Order) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Invoice - Order #${order.id}`, 10, 20);

  doc.setFontSize(12);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 10, 30);
  doc.text(`Train No: ${order.train_details.train_no}`, 10, 40);
  doc.text(`Coach & Seat: ${order.train_details.coach} - ${order.train_details.seat}`, 10, 50);
  doc.text(`Station: ${order.train_details.station_code}`, 10, 60);
  doc.text(`Expected Delivery: ${new Date(order.train_details.eta).toLocaleTimeString()}`, 10, 70);

  doc.text('Items:', 10, 80);
  let yOffset = 90;
  order.items.forEach((item) => {
    doc.text(`${item.quantity} x ${item.name} - ₹${item.price * item.quantity}`, 10, yOffset);
    yOffset += 10;
  });

  doc.text(`Total: ₹${order.total}`, 10, yOffset + 10);

  doc.save(`invoice_${order.id}.pdf`);
};


const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const data = await getUserOrders(user.id);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Please sign in to view your orders</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <p className="text-center text-gray-500">You haven't placed any orders yet</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">
                  Order #{order.id.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()} at{' '}
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 text-sm rounded ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Train Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Train Number</p>
                  <p>{order.train_details.train_no}</p>
                </div>
                <div>
                  <p className="text-gray-500">Coach & Seat</p>
                  <p>{order.train_details.coach} - {order.train_details.seat}</p>
                </div>
                <div>
                  <p className="text-gray-500">Station</p>
                  <p>{order.train_details.station_code}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expected Delivery</p>
                  <p>{new Date(order.train_details.eta).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <h3 className="font-semibold mb-2">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
              {['delivered', 'pending'].includes(order.status) && (

  <div className="mt-4 text-right">
    <button
      onClick={() => generateInvoice(order)}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Download Invoice
    </button>
  </div>
)}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;