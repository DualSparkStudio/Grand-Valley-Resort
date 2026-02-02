import { CreditCardIcon, DocumentTextIcon, ShieldCheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

const Policy: React.FC = () => {
  const policies = [
    {
      title: 'Cancellation Policy',
      icon: XCircleIcon,
      content: [
        {
          subtitle: 'Refund Policy',
          text: '100% refund if canceled 15 days or more before check-in. 50% refund if canceled 4-14 days before check-in. No refund if canceled within 4 days of check-in.'
        },
        {
          subtitle: 'Booking Confirmation',
          text: 'Bookings are confirmed upon receipt of full payment. Any changes to booking dates are subject to availability and may incur additional charges.'
        },
        {
          subtitle: 'Force Majeure',
          text: 'In case of natural disasters, government restrictions, or other unforeseen circumstances, we will work with guests to reschedule or provide appropriate refunds.'
        },
        {
          subtitle: 'Early Departure',
          text: 'Early departure does not qualify for a refund. Guests are responsible for the full duration of their confirmed booking.'
        }
      ]
    },
    {
      title: 'Privacy & Data Protection',
      icon: ShieldCheckIcon,
      content: [
        {
          subtitle: 'Information We Collect',
          text: 'We value your privacy and are committed to protecting your personal information. When you make a booking or contact us, we may collect details such as your name, contact information, payment details, and government-issued ID (as required by law).'
        },
        {
          subtitle: 'How We Use Your Information',
          text: 'This information is used only for: Processing and confirming your reservation, providing services during your stay, and complying with legal and regulatory requirements.'
        },
        {
          subtitle: 'Information Sharing',
          text: 'We do not sell or rent your personal information to third parties. Your data may be shared only with trusted service providers (e.g., payment processors, booking platforms) and local authorities when legally required.'
        },
        {
          subtitle: 'Data Security',
          text: 'We take reasonable measures to safeguard your data and restrict access to authorized personnel only. By using our services, you consent to the collection and use of your information in accordance with this policy.'
        }
      ]
    },
    {
      title: 'Terms & Conditions - House Rules',
      icon: DocumentTextIcon,
      content: [
        {
          subtitle: 'Smoking & Alcohol',
          text: 'Smoking inside rooms is not allowed. Alcohol drinking is not allowed on the premises. Violation may result in immediate eviction without refund.'
        },
        {
          subtitle: 'Visitors & Identification',
          text: 'Outside visitors are not allowed without prior permission. Photo IDs and address proofs of all guests are must before check-in. This is mandatory for security and legal compliance.'
        },
        {
          subtitle: 'Pets & Property Care',
          text: 'Pets are allowed with responsibility of proper cleaning. Any damage to furniture, linens will be recovered. Guests are responsible for maintaining the cleanliness and condition of their rooms.'
        },
        {
          subtitle: 'Utilities & Accommodation',
          text: 'Guest to use electricity judiciously and put off when not in use. We are not providing any accommodation for drivers. Wash the feet outside after visiting the beach to maintain cleanliness.'
        },
        {
          subtitle: 'Occupancy & Additional Services',
          text: 'All the rooms have double occupancy. Extra mattress will be charged @250/- per day. Auto, Car, two wheeler can be arranged if required.'
        },
        {
          subtitle: 'Communication & Issues',
          text: 'If you have any issue, concern you may please bring it to notice instantly. We are here to ensure your comfort and satisfaction throughout your stay.'
        }
      ]
    },
    {
      title: 'Payment and Refunds',
      icon: CreditCardIcon,
      content: [
        {
          subtitle: 'Payment Methods',
          text: 'We accept online payments through secure payment gateways. All prices are in Indian Rupees (INR) and include applicable taxes. Full payment is required at the time of booking.'
        },
        {
          subtitle: 'Refund Processing',
          text: 'Refunds are processed within 5-7 business days to the original payment method. Processing times may vary depending on your bank or payment provider.'
        },
        {
          subtitle: 'Additional Charges',
          text: 'Extra services such as additional mattresses, transportation, or special requests may incur additional charges which will be clearly communicated beforehand.'
        },
        {
          subtitle: 'Security Deposits',
          text: 'A security deposit may be required for certain bookings and will be refunded after check-out if no damage is found.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-dark-blue-800 to-golden-500">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Policies & Terms</h1>
            <p className="text-lg max-w-2xl mx-auto">
              Important information about your stay at Resort Booking System
            </p>
          </div>
        </div>
      </section>

      {/* Policies Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {policies.map((policy, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-dark-blue-800 to-golden-500 rounded-lg flex items-center justify-center mr-4">
                    <policy.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{policy.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {policy.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-l-4 border-golden-300 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="mt-12 bg-golden-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Questions About Our Policies?
            </h3>
            <p className="text-gray-700 mb-6">
              If you have any questions about our policies or need clarification on any terms, 
              please don't hesitate to contact us.
            </p>
            <div className="flex justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-dark-blue-800 to-golden-500 text-white font-medium rounded-lg hover:opacity-90 transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Last updated: January 2025</p>
            <p className="mt-1">
              These policies are subject to change. Please check back periodically for updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Policy;
