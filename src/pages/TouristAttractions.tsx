import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AttractionCard from '../components/AttractionCard';
import { supabase } from '../lib/supabase';

interface Attraction {
  id: number;
  name: string;
  description: string;
  images: string[];
  distance: string;
  travel_time: string;
  type: string;
  highlights: string[];
  best_time: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const TouristAttractions: React.FC = () => {

  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery modal state
  const [galleryModal, setGalleryModal] = useState<{
    isOpen: boolean
    images: string[]
    title: string
    currentIndex: number
  }>({
    isOpen: false,
    images: [],
    title: '',
    currentIndex: 0
  })



  // Fetch attractions from database
  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Use demo data if API fails
        setAttractions([
          {
            id: 1,
            name: 'Ganapatipule Beach',
            description: 'Famous for its pristine white sand and the ancient Ganapati temple. Perfect for swimming and water sports.',
            images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            distance: '15.5 km from resort',
            travel_time: '30 minutes',
            type: 'Beach',
            highlights: ['White Sand', 'Temple', 'Water Sports', 'Sunset Views', 'Local Cuisine'],
            best_time: 'October to March',
            category: 'beach',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Ratnagiri Fort',
            description: 'Historic fort built by the Bijapur Sultanate, offering panoramic views of the Arabian Sea and the city.',
            images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            distance: '8.2 km from resort',
            travel_time: '20 minutes',
            type: 'Fort',
            highlights: ['Historic', 'Panoramic Views', 'Architecture', 'Photography', 'Cultural Heritage'],
            best_time: 'November to February',
            category: 'fort',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Pawas Beach',
            description: 'Serene beach perfect for relaxation and enjoying beautiful sunsets. Known for its peaceful atmosphere and stunning coastal views. This hidden gem offers a perfect escape from the hustle and bustle of city life.',
            images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            distance: '19 km from resort',
            travel_time: '35 minutes',
            type: 'Peaceful Beach',
            highlights: ['Sunset Views', 'Peaceful Atmosphere', 'Coastal Walks', 'Relaxation'],
            best_time: 'Year Round',
            category: 'beach',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        return;
      }

      setAttractions(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Gallery functions
  const openGallery = (images: string[], title: string) => {
    setGalleryModal({
      isOpen: true,
      images,
      title,
      currentIndex: 0
    })
  }

  const closeGallery = () => {
    setGalleryModal({
      isOpen: false,
      images: [],
      title: '',
      currentIndex: 0
    })
  }

  const nextImage = () => {
    setGalleryModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }))
  }

  const prevImage = () => {
    setGalleryModal(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }))
  }





  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!galleryModal.isOpen) return;
      
      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [galleryModal.isOpen]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      beach: 'bg-blue-100 text-blue-800',
      fort: 'bg-red-100 text-red-800',
      temple: 'bg-yellow-100 text-yellow-800',
      market: 'bg-green-100 text-green-800',
      viewpoint: 'bg-purple-100 text-purple-800',
      museum: 'bg-indigo-100 text-indigo-800',
      park: 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-blue-800 to-green-800">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Tourist Attractions</h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto">
              Discover the beautiful places to visit around Resort Booking System
            </p>
          </div>
        </div>
      </section>

      {/* Attractions Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explore Ratnagiri
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From pristine beaches to historic forts, discover the best attractions in and around Ratnagiri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {attractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                id={attraction.id}
                name={attraction.name}
                description={attraction.description}
                images={attraction.images}
                distance={attraction.distance}
                travel_time={attraction.travel_time}
                type={attraction.type}
                highlights={attraction.highlights}
                best_time={attraction.best_time}
                category={attraction.category}
                onImageClick={() => openGallery(attraction.images, attraction.name)}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12 sm:mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Explore?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Book your stay at Resort Booking System and experience these amazing attractions firsthand
            </p>
            <Link
              to="/rooms"
              className="inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-4 px-8 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Book Your Stay
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {galleryModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>

            {/* Image */}
            <img
              src={galleryModal.images[galleryModal.currentIndex]}
              alt={galleryModal.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />

            {/* Navigation */}
            {galleryModal.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                >
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                >
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Title and Counter */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-semibold mb-1">{galleryModal.title}</h3>
              <p className="text-white/80 text-sm">
                {galleryModal.currentIndex + 1} of {galleryModal.images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristAttractions; 
