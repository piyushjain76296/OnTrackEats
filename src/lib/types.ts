export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  station_code: string;
  contact_number?: string;
  rating: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  delivery_partner_id?: string;
  payment_id?: string;
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cod' | 'upi' | 'card' | 'netbanking';
  created_at: string;
  delivery_time?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  delivery_location: string;
  train_details: {
    train_no: string;
    coach: string;
    seat: string;
    station_code: string;
    eta: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  special_instructions?: string;
}