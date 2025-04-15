import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const steps = [
  { id: 1, name: 'Order Confirmed', description: 'Your order has been received' },
  { id: 2, name: 'Preparing', description: 'Restaurant is preparing your food' },
  { id: 3, name: 'Out for Delivery', description: 'Food is on the way to your train' },
  { id: 4, name: 'Delivered', description: 'Enjoy your meal!' }
];

const statusToStep: Record<string, number> = {
  pending: 1,
  confirmed: 1,
  preparing: 2,
  out_for_delivery: 3,
  delivered: 4
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

type OrderInfo = {
  id: string;
  status: string;
  delivery_time: string | null;
  train_details: {
    train_no?: string;
    coach?: string;
    seat?: string;
    station_code?: string;
  };
  delivery_partner_id: string | null;
};

type DeliveryPartner = {
  id: string;
  name: string;
  phone: string;
};

const TrackOrderPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedTimeSec, setEstimatedTimeSec] = useState<number | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);

  const fetchOrder = async () => {
    const orderId = localStorage.getItem('orderId');
    if (!orderId) return;

    const { data, error } = await supabase
      .from('orders')
      .select('id, status, delivery_time, train_details, delivery_partner_id')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      console.error('Error fetching order:', error);
      return;
    }

    setOrderInfo(data);
    setCurrentStep(statusToStep[data.status] || 1);

    if (data.delivery_time) {
      const deliveryTime = new Date(data.delivery_time).getTime();
      const now = Date.now();
      const remainingSec = Math.max(0, Math.floor((deliveryTime - now) / 1000));
      setEstimatedTimeSec(remainingSec);
    } else {
      setEstimatedTimeSec(null); // fallback
    }

    if (data.delivery_partner_id) {
      fetchPartnerDetails(data.delivery_partner_id);
    } else {
      assignDeliveryPartner(data.id);
    }
  };

  const fetchPartnerDetails = async (partnerId: string) => {
    const { data, error } = await supabase
      .from('delivery_partners')
      .select('id, name, phone')
      .eq('id', partnerId)
      .single();

    if (!error && data) {
      setDeliveryPartner(data);
    } else {
      console.error('Failed to fetch delivery partner', error);
    }
  };

  const assignDeliveryPartner = async (orderId: string) => {
    const { data: partners, error } = await supabase
      .from('delivery_partners')
      .select('id, name, phone')
      .eq('is_available', true);

    if (!error && partners && partners.length > 0) {
      const selected = partners[Math.floor(Math.random() * partners.length)];

      const { error: updateError } = await supabase
        .from('orders')
        .update({ delivery_partner_id: selected.id })
        .eq('id', orderId);

      if (!updateError) {
        setDeliveryPartner(selected);
      } else {
        console.error('Failed to assign partner', updateError);
      }
    } else {
      console.error('No available delivery partners', error);
    }
  };

  useEffect(() => {
    fetchOrder();

    const poll = setInterval(() => {
      fetchOrder();
    }, 10000);

    const timer = setInterval(() => {
      setEstimatedTimeSec(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => {
      clearInterval(poll);
      clearInterval(timer);
    };
  }, []);

  const progressPercentage = (currentStep / steps.length) * 100;
  const train = orderInfo?.train_details?.train_no || '-';
  const coach = orderInfo?.train_details?.coach || '';
  const seat = orderInfo?.train_details?.seat || '-';
  const station = orderInfo?.train_details?.station_code || '-';
  const orderIdShort = orderInfo?.id?.slice(0, 8).toUpperCase() || '-';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Track Your Order</h2>
          <div className="flex items-center text-blue-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">
              {estimatedTimeSec !== null ? `${formatTime(estimatedTimeSec)} remaining` : 'Calculating...'}
            </span>
          </div>
        </div>

        {/* <div className="flex justify-center mb-8">
          <div style={{ width: 120, height: 120 }}>
            <CircularProgressbar
              value={progressPercentage}
              text={`${Math.round(progressPercentage)}%`}
              styles={buildStyles({
                textColor: '#2563eb',
                pathColor: '#2563eb',
                trailColor: '#d1d5db'
              })}
            />
          </div>
        </div> */}

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {index !== steps.length - 1 && (
                <div
                  className={`absolute left-5 top-14 h-full w-0.5 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="relative flex items-start">
                <div className="flex-shrink-0">
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-10 h-10 text-blue-600" />
                  ) : currentStep === step.id ? (
                    <Circle className="w-10 h-10 text-blue-600 animate-pulse" />
                  ) : (
                    <Circle className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.name}
                  </h3>
                  <p className="mt-1 text-gray-500">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t">
          <h3 className="text-lg font-medium mb-4">Delivery Details</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Delivery To</p>
                <p className="font-medium">Seat {coach}{coach && '-'}{seat}</p>
              </div>
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="font-medium">#{orderIdShort}</p>
              </div>
              <div>
                <p className="text-gray-500">Train</p>
                <p className="font-medium">{train}</p>
              </div>
              <div>
                <p className="text-gray-500">Station</p>
                <p className="font-medium">{station}</p>
              </div>
              <div>
                <p className="text-gray-500">Delivery Partner</p>
                <p className="font-medium">
                  {deliveryPartner ? `${deliveryPartner.name} (${deliveryPartner.phone})` : 'Assigning...'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackOrderPage;
