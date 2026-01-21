import React from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../lib/supabase';

interface BlockedDateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedDate: {
    id: number;
    room_id: number;
    start_date: string;
    end_date: string;
    reason: string;
    notes?: string;
    source: string;
    roomName?: string;
  } | null;
  onUnblockSuccess?: () => void;
}

const BlockedDateDetailsModal: React.FC<BlockedDateDetailsModalProps> = ({
  isOpen,
  onClose,
  blockedDate,
  onUnblockSuccess
}) => {
  if (!isOpen || !blockedDate) return null;

  const handleUnblock = async () => {
    try {
      
      await api.deleteBlockedDate(blockedDate.id);
      
      toast.success('Dates unblocked successfully');
      onUnblockSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to unblock dates');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSourceDisplay = (source: string) => {
    switch (source) {
      case 'manual':
        return 'Manual (Admin Panel)';
      case 'airbnb_blocked':
        return 'Airbnb';
      default:
        return source;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'manual':
        return '🔧';
      case 'airbnb_blocked':
        return '🏠';
      default:
        return '📅';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="mr-2">🚫</span>
              Blocked Date Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <span className="mr-2">{getSourceIcon(blockedDate.source)}</span>
                <span className="text-sm text-gray-900">{getSourceDisplay(blockedDate.source)}</span>
              </div>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <div className="p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-900">{blockedDate.roomName || 'Unknown Room'}</span>
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blocked Dates
              </label>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-600">From:</span>
                  <span className="text-sm text-gray-900 ml-2">{formatDate(blockedDate.start_date)}</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-600">To:</span>
                  <span className="text-sm text-gray-900 ml-2">{formatDate(blockedDate.end_date)}</span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <div className="p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-900">{blockedDate.reason || 'No reason specified'}</span>
              </div>
            </div>

            {/* Notes */}
            {blockedDate.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <div className="p-2 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-900">{blockedDate.notes}</span>
                </div>
              </div>
            )}

            {/* Warning for Airbnb blocked dates */}
            {blockedDate.source === 'airbnb_blocked' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Airbnb Blocked:</strong> This date was blocked in Airbnb and cannot be unblocked from here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
            {blockedDate.source === 'manual' && (
              <button
                type="button"
                onClick={handleUnblock}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Unblock Dates
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedDateDetailsModal;
