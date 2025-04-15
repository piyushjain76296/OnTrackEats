import { supabase } from './supabase';
import type { Restaurant, MenuItem, Order } from './types';

// 🚉 Fetch all restaurants
export const getRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('name');
  if (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
  return data;
};

// 🚉 Fetch restaurants by station
export const getRestaurantByStation = async (stationCode: string): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('station_code', stationCode.toUpperCase())
    .order('name');
  if (error) {
    console.error('Error fetching by station:', error);
    throw error;
  }
  return data;
};

// 🍽 Fetch menu items for a restaurant
export const getMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
  const { data, error } = await supabase
    .from('menus')
    .select('id, name, description, price, available, restaurant_id, created_at')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .order('name');
  if (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
  return data;
};

// 🧾 Create a new order
export const createOrder = async (orderData: {
  user_id: string;
  restaurant_id: string;
  total: number;
  delivery_location: string;
  train_details: {
    train_no: string;
    coach: string;
    seat: string;
    station_code: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  special_instructions?: string;
  payment_method: string;
  payment_status: string;
}) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      ...orderData,
      status: 'pending',
    }])
    .select()
    .single();
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  return data as Order;
};

// 📦 Fetch orders for a user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, status, total, train_details, items, user_id, restaurant_id, payment_status, payment_method, delivery_location')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
  return data;
};

// 🔄 Update order status (e.g., confirmed, delivered)
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
  return data;
};

// 🧾 (Optional) Create a payment record in `payments` table
export const logPayment = async (payment: {
  order_id: string;
  amount: number;
  method: string;
  status: string;
  transaction_ref?: string;
}) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();
  if (error) {
    console.error('Error logging payment:', error);
    throw error;
  }
  return data;
};
