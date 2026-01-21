import {
    BeakerIcon,
    CakeIcon,
    ClockIcon,
    CreditCardIcon,
    MapIcon,
    ShieldCheckIcon,
    SparklesIcon,
    SunIcon,
    TruckIcon,
    UserGroupIcon,
    WifiIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { api } from '../lib/supabase';

interface Feature {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  category: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const Features: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const data = await api.getFeatures();
      setFeatures(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      StarIcon: () => <span>⭐</span>,
      CheckCircleIcon: () => <span>✅</span>,
      CalendarIcon: () => <span>📅</span>,
      MapPinIcon: () => <span>📍</span>,
      WifiIcon: WifiIcon,
      BeakerIcon: BeakerIcon,
      SparklesIcon: SparklesIcon,
      CakeIcon: CakeIcon,
      HeartIcon: () => <span>❤️</span>,
      ShieldCheckIcon: ShieldCheckIcon,
      ClockIcon: ClockIcon,
      UserGroupIcon: UserGroupIcon,
      SunIcon: SunIcon,
      MapIcon: MapIcon,
      TruckIcon: TruckIcon,
      CreditCardIcon: CreditCardIcon,
      UserIcon: () => <span>👤</span>
    };
    
    return iconMap[iconName] || SparklesIcon;
  };

  // Get unique categories from features
  const categories = ['All', ...Array.from(new Set(features.map(f => f.category)))];

  const filteredFeatures = selectedCategory === 'All' 
    ? features.filter(f => f.is_active)
    : features.filter(f => f.category === selectedCategory && f.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-800 to-green-800">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Resort Features</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Discover the world-class amenities and services that make Resort Booking System 
              the ultimate luxury destination
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFeatures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFeatures.map((feature) => {
                const IconComponent = getIconComponent(feature.icon_name);
                return (
                  <div key={feature.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-800 to-green-800 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900">{feature.name}</h3>
                        <span className="text-sm text-blue-800 font-medium">{feature.category}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No features found</h3>
              <p className="text-gray-600">No features available in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-800 to-green-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Experience Luxury Like Never Before
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Book your stay and discover all the amazing features and services 
            that await you at Resort Booking System.
          </p>
          <a
            href="/rooms"
            className="inline-block bg-white text-blue-800 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300"
          >
            Book Your Stay
          </a>
        </div>
      </section>
    </div>
  )
}

export default Features 
