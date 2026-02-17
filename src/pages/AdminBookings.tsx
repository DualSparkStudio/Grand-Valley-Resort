import {
    EyeIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { Booking, Room } from '../lib/supabase'
import { api } from '../lib/supabase'

interface CombinedBooking {
  id: string;
  guestName: string;
  email?: string;
  phone?: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests?: number;
  status: string;
  paymentStatus: string;
  totalAmount?: number;
  roomName: string;
  source: 'Website';
  special_requests?: string;
  originalBooking?: Booking; // For website bookings
  payment_gateway?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  bookingDate?: string; // When the booking was created
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [combinedBookings, setCombinedBookings] = useState<CombinedBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<CombinedBooking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<CombinedBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    check_in_date: '',
    check_out_date: '',
    num_guests: 1,
    booking_status: 'pending' as const,
    payment_status: 'pending' as const,
    special_requests: '',
    total_amount: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    combineBookings()
  }, [bookings, rooms])

  useEffect(() => {
    filterBookings()
  }, [combinedBookings, searchTerm, statusFilter, sourceFilter])

  // Sync formData when selectedBooking changes
  useEffect(() => {
    if (selectedBooking?.originalBooking) {
      setFormData({
        first_name: selectedBooking.originalBooking.first_name,
        last_name: selectedBooking.originalBooking.last_name,
        email: selectedBooking.originalBooking.email,
        phone: selectedBooking.originalBooking.phone,
        check_in_date: selectedBooking.originalBooking.check_in_date,
        check_out_date: selectedBooking.originalBooking.check_out_date,
        num_guests: selectedBooking.originalBooking.num_guests,
        booking_status: selectedBooking.originalBooking.booking_status,
        payment_status: selectedBooking.originalBooking.payment_status,
        special_requests: selectedBooking.originalBooking.special_requests || '',
        total_amount: selectedBooking.originalBooking.total_amount
      })
    }
  }, [selectedBooking])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Optimized: Load data with better error handling and caching
      const loadBookings = async () => {
        try {
          const result = await api.getBookings()
          return result || []
        } catch (error) {
          if (error.message?.includes('column "booking_source" does not exist')) {
            toast.error('Database migration needed. Please run the migration first.')
          }
          return []
        }
      }
      
      const loadRooms = async () => {
        try {
          const result = await api.getRooms()
          return result || []
        } catch (error) {
          return []
        }
      }
      
      // Load data in parallel with individual timeouts
      const [bookingsData, roomsData] = await Promise.all([
        Promise.race([
          loadBookings(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Bookings timeout')), 10000))
        ]),
        Promise.race([
          loadRooms(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Rooms timeout')), 10000))
        ])
      ])
      
      if (bookingsData && bookingsData.length > 0) {
      }
      
      setBookings(bookingsData)
      setRooms(roomsData)
      
    } catch (error) {
      toast.error('Failed to load bookings data')
      setBookings([])
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const combineBookings = () => {
    const combined: CombinedBooking[] = []
    
    // Add website bookings
    bookings.forEach(booking => {
      const room = rooms.find(r => r.id === booking.room_id)
      combined.push({
        id: `website-${booking.id}`,
        guestName: `${booking.first_name} ${booking.last_name}`,
        email: booking.email && !booking.email.startsWith('guest-') ? booking.email : null,
        phone: booking.phone,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        numGuests: booking.num_guests,
        status: booking.booking_status,
        paymentStatus: booking.payment_status,
        totalAmount: booking.total_amount,
        roomName: room ? room.name : 'Unknown Room',
        source: 'Website',
        special_requests: booking.special_requests,
        originalBooking: booking,
        payment_gateway: booking.payment_gateway,
        razorpay_order_id: booking.razorpay_order_id,
        razorpay_payment_id: booking.razorpay_payment_id,
        bookingDate: booking.created_at
      })
    })
    
    // Sort by booking date (newest first)
    combined.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
    
    setCombinedBookings(combined)
  }

  const filterBookings = () => {
    let filtered = combinedBookings

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.roomName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(booking => booking.source === sourceFilter)
    }

    setFilteredBookings(filtered)
  }

  const openModal = (booking: CombinedBooking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedBooking(null)
  }

  const handleSave = async (updatedBooking: CombinedBooking) => {
    try {
      if (updatedBooking.source === 'Website' && updatedBooking.originalBooking?.id) {
        // Store original booking status for comparison
        const originalStatus = updatedBooking.originalBooking.booking_status
        
        // Create a new booking object with updated form data
        const updatedBookingData = {
          ...updatedBooking.originalBooking,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
          num_guests: formData.num_guests,
          booking_status: formData.booking_status,
          payment_status: formData.payment_status,
          special_requests: formData.special_requests,
          total_amount: formData.total_amount
        }
        
        // Update the booking
        const updatedBookingResult = await api.updateBooking(updatedBooking.originalBooking.id, updatedBookingData)
        
        // Check if status changed to confirmed and send email notification
        if (originalStatus !== 'confirmed' && formData.booking_status === 'confirmed') {
          
          try {
            // Find the room for this booking
            const room = rooms.find(r => r.id === updatedBooking.originalBooking?.room_id)
            if (room) {
              const { EmailService } = await import('../lib/email-service')
              const emailResult = await EmailService.sendBookingConfirmation(updatedBookingResult, room)
              
              if (emailResult.success) {
                toast.success('Booking confirmed and notification emails sent!')
              } else {
                toast.error('Booking confirmed but email notification failed.')
              }
            } else {
              toast.success('Booking updated successfully')
            }
          } catch (emailError) {
            toast.error('Booking confirmed but email notification failed.')
          }
        } 
        // Check if status changed to cancelled and send email notification
        else if (originalStatus !== 'cancelled' && formData.booking_status === 'cancelled') {
          
          try {
            // Find the room for this booking
            const room = rooms.find(r => r.id === updatedBooking.originalBooking?.room_id)
            if (room) {
              const { EmailService } = await import('../lib/email-service')
              const emailResult = await EmailService.sendBookingCancellation(updatedBookingResult, room)
              
              if (emailResult.success) {
                toast.success('Booking cancelled and notification emails sent!')
              } else {
                toast.error('Booking cancelled but email notification failed.')
              }
            } else {
              toast.success('Booking updated successfully')
            }
          } catch (emailError) {
            toast.error('Booking cancelled but email notification failed.')
          }
        } else {
          toast.success('Booking updated successfully')
        }
      }
      setIsModalOpen(false)
      setSelectedBooking(null)
      loadData()
    } catch (error) {
      toast.error('Failed to update booking')
    }
  }

  const handleDelete = async (bookingId: number) => {
    try {
      await api.deleteBooking(bookingId)
      toast.success('Booking deleted successfully')
      setIsModalOpen(false)
      setSelectedBooking(null)
      loadData()
    } catch (error) {
      toast.error('Failed to delete booking')
    }
  }

  // Bulk delete functions
  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([])
      setSelectAll(false)
    } else {
      setSelectedBookings(filteredBookings.map(booking => booking.id))
      setSelectAll(true)
    }
  }

  const handleBulkDelete = async () => {
    try {
      
      const websiteBookings = selectedBookings.filter(id => id.startsWith('website-'))
      
      
      let deletedCount = 0
      
      // Delete website bookings
      const bookingIds = websiteBookings.map(id => parseInt(id.replace('website-', '')))
      
      for (const id of bookingIds) {
        if (!isNaN(id)) {
          await api.deleteBooking(id)
          deletedCount++
        }
      }
      
      const message = deletedCount > 0 
        ? `Deleted ${deletedCount} website bookings successfully`
        : 'No bookings were processed'
      
      toast.success(message)
      setSelectedBookings([])
      loadData()
    } catch (error) {
      toast.error('Failed to delete bookings')
    }
  }

  // Update select all when filtered bookings change
  useEffect(() => {
    if (filteredBookings.length > 0 && selectedBookings.length === filteredBookings.length) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }, [filteredBookings, selectedBookings])

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'refunded':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading bookings...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600 mt-1">Manage customer bookings and reservations</p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedBookings.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedBookings.length})
                  </button>
                </div>
              )}
              <button
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="all">All Sources</option>
            <option value="Website">Website</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <span className="font-medium">{filteredBookings.length}</span> 
            <span className="ml-1">of {combinedBookings.length} bookings</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                      <p className="text-gray-500">No bookings match your current filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={() => handleSelectBooking(booking.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.guestName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Room: {booking.roomName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{booking.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.numGuests} guest{booking.numGuests !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={getStatusBadge(booking.status)}>
                            {booking.status}
                          </span>
                          <br />
                          <span className={getPaymentStatusBadge(booking.paymentStatus)}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{booking.totalAmount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(booking)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {booking.source === 'Website' && booking.originalBooking && (
                            <>
                              <button
                                onClick={() => openModal(booking)}
                                className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100 transition-colors duration-200"
                                title="Edit Booking"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => booking.originalBooking && handleDelete(booking.originalBooking.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                                title="Delete Booking"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedBooking.source === 'Website' ? 'Edit Booking' : 'Booking Details'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                {selectedBooking.source === 'Website' ? (
                  /* Edit Mode */
                  <div key={selectedBooking.id} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={selectedBooking.originalBooking?.first_name || ''}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={selectedBooking.originalBooking?.last_name || ''}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={selectedBooking.originalBooking?.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={selectedBooking.originalBooking?.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                      <input
                        type="date"
                        value={selectedBooking.originalBooking?.check_in_date || ''}
                        onChange={(e) => setFormData({...formData, check_in_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                      <input
                        type="date"
                        value={selectedBooking.originalBooking?.check_out_date || ''}
                        onChange={(e) => setFormData({...formData, check_out_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                      <input
                        type="number"
                        min="1"
                        value={selectedBooking.originalBooking?.num_guests || 1}
                        onChange={(e) => setFormData({...formData, num_guests: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹)</label>
                      <input
                        type="number"
                        value={selectedBooking.originalBooking?.total_amount || 0}
                        onChange={(e) => setFormData({...formData, total_amount: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Booking Status</label>
                      <select
                        value={selectedBooking.originalBooking?.booking_status || 'pending'}
                        onChange={(e) => setFormData({...formData, booking_status: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                      <select
                        value={selectedBooking.originalBooking?.payment_status || 'pending'}
                        onChange={(e) => setFormData({...formData, payment_status: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                      <textarea
                        rows={3}
                        value={selectedBooking.originalBooking?.special_requests || ''}
                        onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any special requests or notes..."
                      />
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedBooking.guestName}</p>
                        <p><span className="font-medium">Email:</span> {selectedBooking.email || 'N/A'}</p>
                        <p><span className="font-medium">Phone:</span> {selectedBooking.phone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Booking Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Room:</span> {selectedBooking.roomName}</p>
                        <p><span className="font-medium">Check-in:</span> {new Date(selectedBooking.checkInDate).toLocaleDateString()}</p>
                        <p><span className="font-medium">Check-out:</span> {new Date(selectedBooking.checkOutDate).toLocaleDateString()}</p>
                        <p><span className="font-medium">Guests:</span> {selectedBooking.numGuests || 1}</p>
                        <p><span className="font-medium">Total Amount:</span> ₹{selectedBooking.totalAmount?.toLocaleString() || '0'}</p>
                        <p><span className="font-medium">Booking Date:</span> {selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString() + ' ' + new Date(selectedBooking.bookingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Status & Payment</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Booking Status:</span>
                          <span className={getStatusBadge(selectedBooking.status)}>
                            {selectedBooking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Payment Status:</span>
                          <span className={getPaymentStatusBadge(selectedBooking.paymentStatus)}>
                            {selectedBooking.paymentStatus}
                          </span>
                        </div>
                        {selectedBooking.payment_gateway && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Payment Gateway:</span>
                            <span className="text-sm text-gray-600">{selectedBooking.payment_gateway}</span>
                          </div>
                        )}
                        {selectedBooking.razorpay_payment_id && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Payment ID:</span>
                            <span className="text-sm text-gray-600">{selectedBooking.razorpay_payment_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedBooking.special_requests && (
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Special Requests</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedBooking.special_requests}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {selectedBooking.source === 'Website' ? 'Cancel' : 'Close'}
                </button>
                {selectedBooking.source === 'Website' && (
                  <button
                    onClick={() => handleSave(selectedBooking)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookings 
