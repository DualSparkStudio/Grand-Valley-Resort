import {
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import SEO from '../components/SEO'
import { api } from '../lib/supabase'

const About: React.FC = () => {
  const [adminContactInfo, setAdminContactInfo] = useState({
    email: '',
    phone: '',
    address: 'Ratnagiri, Maharashtra, India'
  })

  // Load admin contact info on component mount
  useEffect(() => {
    const loadAdminContactInfo = async () => {
      try {
        const adminInfo = await api.getAdminInfo()
        setAdminContactInfo({
          email: adminInfo.email,
          phone: adminInfo.phone || '+91 98765 43210',
          address: adminInfo.address || 'Ratnagiri, Maharashtra, India'
        })
      } catch (error) {
        // Keep default values if loading fails
      }
    }
    
    loadAdminContactInfo()
  }, [])



  const values = [
    {
      title: 'Luxury Redefined',
      description: 'We believe luxury is not just about opulence, but about creating meaningful experiences that touch the soul and create lasting memories.',
      icon: '✨'
    },
    {
      title: 'Sustainability First',
      description: 'Our commitment to environmental stewardship ensures that future generations can enjoy the same pristine beauty that surrounds our resort.',
      icon: '🌿'
    },
    {
      title: 'Cultural Heritage',
      description: 'We celebrate and preserve the rich cultural heritage of our location, offering guests authentic experiences that connect them to the local community.',
      icon: '🏛️'
    },
    {
      title: 'Personalized Service',
      description: 'Every guest is unique, and we tailor our services to create personalized experiences that exceed expectations and create unforgettable moments.',
      icon: '👑'
    }
  ]

  return (
    <>
      <SEO 
        title="About Resort Booking System - Our Story & Mission"
        description="Discover the story behind Resort Booking System. Learn about our mission, values, and commitment to providing luxury experiences."
        keywords="about Resort Booking System, booking system story, luxury booking platform, booking system mission, accommodation booking history"
        url="https://riverbreezehomestay.com/about"
      />
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-800 to-green-800">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">About Resort Booking System</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Where luxury meets nature, and every moment becomes a cherished memory
            </p>
          </div>
        </div>
      </section>

             {/* Story Section */}
       <section className="py-20 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
             <div className="relative">
               <div className="h-full rounded-2xl overflow-hidden shadow-2xl">
                 <img 
                   src="/images/About us.PNG" 
                   alt="Resort Booking System - Your friendly booking platform" 
                   className="w-full h-full object-cover"
                 />
               </div>
             </div>
             <div className="flex flex-col justify-center">
               <h2 className="text-4xl font-bold text-gray-900 mb-6">🌿 About Us</h2>
               <p className="text-lg text-gray-600 mb-6">
                 Welcome to Resort Booking System, your trusted platform for luxury resort bookings.
                 We are committed to providing exceptional booking experiences with premium accommodations, personalized service, and attention to detail.
               </p>
               <p className="text-lg text-gray-600 mb-6">
                 We are committed to providing exceptional booking experiences with premium accommodations. Whether you're looking to relax, explore natural beauty, or experience authentic local culture, Resort Booking System promises comfort, privacy, and unforgettable memories.
               </p>
               <p className="text-lg text-gray-600">
                 Stay with us once, and you'll always carry a part of Konkan in your heart.
               </p>
             </div>
           </div>
         </div>
       </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To establish Resort Booking System as the finest booking platform, offering an unforgettable blend of comfort, charm, and exceptional service.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To treat every guest as a valued treasure, ensuring their satisfaction, comfort, and privacy at every step. We aspire for each guest to leave as a delighted brand ambassador for Resort Booking System.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every aspect of our service, from the smallest detail to the grandest gesture.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainability</h3>
              <p className="text-gray-600">
                We are committed to environmental responsibility and sustainable practices in all our operations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">
                We believe in building strong relationships with our local community and supporting local initiatives.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Integrity</h3>
              <p className="text-gray-600">
                We conduct our business with honesty, transparency, and the highest ethical standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Perfect Location</h2>
              <p className="text-lg text-gray-600 mb-6">
                Located in the heart of beautiful Ratnagiri, our homestay offers the perfect balance 
                of seclusion and accessibility. Just a short distance from major attractions 
                yet worlds away from the everyday.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPinIcon className="h-6 w-6 text-green-800 mr-3" />
                  <span className="text-gray-600">{adminContactInfo.address}</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-6 w-6 text-green-800 mr-3" />
                  <span className="text-gray-600">{adminContactInfo.phone}</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-6 w-6 text-green-800 mr-3" />
                  <span className="text-gray-600">{adminContactInfo.email}</span>
                </div>
              </div>
            </div>
                         <div className="relative">
               <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl">
                 <img 
                   src="https://lh3.googleusercontent.com/gps-cs-s/AC9h4npfPGSxtiXfcgY_L44lb2KFu1R-sd1Klb1JKJawWODIPRlieGmUFbYH0SsDYnGLQ3Pr6S-nxH5TH8Jn746dZ0ZpMTJh3fNDXH2Kay4PXQihqKZXBRuTGiYwmaK8S5T0zlkQHxjYJA=s1360-w1360-h1020-rw" 
                   alt="Resort Booking System Location" 
                   className="w-full h-full object-cover"
                 />
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-800 to-green-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Paradise?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Book your stay today and discover why Resort Booking System is the ultimate 
            destination for luxury and relaxation.
          </p>
          <a
            href="/rooms"
            className="inline-block bg-white text-blue-800 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300"
          >
            Explore Our Rooms
          </a>
        </div>
      </section>
    </div>
    </>
  )
}

export default About 
