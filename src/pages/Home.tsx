import {
    ArrowRightIcon,
    CalendarIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MapPinIcon,
    StarIcon,
    UsersIcon,
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AttractionCard from '../components/AttractionCard'
import FAQ from '../components/FAQ'
import GoogleReviews from '../components/GoogleReviews'
import PremiumImage from '../components/PremiumImage'
import SEO from '../components/SEO'
import TextReveal from '../components/TextReveal'
import type { Room } from '../lib/supabase'
import { api } from '../lib/supabase'

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

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [features, setFeatures] = useState<Feature[]>([])
  const [featuresLoading, setFeaturesLoading] = useState(true)
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [attractionsLoading, setAttractionsLoading] = useState(true)
  const [adminContactInfo, setAdminContactInfo] = useState({
    email: '',
    phone: ''
  })
  const [expandedAmenities, setExpandedAmenities] = useState<{ [key: string]: boolean }>({})

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

  // Gallery functions
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!galleryModal.isOpen) return
      
      if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      } else if (e.key === 'Escape') {
        closeGallery()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [galleryModal.isOpen])

  // Hero slides using local images from public/images folder
  const heroSlides = [
    {
      image: '/images/Exterior (Front).jpg',
      title: 'Welcome to Grand Valley Resort',
      subtitle: 'A Hilltop Heaven in Mahabaleshwar',
      description: 'Experience luxury, comfort, and unforgettable moments in the heart of nature'
    },
    {
      image: '/images/Exterior (back).jpg',
      title: 'Luxury Accommodations',
      subtitle: 'Premium rooms and suites designed for your comfort',
      description: 'From valley-view suites to private balconies, find your perfect stay'
    },
    {
      image: '/images/exteror (night).jpg',
      title: 'Exclusive Amenities',
      subtitle: 'World-class facilities and personalized service',
      description: 'Infinity pool, restaurant, and more await your arrival'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Load rooms from API
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setRoomsLoading(true)
        const data = await api.getRooms()
        
        // Always generate new cryptic slugs for security (replace predictable slugs)
        const roomsWithSlugs = await Promise.all(
          data.slice(0, 3).map(async (room) => {
            try {
              // Generate a new cryptic slug for every room
              const crypticSlug = await api.generateCrypticSlug(room.name, room.id)
              
              // Update the room in the database with the new cryptic slug
              await api.updateRoom(room.id, { slug: crypticSlug })
              
              return { ...room, slug: crypticSlug }
            } catch (error) {
              return room
            }
          })
        )
        
        setRooms(roomsWithSlugs)
      } catch (error) {
      } finally {
        setRoomsLoading(false)
      }
    }
    
    loadRooms()
  }, [])

  // Load features from API
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setFeaturesLoading(true)
        const data = await api.getFeatures()
        setFeatures(data)
      } catch (error) {
      } finally {
        setFeaturesLoading(false)
      }
    }
    
    loadFeatures()
  }, [])

  // Load admin contact info
  useEffect(() => {
    const loadAdminContactInfo = async () => {
      try {
        const contactInfo = await api.getAdminInfo()
        setAdminContactInfo({
          email: contactInfo.email,
          phone: contactInfo.phone
        })
      } catch (error) {
        // Keep default values if loading fails
      }
    }
    
    loadAdminContactInfo()
  }, [])

  // Load attractions for homepage preview
  useEffect(() => {
    const loadAttractions = async () => {
      try {
        setAttractionsLoading(true)
        const data = await api.getTouristAttractions()
        // Show first 6 attractions on homepage
        setAttractions(data?.slice(0, 6) || [])
      } catch (error) {
        // Keep empty array if loading fails
        setAttractions([])
      } finally {
        setAttractionsLoading(false)
      }
    }
    
    loadAttractions()
  }, [])

  // Testimonials are now handled by the ReviewsSection component

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      StarIcon: StarIcon,
      CheckCircleIcon: CheckCircleIcon,
      CalendarIcon: CalendarIcon,
      MapPinIcon: MapPinIcon,
      WifiIcon: () => <span>📶</span>,
      BeakerIcon: () => <span>🧪</span>,
      SparklesIcon: () => <span>✨</span>,
      CakeIcon: () => <span>🍰</span>,
      ShieldCheckIcon: () => <span>🛡️</span>,
      ClockIcon: () => <span>⏰</span>,
      UserGroupIcon: () => <span>👥</span>,
      SunIcon: () => <span>☀️</span>,
      MapIcon: () => <span>🗺️</span>,
      TruckIcon: () => <span>🚚</span>,
      CreditCardIcon: () => <span>💳</span>,
      UserIcon: () => <span>👤</span>
    };
    
    return iconMap[iconName] || StarIcon;
  };

  // Get featured features for home page
  const featuredFeatures = features.filter(f => f.is_featured && f.is_active).slice(0, 4);

  const toggleAmenities = (roomId: string) => {
    setExpandedAmenities(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }))
  }

  // Gallery functions for attractions
  const openAttractionGallery = (images: string[], title: string) => {
    setGalleryModal({
      isOpen: true,
      images,
      title,
      currentIndex: 0
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      beach: 'bg-blue-100 text-blue-800',
      fort: 'bg-red-100 text-red-800',
      temple: 'bg-yellow-100 text-yellow-800',
      market: 'bg-green-100 text-green-800',
      viewpoint: 'bg-purple-100 text-purple-800',
      museum: 'bg-indigo-100 text-indigo-800',
      park: 'bg-emerald-100 text-emerald-800',
      agriculture: 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <SEO 
        title="Grand Valley Resort - Luxury Hilltop Heaven in Mahabaleshwar"
        description="Experience luxury and comfort at Grand Valley Resort. Book your perfect getaway in Mahabaleshwar with stunning valley views, premium amenities, and exceptional service."
        keywords="Grand Valley Resort, Mahabaleshwar resort, Bhilar resort, luxury resort, hilltop heaven, valley view resort"
        url="https://grandvalleyresort.com"
      />
      <div className="bg-cream-beige">
        {/* Hero Carousel - Modern Professional Design */}
        <div className="relative h-screen overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="relative w-full h-full">
                {/* Full-Screen Image - Crystal Clear, No Overlays */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    filter: 'none',
                    WebkitFilter: 'none',
                    imageRendering: 'auto',
                    willChange: 'opacity'
                  }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchpriority={index === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
                
                {/* Modern Split Layout - Image on Left, Content on Right */}
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full lg:w-3/5 h-full relative">
                    {/* Image takes full space - completely clear */}
                  </div>
                  
                  {/* Content Panel - Floating on Right Side */}
                  <div className="absolute right-0 top-0 bottom-0 w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-8 lg:p-12">
                    <div className="w-full max-w-lg">
                      {/* Modern Glass Card with Content */}
                      <div className="bg-gradient-to-br from-dark-blue-900/95 via-dark-blue-800/95 to-dark-blue-900/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl border border-golden-500/30 relative overflow-hidden">
                        {/* Decorative Golden Accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-golden-500 to-transparent"></div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                          <TextReveal 
                            variant="split" 
                            as="h1" 
                            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-golden-400 font-serif leading-tight"
                          >
                            {slide.title}
                          </TextReveal>
                          
                          <div className="w-20 h-1 bg-gradient-to-r from-golden-500 to-transparent mb-6"></div>
                          
                          <p className="text-xl sm:text-2xl lg:text-3xl mb-4 text-white font-medium leading-relaxed">
                            {slide.subtitle}
                          </p>
                          
                          <p className="text-base sm:text-lg lg:text-xl mb-8 text-white/90 leading-relaxed">
                            {slide.description}
                          </p>
                          
                          <Link
                            to="/rooms"
                            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-blue-900 font-bold text-lg rounded-xl shadow-2xl hover:shadow-golden-500/50 transition-all duration-300 hover:scale-105 hover:from-golden-400 hover:to-golden-500 group"
                          >
                            <span>Book Now</span>
                            <ArrowRightIcon className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-golden-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-golden-500/5 rounded-full blur-2xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Modern Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/15 hover:bg-white/25 backdrop-blur-lg border-2 border-white/30 rounded-full p-4 transition-all duration-300 hover:scale-110 hover:border-golden-400/50 group shadow-xl"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-7 w-7 text-white group-hover:text-golden-400 transition-colors" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/15 hover:bg-white/25 backdrop-blur-lg border-2 border-white/30 rounded-full p-4 transition-all duration-300 hover:scale-110 hover:border-golden-400/50 group shadow-xl"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-7 w-7 text-white group-hover:text-golden-400 transition-colors" />
          </button>
          
          {/* Modern Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex items-center space-x-3 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide 
                    ? 'w-12 h-2 bg-golden-400 shadow-lg shadow-golden-400/50' 
                    : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-4">Why Choose Resort Booking System?</h2>
              <p className="text-lg sm:text-xl text-sage max-w-3xl mx-auto">
                Discover what makes us the perfect choice for your next luxury vacation
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuresLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="text-center animate-pulse">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full bg-gray-300 mx-auto mb-4 sm:mb-6"></div>
                    <div className="h-6 bg-gray-300 rounded mb-3 sm:mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                ))
              ) : featuredFeatures.length > 0 ? (
                featuredFeatures.map((feature, index) => {
                  const IconComponent = getIconComponent(feature.icon_name);
                  return (
                    <div key={feature.id} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-luxury text-white mx-auto mb-4 sm:mb-6">
                        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-forest mb-3 sm:mb-4">{feature.name}</h3>
                      <p className="text-sage text-sm sm:text-base">{feature.description}</p>
                    </div>
                  );
                })
              ) : (
                // Fallback features if no featured features found
                [
                  { name: 'Easy Booking', description: 'Book your stay with just a few clicks', icon: CalendarIcon },
                  { name: 'Prime Location', description: 'Located in the heart of paradise', icon: MapPinIcon },
                  { name: '5-Star Service', description: 'Experience luxury and comfort', icon: StarIcon },
                  { name: 'Instant Confirmation', description: 'Get immediate booking confirmation', icon: CheckCircleIcon }
                ].map((feature, index) => (
                  <div key={feature.name} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-luxury text-white mx-auto mb-4 sm:mb-6">
                      <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-forest mb-3 sm:mb-4">{feature.name}</h3>
                    <p className="text-sage text-sm sm:text-base">{feature.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-cream-beige">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-4">Our Luxury Accommodations</h2>
              <p className="text-lg sm:text-xl text-sage max-w-3xl mx-auto">
                Choose from our selection of premium rooms and suites designed for ultimate comfort
              </p>
            </div>
            <div className={`grid gap-6 sm:gap-8 auto-rows-fr ${
              rooms.length === 1 
                ? 'grid-cols-1 max-w-4xl mx-auto' 
                : rooms.length === 2
                ? 'grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
            }`}>
              {roomsLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="room-card animate-pulse">
                    <div className="h-48 sm:h-56 lg:h-64 bg-gray-300 rounded-t-2xl"></div>
                    <div className="p-4 sm:p-6">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
                      <div className="flex gap-2 mb-6">
                        <div className="h-6 bg-gray-300 rounded w-16"></div>
                        <div className="h-6 bg-gray-300 rounded w-20"></div>
                      </div>
                      <div className="h-10 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                rooms.map((room, index) => {
                  // Get the primary image or first image from room.images array
                  const getMainImage = () => {
                    if (room.images && room.images.length > 0) {
                      // Use the first valid image from the images array
                      const firstValidImage = room.images.find((img: string) => img && img.trim())
                      if (firstValidImage) return firstValidImage
                    }
                    
                    // Fallback to main image_url
                    return room.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  }
                  
                  const imageUrl = getMainImage()
                  
                  return (
                    <div key={room.id} className={`room-card animate-scale-in ${!room.is_active ? 'opacity-75' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt={room.name}
                          className={`room-image ${!room.is_active ? 'grayscale' : ''}`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        {!room.is_active && (
                          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold z-10">
                            Currently Unavailable
                          </div>
                        )}
                        <div className="price-badge text-sm sm:text-base">
                          ₹{room.price_per_night.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg sm:text-xl font-semibold text-forest">{room.name}</h3>
                          {!room.is_active && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className="text-sage mb-4 text-sm sm:text-base">{room.description}</p>
                        <div className="flex items-center text-sm text-sage mb-4">
                          <UsersIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>Up to {room.max_occupancy} guests</span>
                        </div>
                        <div className="mb-4 sm:mb-6">
                          {room.amenities && room.amenities.slice(0, 4).map((amenity, idx) => (
                            <span key={idx} className="amenity-badge text-xs sm:text-sm">
                              {amenity}
                            </span>
                          ))}
                          {room.amenities && room.amenities.length > 4 && !expandedAmenities[room.id] && (
                            <button 
                              onClick={() => toggleAmenities(room.id)}
                              className="amenity-badge text-xs sm:text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                            >
                              +{room.amenities.length - 4} more
                            </button>
                          )}
                          {room.amenities && room.amenities.length > 4 && expandedAmenities[room.id] && (
                            <>
                              {room.amenities.slice(4).map((amenity: string, index: number) => (
                                <span key={index + 4} className="amenity-badge text-xs sm:text-sm">
                                  {amenity}
                                </span>
                              ))}
                              <button 
                                onClick={() => toggleAmenities(room.id)}
                                className="amenity-badge text-xs sm:text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                              >
                                Show less
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                                   <Link
                             to={room.slug ? `/room/${room.slug}` : '#'}
                             className="flex-1 btn-primary text-center text-sm sm:text-base"
                           >
                             View Details
                           </Link>
                           <Link
                             to={room.slug ? `/room/${room.slug}` : '#'}
                             className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2.5 px-4 sm:py-3 sm:px-6 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-center text-sm sm:text-base block"
                           >
                            <span className="inline-block">Book Now</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Tourist Attractions Section */}
        {attractions.length > 0 && (
          <div className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-4">
                  Explore Nearby Attractions
                </h2>
                <p className="text-lg sm:text-xl text-sage max-w-3xl mx-auto">
                  Discover the beautiful tourist attractions near our resort. Plan your perfect getaway with easy access to stunning beaches, historic forts, and scenic viewpoints.
                </p>
              </div>

              {attractionsLoading ? (
                // Loading skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                      <div className="h-64 sm:h-72 bg-gray-300"></div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-300 rounded mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
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
                        onImageClick={() => openAttractionGallery(attraction.images, attraction.name)}
                        getCategoryColor={getCategoryColor}
                      />
                    ))}
                  </div>

                  {/* View All Attractions Button */}
                  <div className="text-center mt-8">
                    <Link
                      to="/attractions"
                      className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-green-700 group"
                    >
                      <span>View All Attractions</span>
                      <ArrowRightIcon className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Google Reviews Section */}
        <GoogleReviews />

        {/* Location & Map Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-4">Find Us</h2>
              <p className="text-lg sm:text-xl text-sage max-w-3xl mx-auto">
                Located in the heart of beautiful Mahabaleshwar, our resort offers easy access to all major attractions
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Map */}
              <div className="order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14671.936717416102!2d73.7584162481834!3d17.90826147912499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc269ff80f61731%3A0xffc74f4030ef9795!2sGrand%20Valley%20Resort%20Bhilar%20Annex!5e1!3m2!1sen!2sin!4v1769187769047!5m2!1sen!2sin" 
                    width="100%" 
                    height="450" 
                    style={{border: 0}} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[450px]"
                  ></iframe>
                </div>
              </div>
              
              {/* Location Details */}
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-forest mb-6">Our Location</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-6 w-6 text-forest-800 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-forest">Address</h4>
                        <p className="text-sage">
                          {adminContactInfo.address ? (
                            <span>
                              {adminContactInfo.address.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                  {line}
                                  {index < adminContactInfo.address.split('\n').length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </span>
                          ) : (
                            <>Grand Valley Resort Bhilar<br />Post Kawand, Road, Tal- Mahabaleshwar<br />At, Kaswand, Bhilar, Maharashtra 412805<br />India</>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <CalendarIcon className="h-6 w-6 text-forest-800 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-forest">Check-in / Check-out</h4>
                        <p className="text-sage">Check-in: 1:00 PM onwards<br />Check-out: 10:00 AM<br /><span className="text-xs italic">* Flexible depending on other bookings</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="h-6 w-6 text-forest-800 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-forest">Contact</h4>
                        <p className="text-sage">{adminContactInfo.phone}<br />{adminContactInfo.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-forest mb-3">Nearby Attractions</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-sage">
                      <div>• Pratapgad Fort (24 km)</div>
                      <div>• Venna Lake (12 km)</div>
                      <div>• Mapro Garden (8 km)</div>
                      <div>• Lingmala Waterfall (18 km)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-cream-beige">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-4">Ready to Experience Resort Booking System?</h2>
            <p className="text-lg sm:text-xl text-sage mb-6 sm:mb-8 max-w-3xl mx-auto">
              Book your stay today and create memories that will last a lifetime
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Link
                to="/rooms"
                className="btn-luxury inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                Start Your Journey
                <ArrowRightIcon className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link
                to="/contact"
                className="btn-secondary inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Gallery Modal */}
        {galleryModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full max-w-4xl max-h-full">
              <button className="absolute top-4 right-4 text-white text-3xl z-10" onClick={closeGallery}>
                &times;
              </button>
              <div className="relative">
                <img
                  src={galleryModal.images[galleryModal.currentIndex]}
                  alt={galleryModal.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-3xl z-10"
                onClick={prevImage}
              >
                &lt;
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-3xl z-10"
                onClick={nextImage}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home 
