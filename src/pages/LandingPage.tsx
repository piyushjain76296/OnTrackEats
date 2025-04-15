import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Clock, MapPin, Train } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Delicious Food, Delivered to Your Train Seat
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Order from the best restaurants near your railway route
        </p>
        <button
          onClick={() => navigate('/order')}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Order Now
        </button>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="flex justify-center mb-4">
            <UtensilsCrossed className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Wide Selection</h3>
          <p className="text-gray-600">Choose from hundreds of restaurants along your route</p>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="flex justify-center mb-4">
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Quick Delivery</h3>
          <p className="text-gray-600">Get your food delivered at your next station</p>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="flex justify-center mb-4">
            <MapPin className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Live Tracking</h3>
          <p className="text-gray-600">Track your order in real-time</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Train className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Enter Train Details</h3>
            <p className="text-gray-600 text-center">Provide your train and seat information</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Choose Your Food</h3>
            <p className="text-gray-600 text-center">Select from nearby restaurants</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Get It Delivered</h3>
            <p className="text-gray-600 text-center">Enjoy your meal at your seat</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;