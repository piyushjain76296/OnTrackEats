  -- Enable UUID support
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  -- 🚉 Stations Table
  CREATE TABLE IF NOT EXISTS stations (
    code text PRIMARY KEY, -- e.g., NDLS, BCT
    name text NOT NULL,
    city text NOT NULL,
    state text NOT NULL
  );

  -- 🍴 Restaurants Table
  CREATE TABLE IF NOT EXISTS restaurants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    station_code text REFERENCES stations(code),
    contact_number text,
    rating numeric DEFAULT 4.0,
    created_at timestamptz DEFAULT now()
  );

  -- 📋 Menus Table
  CREATE TABLE IF NOT EXISTS menus (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    available boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
  );

  -- 👥 Delivery Partners Table
  CREATE TABLE IF NOT EXISTS delivery_partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text NOT NULL,
    assigned_station text REFERENCES stations(code),
    is_available boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
  );

  -- 🚦 Train Schedule Table
  CREATE TABLE IF NOT EXISTS train_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    train_number text NOT NULL,
    station_code text REFERENCES stations(code),
    arrival_time time NOT NULL,
    departure_time time NOT NULL,
    halt_minutes int NOT NULL
  );

  -- 🧾 Orders Table
  CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    restaurant_id uuid REFERENCES restaurants(id) NOT NULL,
    delivery_partner_id uuid REFERENCES delivery_partners(id),
    payment_id text, -- Razorpay/Stripe reference
    payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
    payment_method text DEFAULT 'cod' CHECK (payment_method IN ('cod', 'upi', 'card', 'netbanking')),
    created_at timestamptz DEFAULT now(),
    delivery_time timestamptz, -- scheduled delivery
    status text NOT NULL DEFAULT 'pending' CHECK (
      status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')
    ),
    total numeric NOT NULL CHECK (total >= 0),
    delivery_location text NOT NULL,
    train_details jsonb NOT NULL, -- {train_no, coach, seat, station_code, eta}
    items jsonb NOT NULL, -- fallback for display
    special_instructions text
  );

  -- 🍱 Order Items Table (normalized)
  CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    menu_id uuid REFERENCES menus(id),
    quantity int NOT NULL CHECK (quantity > 0),
    price numeric NOT NULL CHECK (price >= 0)
  );

  -- 💳 Payments Table (optional for audit logs)
  CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    method text NOT NULL,
    status text NOT NULL,
    transaction_ref text,
    created_at timestamptz DEFAULT now()
  );

  -- 📬 Notifications Table
  CREATE TABLE IF NOT EXISTS order_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    sent_to text NOT NULL, -- email or phone
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    message text,
    created_at timestamptz DEFAULT now()
  );

  -- 🔐 RLS (Row Level Security)
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

  -- 📜 RLS Policies
  CREATE POLICY "Users can read own orders"
    ON orders FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can create orders"
    ON orders FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

  -- 📊 Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_orders_user_created_at ON orders(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
  CREATE INDEX IF NOT EXISTS idx_train_schedule ON train_schedules(train_number, station_code);

  -- ✅ You're now ready to build the backend/API on top of this schema!
