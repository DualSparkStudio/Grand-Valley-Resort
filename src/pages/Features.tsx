import React from 'react'
import GlassCard from '../components/GlassCard'
import PremiumImage from '../components/PremiumImage'
import TextReveal from '../components/TextReveal'

const Features: React.FC = () => {
  const facilities = [
    {
      title: 'COMFORT & CONVENIENCE',
      items: ['FREE WIFI', 'FREE PARKING', 'AC ROOMS', 'BALCONY WITH VALLEY VIEW'],
      icon: '🏨'
    },
    {
      title: 'Living & Common Areas',
      items: ['LAWN & OUTDOOR SEATING AREA'],
      icon: '🌳'
    },
    {
      title: 'RECREATION & LEISURE',
      items: ['SWIMMING POOL', 'VALLEY VIEW', 'RELAXATION AREA', 'INDOOR ACTIVITIES'],
      icon: '🏊'
    },
    {
      title: 'DESTINATION WEDDING',
      items: ['Breathtaking views of the Sahyadri mountains', 'Perfect setting for your dream wedding'],
      icon: '💒'
    }
  ]

  const amenities = [
    {
      title: 'INFINITY SWIMMING POOL',
      description: 'Experience the beauty of our infinity pool that offers stunning scenic views. The visual effect of water blending into the horizon creates a mesmerizing experience.',
      image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800',
      icon: '🏊'
    },
    {
      title: 'DESTINATION WEDDING',
      description: 'Plan your dream wedding amidst the lush greenery of Mahabaleshwar. We offer beautiful outdoor spaces and natural backdrops that make your special day unforgettable.',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      icon: '💒'
    },
    {
      title: 'INDOOR GAMES',
      description: 'Grand Valley Resort Bhilar Annex offers indoor games and entertainment options for all ages. Enjoy quality time with family and friends.',
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800',
      icon: '🎮'
    },
    {
      title: 'PURE VEG RESTAURANT',
      description: 'Our in-house vegetarian restaurant offers fresh, flavorful Indian classics and comfort food. Enjoy delicious meals prepared with fresh, vegetarian ingredients in a scenic setting surrounded by hills and greenery.',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      icon: '🍽️'
    }
  ]

  const specialAmenities = [
    {
      title: 'Candle Light Dinner',
      description: 'Enjoy an unforgettable candlelight dinner for couples. Available at additional cost.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      icon: '🕯️'
    },
    {
      title: 'Breakfast by the Pool',
      description: 'Experience a luxurious floating breakfast by the poolside. Available at additional charge.',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
      icon: '🍳'
    },
    {
      title: 'Room Decoration',
      description: 'Beautiful bedroom decoration for your special night. Available at extra charge.',
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
      icon: '🌹'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-blue-900">
      {/* Hero Section */}
      <section className="relative section-padding-premium flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-blue-900 via-dark-blue-800 to-dark-blue-900" />
        <div className="container-premium relative z-10">
          <div className="text-center">
            <TextReveal variant="split" as="h1" className="text-premium-heading text-golden mb-6">
              FACILITIES
            </TextReveal>
            <TextReveal variant="fade" delay={0.2} className="text-xl text-white/80 max-w-3xl mx-auto">
              Discover world-class amenities and services that make Grand Valley Resort the ultimate luxury destination
            </TextReveal>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="section-padding-premium bg-dark-blue-800">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {facilities.map((facility, index) => (
              <GlassCard key={index} hover>
                <div className="flex items-start mb-4">
                  <span className="text-4xl mr-4">{facility.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-golden mb-4 font-serif">
                      {facility.title}
                    </h3>
                    <ul className="space-y-2">
                      {facility.items.map((item, i) => (
                        <li key={i} className="flex items-center text-white/80">
                          <span className="w-2 h-2 bg-golden rounded-full mr-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities & Services */}
      <section className="section-padding-premium bg-dark-blue-900">
        <div className="container-premium">
          <div className="text-center mb-16">
            <TextReveal variant="split" as="h2" className="text-premium-heading text-golden mb-6">
              AMENITIES & SERVICES
            </TextReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {amenities.map((amenity, index) => (
              <div key={index} className="group">
                <div className="relative mb-6 rounded-2xl overflow-hidden">
                  <PremiumImage
                    src={amenity.image}
                    alt={amenity.title}
                    className="h-64 w-full"
                    parallax
                    blur
                  />
                  <div className="absolute top-4 left-4 text-4xl">{amenity.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-golden mb-4 font-serif">
                  {amenity.title}
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {amenity.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pure Veg Restaurant Section */}
      <section className="section-padding-premium bg-dark-blue-800">
        <div className="container-premium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <PremiumImage
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"
                alt="Pure Veg Restaurant"
                className="rounded-2xl"
                parallax
                blur
              />
            </div>
            <div>
              <TextReveal variant="fade" as="h2" className="text-3xl font-bold text-golden mb-6 font-serif">
                PURE VEG RESTAURANT
              </TextReveal>
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>
                  Our in-house vegetarian restaurant offers a delightful dining experience with fresh, 
                  vegetarian ingredients and authentic Indian dishes. Enjoy comfort meals in a scenic 
                  setting surrounded by hills and greenery.
                </p>
                <p>
                  We serve delicious, mouth-watering vegetarian food prepared with care and attention 
                  to detail, ensuring every meal is a memorable experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Amenities */}
      <section className="section-padding-premium bg-dark-blue-900">
        <div className="container-premium">
          <div className="text-center mb-16">
            <TextReveal variant="split" as="h2" className="text-premium-heading text-golden mb-6">
              SPECIAL AMENITIES AND SERVICES
            </TextReveal>
            <TextReveal variant="fade" delay={0.2} className="text-white/80">
              Make your stay extra special with our premium services
            </TextReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialAmenities.map((amenity, index) => (
              <GlassCard key={index} hover>
                <div className="relative mb-6 rounded-xl overflow-hidden h-48">
                  <PremiumImage
                    src={amenity.image}
                    alt={amenity.title}
                    className="h-full w-full"
                    blur
                  />
                  <div className="absolute top-4 right-4 text-3xl">{amenity.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-golden mb-3 font-serif">
                  {amenity.title}
                </h3>
                <p className="text-white/80 text-sm">
                  {amenity.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Features
