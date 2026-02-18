import { CalendarIcon, EnvelopeIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import PaymentCancellationModal from '../components/PaymentCancellationModal'
import PaymentConfirmationModal from '../components/PaymentConfirmationModal'
import RoomUnavailableModal from '../components/RoomUnavailableModal'
import { loadRazorpayScript } from '../lib/razorpay'
import { api } from '../lib/supabase'

interface BookingFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  special_requests: string
}

const BookingForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDates, setSelectedDates] = useState<{ checkIn: string; checkOut: string } | null>(null)
  const [numGuests, setNumGuests] = useState(1)
  const [totalAmount, setTotalAmount] = useState(0)
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [initialDate, setInitialDate] = useState<string>('')
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [cancellationType, setCancellationType] = useState<'cancelled' | 'failed'>('cancelled')
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)
  const [showPaymentConfirmationModal, setShowPaymentConfirmationModal] = useState(false)
  const paymentHandledRef = useRef(false)
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const razorpayInstanceRef = useRef<any>(null)

  const [formData, setFormData] = useState<BookingFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    special_requests: ''
  })

  // Helper function to calculate total amount with occupancy-based pricing
  const calculateTotalAmount = (checkInDate: string, checkOutDate: string, guestCount: number) => {
    if (!room || !checkInDate || !checkOutDate) return 0
    
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    // Determine base price based on occupancy
    let basePricePerNight = 0
    
    // Check if occupancy pricing is available (convert to number if it's a string)
    const priceTriple = typeof room.price_triple_occupancy === 'string' ? parseFloat(room.price_triple_occupancy) : (room.price_triple_occupancy || 0)
    const priceDouble = typeof room.price_double_occupancy === 'string' ? parseFloat(room.price_double_occupancy) : (room.price_double_occupancy || 0)
    
    if (priceTriple > 0 && guestCount === 3) {
      basePricePerNight = priceTriple
    } else if (priceDouble > 0 && guestCount >= 2) {
      basePricePerNight = priceDouble
    } else {
      // Fallback to price_per_night for backward compatibility
      basePricePerNight = typeof room.price_per_night === 'string' ? parseFloat(room.price_per_night) : (room.price_per_night || 0)
    }
    
    const total = basePricePerNight * nights
    
    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Price Calculation:', {
        guestCount,
        nights,
        priceDouble,
        priceTriple,
        basePricePerNight,
        total
      })
    }
    
    return total
  }

  useEffect(() => {
    loadRazorpayScript().catch(() => {})
    
    // Check if we have state passed from RoomDetail (for dates and guests only)
    if (location.state) {
      const { selectedDates: passedDates, numGuests: passedGuests } = location.state as any
      
      if (passedDates) {
        setSelectedDates(passedDates)
      }
      
      if (passedGuests) {
        setNumGuests(passedGuests)
      }
    }
    
    // Always load fresh room data from API to ensure we have the latest values
    loadRoomData()
    
    // Cleanup function to clear timers when component unmounts
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
      // Reset payment state
      paymentHandledRef.current = false
      setSubmitting(false)
    }
  }, [slug, location.state])

  // Recalculate total when dates, guests, or room changes
  useEffect(() => {
    if (room && selectedDates?.checkIn && selectedDates?.checkOut) {
      const total = calculateTotalAmount(selectedDates.checkIn, selectedDates.checkOut, numGuests)
      setTotalAmount(total)
    }
  }, [selectedDates, numGuests, room])

  const loadRoomData = async () => {
    try {
      if (!slug) return
      
      // Get room with any status (including inactive)
      const roomData = await api.getRoomBySlugAnyStatus(slug)
      
      // Room exists, set it (even if inactive - we'll disable booking)
      setRoom(roomData)
      
      // If room is inactive, show unavailable modal but still render the form
      if (roomData && !roomData.is_active) {
        setShowUnavailableModal(true)
      }
      
      setLoading(false)
    } catch (error) {
      toast.error('Failed to load room details')
      setLoading(false)
    }
  }

  const handleDateClick = (date: string) => {
    if (!selectedDates) {
      setSelectedDates({ checkIn: date, checkOut: date })
      setInitialDate(date)
    } else if (!selectedDates.checkOut || selectedDates.checkIn === selectedDates.checkOut) {
      if (date < selectedDates.checkIn) {
        setSelectedDates({ checkIn: date, checkOut: selectedDates.checkIn })
      } else {
        setSelectedDates({ checkIn: selectedDates.checkIn, checkOut: date })
      }
    } else {
      setSelectedDates({ checkIn: date, checkOut: date })
      setInitialDate(date)
    }
  }

  const handleCalendarClose = () => {
    setShowCalendar(false)
  }

  const handleCalendarConfirm = () => {
    if (selectedDates?.checkIn && selectedDates?.checkOut) {
      const total = calculateTotalAmount(selectedDates.checkIn, selectedDates.checkOut, numGuests)
      setTotalAmount(total)
      setShowCalendar(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGuestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const guests = parseInt(e.target.value)
    setNumGuests(guests)
    
    if (selectedDates?.checkIn && selectedDates?.checkOut) {
      const total = calculateTotalAmount(selectedDates.checkIn, selectedDates.checkOut, guests)
      setTotalAmount(total)
    }
  }

  const checkAvailability = async () => {
    if (!selectedDates?.checkIn || !selectedDates?.checkOut) return true

    // Check if check-in and check-out are the same date
    if (selectedDates.checkIn === selectedDates.checkOut) {
      toast.error('Check-out date cannot be the same as check-in date. Please select different dates.')
      return false
    }

    try {
      // Use the comprehensive availability checking function
      const availability = await api.checkRoomAvailability(
        room.id,
        selectedDates.checkIn,
        selectedDates.checkOut
      )
      
      return availability.available
    } catch (error) {
      return true
    }
  }

  const handleRetryPayment = async () => {
    // Validate form data before retrying
    if (!selectedDates?.checkIn || !selectedDates?.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const isAvailable = await checkAvailability()
    if (!isAvailable) {
      toast.error('Selected dates are not available')
      return
    }

    setSubmitting(true)

    try {
      
      // Show loading message for user
      toast.loading('Preparing payment gateway...', { id: 'payment-prep' })
      
      // Create Razorpay order
      let orderData: any
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          
          // Update loading message
          if (retryCount > 0) {
            toast.loading(`Retrying payment setup... (${retryCount}/${maxRetries})`, { id: 'payment-prep' })
          }
          
          const orderResponse = await fetch('/.netlify/functions/create-razorpay-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: totalAmount,
              currency: 'INR',
              receipt: `booking_${room.id}`, // Use room ID for receipt
              notes: {
                booking_id: room.id, // Use room ID for notes
                room_name: room.name,
                guest_name: `${formData.first_name} ${formData.last_name}`,
              },
            }),
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
          })

          
          if (!orderResponse.ok) {
            const errorText = await orderResponse.text()
            throw new Error(`Failed to create payment order: ${errorText}`)
          }

          orderData = await orderResponse.json()
          
          if (!orderData.success) {
            throw new Error(orderData.error || 'Failed to create payment order')
          }
          
          // If we get here, the request was successful
          toast.success('Payment gateway ready!', { id: 'payment-prep' })
          break
          
        } catch (error) {
          retryCount++
          
          if (retryCount >= maxRetries) {
            toast.error('Failed to create payment order. Please try again.', { id: 'payment-prep' })
            setSubmitting(false)
            return
          }
          
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }

      // Open Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount,
        currency: 'INR',
        name: 'Resort Booking System',
        description: `Booking for ${room.name}`,
        order_id: orderData.order.id,
        handler: (response: any) => handlePaymentSuccess(response, orderData),
        prefill: {
          name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          booking_id: room.id,
          room_name: room.name,
          guest_name: `${formData.first_name} ${formData.last_name}`,
          check_in: selectedDates.checkIn,
          check_out: selectedDates.checkOut,
          guests: numGuests,
          amount: totalAmount
        },
        theme: {
          color: '#10B981'
        },
        modal: {
          ondismiss: () => {
        setSubmitting(false)
        setCancellationType('cancelled')
        setShowCancellationModal(true)
        
            // Show a sweet notification
        toast.dismiss() // Clear any existing toasts
        toast.error(
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">Payment Cancelled</div>
              <div className="text-sm text-orange-100">Don't worry, you can try again anytime!</div>
            </div>
          </div>,
          { 
            duration: 5000,
            id: 'payment-cancelled-toast',
            style: {
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              borderRadius: '12px',
              padding: '16px'
            }
          }
        )
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      
      // Handle payment failure
      razorpay.on('payment.failed', (response: any) => {
        setSubmitting(false)
        setCancellationType('failed')
        setShowCancellationModal(true)
        
        // Show a sweet notification
        toast.dismiss() // Clear any existing toasts
        toast.error(
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">Payment Failed</div>
              <div className="text-sm text-red-100">Please check your payment details and try again.</div>
            </div>
          </div>,
          { 
            duration: 5000,
            id: 'payment-failed-toast',
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '12px',
              padding: '16px'
            }
          }
        )
      })
      
      razorpay.open()
      
    } catch (error) {
      toast.error('Failed to process payment. Please try again.')
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if room is inactive
    if (room && !room.is_active) {
      toast.error('This room is currently unavailable for booking. Please contact us for more information.')
      return
    }
    
    if (!selectedDates?.checkIn || !selectedDates?.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const isAvailable = await checkAvailability()
    if (!isAvailable) {
      toast.error('Selected dates are not available')
      return
    }

    // Show payment confirmation modal instead of directly processing payment
    setShowPaymentConfirmationModal(true)
  }

  const processPayment = async () => {
    // Check if room is inactive
    if (room && !room.is_active) {
      toast.error('This room is currently unavailable for booking. Please contact us for more information.')
      return
    }

    if (!selectedDates?.checkIn || !selectedDates?.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    setShowPaymentConfirmationModal(false)
    setSubmitting(true)

    try {
      
      // Check if we're on localhost - bypass Razorpay for testing
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      if (isLocalhost) {
        // Localhost bypass - create booking directly without payment
        toast.loading('Creating booking (localhost mode)...', { id: 'payment-prep' })
        
        // Simulate payment success with mock data
        const mockPaymentResponse = {
          razorpay_payment_id: `mock_payment_${Date.now()}`,
          razorpay_order_id: `mock_order_${Date.now()}`,
          razorpay_signature: 'mock_signature'
        }
        
        const mockOrderData = {
          order: {
            id: `mock_order_${Date.now()}`,
            amount: totalAmount,
            currency: 'INR'
          }
        }
        
        // Wait a moment to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Process the booking
        await handlePaymentSuccess(mockPaymentResponse, mockOrderData)
        return
      }
      
      // Production flow - use Razorpay
      // Show loading message for user
      toast.loading('Preparing payment gateway...', { id: 'payment-prep' })
      
      // Create Razorpay order
      let orderData: any
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          
          // Update loading message
          if (retryCount > 0) {
            toast.loading(`Retrying payment setup... (${retryCount}/${maxRetries})`, { id: 'payment-prep' })
          }
          
          const orderResponse = await fetch('/.netlify/functions/create-razorpay-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: totalAmount,
              currency: 'INR',
              receipt: `booking_${room.id}`, // Use room ID for receipt
              notes: {
                booking_id: room.id, // Use room ID for notes
                room_name: room.name,
                guest_name: `${formData.first_name} ${formData.last_name}`,
              },
            }),
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
          })

          
          if (!orderResponse.ok) {
            const errorText = await orderResponse.text()
            throw new Error(`Failed to create payment order: ${errorText}`)
          }

          orderData = await orderResponse.json()
          
          if (!orderData.success) {
            throw new Error(orderData.error || 'Failed to create payment order')
          }
          
          // If we get here, the request was successful
          toast.success('Payment gateway ready!', { id: 'payment-prep' })
          break
          
        } catch (error) {
          retryCount++
          
          if (retryCount >= maxRetries) {
            toast.error('Failed to create payment order. Please try again.', { id: 'payment-prep' })
            setSubmitting(false)
            return
          }
          
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }

      // Open Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount,
        currency: 'INR',
        name: 'Resort Booking System',
        description: `Booking for ${room.name}`,
        order_id: orderData.order.id,
        handler: (response: any) => handlePaymentSuccess(response, orderData),
        prefill: {
          name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          booking_id: room.id,
          room_name: room.name,
          guest_name: `${formData.first_name} ${formData.last_name}`,
          check_in: selectedDates.checkIn,
          check_out: selectedDates.checkOut,
          guests: numGuests,
          amount: totalAmount
        },
        theme: {
          color: '#10B981'
        },
        modal: {
          ondismiss: () => {
             setSubmitting(false)
             setCancellationType('cancelled')
             setShowCancellationModal(true)
             
            // Show a sweet notification
            toast.dismiss() // Clear any existing toasts
             toast.error(
               <div className="flex items-center space-x-3">
                 <div className="flex-shrink-0">
                   <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                   </svg>
                 </div>
                 <div>
                   <div className="font-semibold text-white">Payment Cancelled</div>
                  <div className="text-sm text-orange-100">Don't worry, you can try again anytime!</div>
                 </div>
               </div>,
               { 
                 duration: 5000,
                id: 'payment-cancelled-toast',
                 style: {
                   background: 'linear-gradient(135deg, #f97316, #ea580c)',
                   borderRadius: '12px',
                   padding: '16px'
                 }
               }
             )
           }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpayInstanceRef.current = razorpay
      
      // Reset payment handled flag for new payment attempt
      paymentHandledRef.current = false
      
            // Handle payment failure
      razorpay.on('payment.failed', (response: any) => {
        paymentHandledRef.current = true
        setSubmitting(false)
        
        // Clear fallback timer
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current)
          fallbackTimerRef.current = null
        }
        
        // Show failure notification
        toast.dismiss() // Clear any existing toasts
        toast.error(
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">Payment Failed</div>
              <div className="text-sm text-red-100">Please check your payment details and try again.</div>
            </div>
          </div>,
          { 
            duration: 5000,
            id: 'payment-failed-toast',
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '12px',
              padding: '16px'
            }
          }
        )
      })
      razorpay.open()
       
    } catch (error) {
      toast.error('Failed to process payment. Please try again.')
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = async (response: any, orderData: any) => {
    
    // Clear fallback timer and mark payment as completed
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    
    // Mark payment as handled to prevent fallback detection
    paymentHandledRef.current = true
    
    // Set submitting to false to ensure button state is correct
    setSubmitting(false)
    try {
      // Create booking only after successful payment
      const bookingData = {
        room_id: room.id,
        check_in_date: selectedDates.checkIn,
        check_out_date: selectedDates.checkOut,
        num_guests: numGuests,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        special_requests: formData.special_requests,
        total_amount: totalAmount,
        booking_status: 'confirmed',
        payment_status: 'paid',
        payment_gateway: 'razorpay',
        razorpay_order_id: orderData?.order?.id,
        razorpay_payment_id: response.razorpay_payment_id
      }

      const booking = await api.createBooking(bookingData)

      // Send confirmation emails
      try {
        const { EmailService } = await import('../lib/email-service')
        const emailResult = await EmailService.sendBookingConfirmation(booking, room)
        
        if (emailResult.success) {
          toast.success('Booking confirmed! Confirmation emails sent.')
        } else {
          toast.error('Booking confirmed but email notification failed.')
        }
      } catch (emailError) {
        toast.error('Booking confirmed but email notification failed.')
        // Don't fail the booking if email fails
      }

      // Show success notification
      toast.dismiss() // Clear any existing toasts
      toast.success(
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-white">Payment Successful!</div>
            <div className="text-sm text-green-100">Redirecting to booking confirmation...</div>
          </div>
        </div>,
        { 
          duration: 3000,
          id: 'payment-success-toast',
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            padding: '16px'
          }
        }
      )

      // Navigate to booking confirmation page immediately after payment
      navigate(`/booking/confirmation/${booking.id}`, { 
        replace: true
      })

    } catch (error) {
      toast.error('Payment successful but booking creation failed. Please contact support.')
      setSubmitting(false)
    }
  }

  // If showing unavailable modal, don't render booking form
  if (showUnavailableModal) {
    return (
      <RoomUnavailableModal
        isOpen={showUnavailableModal}
        onClose={() => {
          setShowUnavailableModal(false)
          navigate('/rooms')
        }}
        roomName={undefined}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-600">The requested room could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Book {room.name}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Room Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Details</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <img 
                    src={room.image_url} 
                    alt={room.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-4">{room.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price per night:</span> ₹{room.price_per_night}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Max occupancy:</span> {room.max_occupancy} guests
                    </p>
                    {room.accommodation_details && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Accommodation:</span> {room.accommodation_details}
                      </p>
                    )}
                  </div>
                  
                  {/* Check-in/Check-out Times */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Check-in & Check-out Times</h4>
                    <div className="text-xs text-blue-800 space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium">Check-in:</span>
                        <span className="ml-2">{room?.check_in_time ? `${room.check_in_time} onwards` : '1:00 PM onwards'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Check-out:</span>
                        <span className="ml-2">{room?.check_out_time || '10:00 AM'}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <span className="text-xs italic">* Check-in and check-out times are flexible depending on other bookings. Please contact us for early check-in or late check-out requests.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Dates
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(true)}
                      disabled={!room?.is_active}
                      className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 text-gray-900"
                    >
                      <span className="text-gray-900">
                        {selectedDates 
                          ? `${new Date(selectedDates.checkIn).toLocaleDateString()} - ${new Date(selectedDates.checkOut).toLocaleDateString()}`
                          : 'Select check-in and check-out dates'
                        }
                      </span>
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests *
                    </label>
                    <select
                      value={numGuests}
                      onChange={handleGuestChange}
                      disabled={!room?.is_active}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 text-gray-900"
                      required
                    >
                      {Array.from({ length: room?.max_occupancy || 3 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                    {/* Show occupancy pricing info */}
                    {room && (
                      <div className="mt-2 text-xs text-gray-600">
                        {room.price_double_occupancy && (
                          <div>2 guests: ₹{room.price_double_occupancy.toLocaleString()}/night</div>
                        )}
                        {room.price_triple_occupancy && (
                          <div>3 guests: ₹{room.price_triple_occupancy.toLocaleString()}/night</div>
                        )}
                      </div>
                    )}
                  </div>

              {/* Guest Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                          name="first_name"
                          value={formData.first_name}
                    onChange={handleInputChange}
                    required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="First Name"
                  />
                      </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                        name="last_name"
                        value={formData.last_name}
                    onChange={handleInputChange}
                    required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Last Name"
                  />
                </div>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                  </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="your.email@example.com"
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        title="Please enter a valid email address"
                  />
                </div>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                  </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit mobile number"
                        maxLength={10}
                  />
                </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Any special requests or requirements..."
                    />
                  </div>

                  {/* Price Breakdown */}
                  {totalAmount > 0 && selectedDates?.checkIn && selectedDates?.checkOut && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        {(() => {
                          const checkIn = new Date(selectedDates.checkIn)
                          const checkOut = new Date(selectedDates.checkOut)
                          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
                          
                          // Calculate occupancy-based price
                          let basePricePerNight = 0
                          let occupancyType = ''
                          
                          if (room?.price_triple_occupancy && numGuests === 3) {
                            basePricePerNight = room.price_triple_occupancy
                            occupancyType = 'Triple Occupancy'
                          } else if (room?.price_double_occupancy && numGuests >= 2) {
                            basePricePerNight = room.price_double_occupancy
                            occupancyType = 'Double Occupancy'
                          } else {
                            basePricePerNight = room?.price_per_night || 0
                            occupancyType = 'Base Price'
                          }
                          
                          const baseAmount = basePricePerNight * nights
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {occupancyType} ({numGuests} guest{numGuests !== 1 ? 's' : ''}, {nights} night{nights !== 1 ? 's' : ''}):
                                </span>
                                <span className="font-medium">₹{baseAmount.toLocaleString()}</span>
                              </div>
                              <div className="border-t border-blue-200 pt-2 mt-2">
                                <div className="flex justify-between">
                                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                                  <span className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</span>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Booking Terms */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Terms</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>• If the guest agrees with the house rules can book the stay by paying full amount at the time of booking.</p>
                      <p>• Any change, modification can be allowed if feasible and possible.</p>
                    </div>
                  </div>

                  {/* Room Unavailable Message */}
                  {room && !room.is_active && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-semibold text-red-900 mb-1">Room Currently Unavailable</h4>
                          <p className="text-sm text-red-800">This room is temporarily unavailable for booking. Please contact us for more information or check back later.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !room?.is_active || !selectedDates || totalAmount === 0}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed relative"
                  >
                    {!room?.is_active ? (
                      'Room Unavailable'
                    ) : submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                  
                  {/* Help Text */}
                  {(!selectedDates || totalAmount === 0) && room?.is_active && (
                    <p className="text-sm text-gray-600 text-center">
                      {!selectedDates 
                        ? 'Please select check-in and check-out dates above'
                        : 'Please confirm your dates in the calendar to calculate the total amount'}
                    </p>
                  )}


                </form>
              </div>
            </div>
                  </div>
              </div>
            </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Dates</h3>
              <button
                onClick={handleCalendarClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <AvailabilityCalendar
              roomId={room.id}
              onDateClick={handleDateClick}
              selectedDates={selectedDates}
              initialDate={initialDate}
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handleCalendarClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            <button
                onClick={handleCalendarConfirm}
                disabled={!selectedDates?.checkIn || !selectedDates?.checkOut}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Confirm Dates
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmationModal && room && selectedDates && (
        <PaymentConfirmationModal
          isOpen={showPaymentConfirmationModal}
          onClose={() => setShowPaymentConfirmationModal(false)}
          onProceed={processPayment}
          roomName={room.name}
          guestName={`${formData.first_name} ${formData.last_name}`}
          guestCount={numGuests}
          checkIn={selectedDates.checkIn}
          checkOut={selectedDates.checkOut}
          totalAmount={totalAmount}
        />
      )}

      {/* Payment Cancellation Modal */}
      <PaymentCancellationModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        onRetry={() => {
          setShowCancellationModal(false)
          // Retry payment by showing confirmation modal again
          setShowPaymentConfirmationModal(true)
        }}
        onGoHome={() => {
          setShowCancellationModal(false)
          navigate('/')
        }}
        onContactSupport={() => {
          setShowCancellationModal(false)
          navigate('/contact')
        }}
        cancellationType={cancellationType}
      />
    </div>
  )
}

export default BookingForm 
