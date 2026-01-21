import { CheckCircleIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import type { Booking, Room } from '../lib/supabase'
import { api } from '../lib/supabase'

const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadBooking()
    }
  }, [id])

  const loadBooking = async () => {
    try {
      setLoading(true)
      const bookingData = await api.getBooking(parseInt(id!))
      setBooking(bookingData)
      
      if (bookingData.room_id) {
        const roomData = await api.getRoom(bookingData.room_id)
        setRoom(roomData)
      }
    } catch (error) {
      toast.error('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium mb-2">Loading booking confirmation...</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mt-4">
            <p className="text-sm text-yellow-800 text-left">
              <strong>Please wait:</strong> The booking confirmation page might take a few seconds to display. 
              Please do not take any action (refresh, close tab, or click back) until the confirmation page appears.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/rooms')}
            className="btn-primary"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  const nights = calculateNights(booking.check_in_date, booking.check_out_date)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600">Your reservation has been successfully created</p>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">#{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights:</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{booking.num_guests}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Guest Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{booking.first_name} {booking.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{booking.email}</span>
                </div>
                {booking.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{booking.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Room Details */}
          {room && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Room Details</h2>
              <div className="flex items-center space-x-4">
                <img
                  src={room.image_url}
                  alt={room.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <p className="text-gray-600">{room.room_number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Room Rate (per night):</span>
                <span className="font-medium">₹{room?.price_per_night.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Nights:</span>
                <span className="font-medium">{nights}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-600">₹{booking.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Status</h2>
            <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
              booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
              booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              <span className="font-medium">
                {booking.payment_status === 'paid' ? 'Payment Completed' :
                 booking.payment_status === 'pending' ? 'Payment Pending' :
                 'Payment Failed'}
              </span>
            </div>
          </div>

          {/* Special Requests */}
          {booking.special_requests && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Special Requests</h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{booking.special_requests}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/rooms')}
              className="btn-secondary flex-1"
            >
              Book Another Room
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-primary flex-1"
            >
              Back to Home
            </button>
          </div>

          {/* Important Notes */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check-in time: {room?.check_in_time || '1:00 PM'} onwards</li>
              <li>• Check-out time: {room?.check_out_time || '10:00 AM'}</li>
              <li>• Check-in and check-out times are flexible depending on other bookings. Please contact us for early check-in or late check-out requests.</li>
              <li>• Please bring a valid ID for check-in</li>
              <li>• Contact us if you need to modify your booking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation 
