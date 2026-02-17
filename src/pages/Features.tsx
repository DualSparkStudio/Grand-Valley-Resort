import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import PremiumImage from '../components/PremiumImage'
import TextReveal from '../components/TextReveal'
import { supabase } from '../lib/supabase'

interface Feature {
  id: number
  title: string
  description: string
  icon: string
  category: string
  is_active: boolean
  display_order: number
}

const Features: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setFeatures(data || [])
    } catch (error) {
      console.error('Error fetching features:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category || 'general'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(feature)
    return acc
  }, {} as Record<string, Feature[]>)

  const facilities = [
    {
      title: 'COMFORT & CONVENIENCE',
      items: ['FREE WIFI', 'FREE PARKING', 'AC ROOMS', 'BALCONY WITH VALLEY VIEW'],
      icon: '🏨',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'LIVING & COMMON AREAS',
      items: ['LAWN & OUTDOOR SEATING AREA'],
      icon: '🌳',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      title: 'RECREATION & LEISURE',
      items: ['SWIMMING POOL', 'VALLEY VIEW', 'RELAXATION AREA', 'INDOOR ACTIVITIES'],
      icon: '🏊',
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      title: 'DESTINATION WEDDING',
      items: ['Breathtaking views of the Sahyadri mountains', 'Perfect setting for your dream wedding'],
      icon: '💒',
      gradient: 'from-pink-500/20 to-rose-500/20'
    }
  ]

  const amenities = [
    {
      title: 'INFINITY SWIMMING POOL',
      description: 'Experience the beauty of our infinity pool that offers stunning scenic views. The visual effect of water blending into the horizon creates a mesmerizing experience.',
      image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800',
      icon: '🏊',
      featured: true
    },
    {
      title: 'DESTINATION WEDDING',
      description: 'Plan your dream wedding amidst the lush greenery of Mahabaleshwar. We offer beautiful outdoor spaces and natural backdrops that make your special day unforgettable.',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      icon: '💒',
      featured: true
    },
    {
      title: 'INDOOR GAMES',
      description: 'Grand Valley Resort Bhilar Annex offers indoor games and entertainment options for all ages. Enjoy quality time with family and friends.',
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800',
      icon: '🎮',
      featured: false
    },
    {
      title: 'PURE VEG RESTAURANT',
      description: 'Our in-house vegetarian restaurant offers fresh, flavorful Indian classics and comfort food. Enjoy delicious meals prepared with fresh, vegetarian ingredients in a scenic setting surrounded by hills and greenery.',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      icon: '🍽️',
      featured: false
    }
  ]

  const specialAmenities = [
    {
      title: 'Candle Light Dinner',
      description: 'Enjoy an unforgettable candlelight dinner for couples. Available at additional cost.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      icon: '🕯️',
      price: 'Premium'
    },
    {
      title: 'Breakfast by the Pool',
      description: 'Experience a luxurious floating breakfast by the poolside. Available at additional charge.',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
      icon: '🍳',
      price: 'Premium'
    },
    {
      title: 'Room Decoration',
      description: 'Beautiful bedroom decoration for your special night. Available at extra charge.',
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
      icon: '🌹',
      price: 'Premium'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-dark-blue-800 to-golden-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Facilities & Amenities</h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-lg sm:text-xl max-w-2xl mx-auto">
                Discover world-class amenities and services that make Grand Valley Resort the ultimate luxury destination in the heart of Mahabaleshwar
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Database Features Section */}
      {!loading && features.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Our Features & Amenities
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need for a comfortable and memorable stay
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {features.map((feature) => (
                <motion.div key={feature.id} variants={itemVariants}>
                  <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-xl transition-all duration-300 group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon || '✨'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-golden-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Facilities Grid */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {facilities.map((facility, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="bg-white rounded-lg shadow-md p-6 h-full group hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-golden-100 to-dark-blue-100 border border-golden-200 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                        {facility.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 group-hover:text-golden-600 transition-colors">
                        {facility.title}
                      </h3>
                      <ul className="space-y-3">
                        {facility.items.map((item, i) => (
                          <li key={i} className="flex items-center text-gray-700 group-hover:text-gray-900 transition-colors">
                            <div className="w-1.5 h-1.5 bg-golden-500 rounded-full mr-3 flex-shrink-0 group-hover:scale-150 transition-transform" />
                            <span className="text-sm sm:text-base">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Amenities & Services */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Amenities & Services
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience luxury redefined
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          >
            {amenities.map((amenity, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="group relative"
              >
                <div className="relative rounded-lg overflow-hidden bg-white shadow-md group-hover:shadow-xl transition-all duration-500">
                  {/* Image Container */}
                  <div className="relative h-72 lg:h-80 overflow-hidden">
                    <PremiumImage
                      src={amenity.image}
                      alt={amenity.title}
                      className="h-full w-full scale-100 group-hover:scale-110 transition-transform duration-700"
                      parallax
                      blur
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/20 to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="w-14 h-14 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 flex items-center justify-center text-2xl shadow-lg group-hover:bg-white transition-colors">
                        {amenity.icon}
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {amenity.featured && (
                      <div className="absolute top-6 right-6">
                        <div className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-golden-600 text-xs font-semibold uppercase tracking-wider">
                          Featured
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 lg:p-8">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-golden-600 transition-colors">
                      {amenity.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                      {amenity.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pure Veg Restaurant Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <PremiumImage
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"
                  alt="Pure Veg Restaurant"
                  className="w-full h-[500px] lg:h-[600px] object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
                  parallax
                  blur
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-blue-900/40 to-transparent" />
                
                {/* Decorative Elements */}
                <div className="absolute top-8 left-8 w-20 h-20 border-2 border-golden-500/30 rounded-lg rotate-12" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-2 border-golden-500/20 rounded-lg -rotate-12" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Pure Veg Restaurant
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-dark-blue-800 to-golden-500 mb-8" />
              </div>
              
              <div className="space-y-5 text-gray-700 leading-relaxed text-base lg:text-lg">
                <p>
                  Our in-house vegetarian restaurant offers a delightful dining experience with fresh, 
                  vegetarian ingredients and authentic Indian dishes. Enjoy comfort meals in a scenic 
                  setting surrounded by hills and greenery.
                </p>
                <p>
                  We serve delicious, mouth-watering vegetarian food prepared with care and attention 
                  to detail, ensuring every meal is a memorable experience that celebrates the rich 
                  flavors of Indian cuisine.
                </p>
              </div>

              {/* Feature List */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {['Fresh Ingredients', 'Authentic Recipes', 'Scenic Views', 'Comfort Food'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-golden-500 rounded-full" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Special Amenities */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Special Amenities
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Make your stay extra special with our premium services
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {specialAmenities.map((amenity, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="bg-white rounded-lg shadow-md p-6 h-full group hover:shadow-xl transition-shadow duration-300">
                  {/* Image Container */}
                  <div className="relative h-56 mb-6 rounded-lg overflow-hidden">
                    <PremiumImage
                      src={amenity.image}
                      alt={amenity.title}
                      className="h-full w-full scale-100 group-hover:scale-110 transition-transform duration-700"
                      blur
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                    
                    {/* Icon */}
                    <div className="absolute top-4 right-4">
                      <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                        {amenity.icon}
                      </div>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-golden-600 text-xs font-semibold uppercase tracking-wider">
                        {amenity.price}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-golden-600 transition-colors">
                      {amenity.title}
                    </h3>
                    <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                      {amenity.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Features
