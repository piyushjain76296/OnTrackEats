import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Star } from 'lucide-react';
import { getRestaurantByStation, getMenuItems } from '../lib/api';
import type { Restaurant, MenuItem } from '../lib/types';
import { useCart } from '../context/CartContext';

interface TrainDetails {
  trainNumber: string;
  pnr: string;
  seat: string;
  stationCode: string;
}

export default function OrderPage() {
  const { register, handleSubmit } = useForm<TrainDetails>();
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});
  const { addToCart } = useCart();

  const onSubmit = async (data: TrainDetails) => {
    try {
      setLoading(true);
      const fetchedRestaurants = await getRestaurantByStation(data.stationCode);
      setRestaurants(fetchedRestaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSelect = async (restaurantId: string) => {
    if (selectedRestaurant === restaurantId) {
      setSelectedRestaurant(null);
      return;
    }

    setSelectedRestaurant(restaurantId);
    if (!menuItems[restaurantId]) {
      try {
        const items = await getMenuItems(restaurantId);
        setMenuItems(prev => ({ ...prev, [restaurantId]: items }));
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    }
  };

  const handleAddToCart = (item: MenuItem, restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;

    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      // quantity: 1,
      restaurantId: restaurantId,
      restaurantName: restaurant.name,
      stationCode: restaurant.station_code
    });
  };

  return (
    <div className="container mx-8  px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Food</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Train Number</label>
            <input
              {...register('trainNumber')}
              className="w-full p-2 border rounded"
              placeholder="Enter train number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PNR</label>
            <input
              {...register('pnr')}
              className="w-full p-2 border rounded"
              placeholder="Enter PNR"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Seat</label>
            <input
              {...register('seat')}
              className="w-full p-2 border rounded"
              placeholder="e.g., B1-23"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Station Code</label>
            <input
              {...register('stationCode')}
              className="w-full p-2 border rounded"
              placeholder="e.g., NDLS"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Find Restaurants'
            )}
          </button>
        </div>
      </form>

      {restaurants.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Available Restaurants</h2>
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="border rounded-lg overflow-hidden">
              <div className="p-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <p className="text-gray-600">Station: {restaurant.station_code}</p>
                    {restaurant.contact_number && (
                      <p className="text-gray-600">Contact: {restaurant.contact_number}</p>
                    )}
                  </div>
                  {restaurant.rating > 0 && (
                    <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                      <Star className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">{restaurant.rating}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRestaurantSelect(restaurant.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {selectedRestaurant === restaurant.id ? 'Hide Menu' : 'View Menu'}
                </button>
              </div>
              {selectedRestaurant === restaurant.id && (
                <div className="border-t p-6">
                  <h4 className="font-semibold mb-4">Menu</h4>
                  {!menuItems[restaurant.id] ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : menuItems[restaurant.id].length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No menu items available</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {menuItems[restaurant.id].map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <h5 className="font-semibold mb-2">{item.name}</h5>
                          {item.description && (
                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                          )}
                          <div className="flex justify-between items-center mt-4">
                            <p className="font-medium">₹{item.price}</p>
                            <button
                              onClick={() => handleAddToCart(item, restaurant.id)}
                              className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}