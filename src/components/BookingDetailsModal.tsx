import { XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    booking?: any;
    room?: any;
    platform?: string;
    bookingStatus?: string;
    paymentStatus?: string;
    guestName?: string;
    numGuests?: number;
    phone?: string;
    email?: string;
    roomInfo?: string;
    totalAmount?: number;
  };
}

interface BookingDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  if (!isOpen || !event) return null;

  const isWebsiteBooking = true; // All bookings are from website now
  const booking = event.extendedProps.booking;
  const room = event.extendedProps.room;
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Not specified';
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                🌐
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Booking Details
                </h2>
                <p className="text-sm text-gray-500">
                  Website Booking • {event.extendedProps.bookingStatus}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Guest Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Guest Name</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {event.extendedProps.guestName || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {event.extendedProps.numGuests || 'Not specified'}
                  </p>
                </div>
                {event.extendedProps.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{event.extendedProps.phone}</p>
                  </div>
                )}
                {event.extendedProps.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{event.extendedProps.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Room Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Room Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {event.extendedProps.roomInfo || 'Not specified'}
                  </p>
                </div>
                {room?.check_in_time && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-in Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatTime(room.check_in_time)}
                    </p>
                  </div>
                )}
                {room?.check_out_time && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-out Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatTime(room.check_out_time)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Stay Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(event.start)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(event.end)}</p>
                </div>
              </div>
            </div>

            {/* Status and Payment */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking Status</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    getStatusColor(event.extendedProps.bookingStatus || '')
                  }`}>
                    {event.extendedProps.bookingStatus || 'Unknown'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    getPaymentStatusColor(event.extendedProps.paymentStatus || '')
                  }`}>
                    {event.extendedProps.paymentStatus || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount */}
            {(event.extendedProps.totalAmount || booking?.total_amount) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      ${(event.extendedProps.totalAmount || booking?.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                  {booking?.payment_gateway && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Gateway</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {booking.payment_gateway}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special Requests */}
            {booking?.special_requests && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Special Requests</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {booking.special_requests}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 
