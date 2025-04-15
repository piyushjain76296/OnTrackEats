import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    users: 0,
    orders: 0,
    revenue: 0,
    restaurants: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        const { count: orderCount, data: orders } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);

        const { count: restaurantCount } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true });

        const revenue = orders?.reduce((acc, order) => acc + order.total, 0) || 0;

        setMetrics({
          users: userCount || 0,
          orders: orderCount || 0,
          revenue,
          restaurants: restaurantCount || 0,
        });

        setRecentOrders(orders || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <DashboardCard title="Total Users" value={metrics.users} />
        <DashboardCard title="Total Orders" value={metrics.orders} />
        <DashboardCard title="Total Revenue" value={`₹${metrics.revenue}`} />
        <DashboardCard title="Restaurants" value={metrics.restaurants} />
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-2">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-2">{order.user_id}</td>
                <td className="px-4 py-2">₹{order.total}</td>
                <td className="px-4 py-2 capitalize">{order.status}</td>
                <td className="px-4 py-2">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="bg-white shadow rounded-lg p-6 text-center">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;
