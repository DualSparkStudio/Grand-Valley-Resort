import {
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import GlassCard from '../components/GlassCard'
import PremiumImage from '../components/PremiumImage'
import SEO from '../components/SEO'
import TextReveal from '../components/TextReveal'
import { api } from '../lib/supabase'

const About: React.FC = () => {
  const [adminContactInfo, setAdminContactInfo] = useState({
    email: 'grandvalleyresortsbhilar@gmail.com',
    phone: '+91 8275063636',
    address: 'Post kawand, road, tal- mahabaleshwer, At, Kaswand, Bhilar, Maharashtra 412805'
  })

  useEffect(() => {
    const loadAdminContactInfo = async () => {
      try {
        const adminInfo = await api.getAdminInfo()
        setAdminContactInfo({
          email: adminInfo.email || 'grandvalleyresortsbhilar@gmail.com',
          phone: adminInfo.phone || '+91 8275063636',
          address: adminInfo.address || 'Post kawand, road, tal- mahabaleshwer, At, Kaswand, Bhilar, Maharashtra 412805'
        })
      } catch (error) {
        // Keep default values
      }
    }
    
    loadAdminContactInfo()
  }, [])

  return (
    <>
      <SEO 
        title="About Grand Valley Resort - Our Story & History"
        description="Discover the story behind Grand Valley Resort. Learn about our history, mission, and commitment to providing luxury experiences in Mahabaleshwar."
        keywords="about Grand Valley Resort, resort history, Mahabaleshwar resort, luxury resort, hilltop heaven"
        url="https://grandvalleyresort.com/about"
      />
      <div className="min-h-screen bg-dark-blue-900">
        {/* Welcome Hero Section */}
        <section className="relative min-h-screen flex items-center section-padding-premium">
          <PremiumImage
            src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1920"
            alt="Luxury Bedroom"
            className="absolute inset-0"
            parallax
            blur
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-blue-900/80 via-dark-blue-900/60 to-dark-blue-900/90" />
          
          <div className="container-premium relative z-10">
            <div className="max-w-4xl">
              <TextReveal variant="split" as="h1" className="text-premium-heading text-golden-400 font-bold mb-8 drop-shadow-2xl" style={{ textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3)' }}>
                WELCOME TO GRAND VALLEY RESORT
              </TextReveal>
              
              <TextReveal variant="fade" delay={0.3} className="text-xl text-white/90 leading-relaxed mb-8">
                Grand Valley Resort is a destination that blends comfort, nature, and modern amenities. 
                Located near Bhilar on Kawand-Bhilar Road, our resort offers a perfect escape from the 
                hustle and bustle of city life, surrounded by the natural beauty of the Sahyadri Range.
              </TextReveal>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="section-padding-premium bg-dark-blue-800">
          <div className="container-premium">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <TextReveal variant="fade" as="h2" className="text-3xl font-bold text-golden-400 mb-6 drop-shadow-lg" style={{ textShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}>
                  About Us
                </TextReveal>
                
                <div className="space-y-6 text-white/80 leading-relaxed">
                  <p>
                    Grand Valley Resort represents a philosophy where luxury meets nature. Nestled in 
                    the heart of Mahabaleshwar, our resort offers an escape that combines modern comfort 
                    with the serene beauty of the Sahyadri mountains.
                  </p>
                  <p>
                    We believe in creating memorable experiences for our guests, where every moment is 
                    designed to provide comfort, relaxation, and a connection with nature. Our commitment 
                    is to ensure that your stay with us becomes a cherished memory.
                  </p>
                  <p>
                    Whether you're seeking a romantic getaway, a family vacation, or a peaceful retreat, 
                    Grand Valley Resort provides the perfect setting for an unforgettable stay.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <PremiumImage
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                  alt="Grand Valley Resort Building"
                  className="rounded-2xl"
                  parallax
                  blur
                />
              </div>
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="section-padding-premium bg-dark-blue-900">
          <div className="container-premium">
            <div className="text-center mb-16">
              <TextReveal variant="split" as="h2" className="text-premium-heading text-golden-400 font-bold mb-8 drop-shadow-2xl" style={{ textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3)' }}>
                HISTORY
              </TextReveal>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <PremiumImage
                  src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
                  alt="Resort Exterior"
                  className="rounded-2xl"
                  parallax
                  blur
                />
              </div>
              
              <div>
                <div className="space-y-6 text-white/80 leading-relaxed">
                  <p>
                    Grand Valley Resort emerged as a nature-inspired hideaway in the breathtaking Sahyadri 
                    Range. What started as a vision to create a perfect blend of luxury and natural beauty 
                    has grown into a beloved destination for travelers seeking tranquility and comfort.
                  </p>
                  <p>
                    Our journey began with a simple belief: that the best hospitality comes from combining 
                    modern amenities with the untouched beauty of nature. Located in Mahabaleshwar, we offer 
                    our guests the gift of mountain air, panoramic valley views, and moments of pure relaxation.
                  </p>
                  <p>
                    Over the years, Grand Valley Resort has become a popular destination for those who appreciate 
                    the finer things in life while staying connected to nature. We continue to evolve, always 
                    keeping our guests' comfort and satisfaction at the heart of everything we do.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="section-padding-premium bg-dark-blue-800">
          <div className="container-premium">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <TextReveal variant="fade" as="h2" className="text-3xl font-bold text-golden-400 mb-6 drop-shadow-lg" style={{ textShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}>
                  Perfect Location
                </TextReveal>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  Located in the heart of Mahabaleshwar, our resort offers the perfect balance 
                  of seclusion and accessibility. Just a short distance from major attractions 
                  yet worlds away from the everyday.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center text-white/90">
                    <MapPinIcon className="h-6 w-6 text-golden mr-3 flex-shrink-0" />
                    <span>{adminContactInfo.address}</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <PhoneIcon className="h-6 w-6 text-golden mr-3 flex-shrink-0" />
                    <span>{adminContactInfo.phone}</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <EnvelopeIcon className="h-6 w-6 text-golden mr-3 flex-shrink-0" />
                    <span>{adminContactInfo.email}</span>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14671.936717416102!2d73.7584162481834!3d17.90826147912499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc269ff80f61731%3A0xffc74f4030ef9795!2sGrand%20Valley%20Resort%20Bhilar%20Annex!5e1!3m2!1sen!2sin!4v1769187769047!5m2!1sen!2sin" 
                  width="100%" 
                  height="450" 
                  style={{border: 0}} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-[450px] rounded-2xl"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default About
