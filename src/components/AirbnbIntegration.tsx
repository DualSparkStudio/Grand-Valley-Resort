import {
    CheckCircleIcon,
    ClockIcon,
    CloudArrowDownIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../lib/supabase';
import { airbnbApi, type AirbnbBooking } from '../services/airbnbApi';
import ForceSyncButton from './ForceSyncButton';
import QuickUnblockButton from './QuickUnblockButton';

interface AirbnbIntegrationProps {
  roomId?: number;
  onBookingsUpdate?: (bookings: AirbnbBooking[]) => void;
  onRefresh?: () => void;
  className?: string;
}

interface SyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  error: string | null;
  bookingCount: number;
  isDemoData: boolean;
}

const AirbnbIntegration: React.FC<AirbnbIntegrationProps> = ({
  roomId,
  onBookingsUpdate,
  onRefresh,
  className = ''
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: null,
    error: null,
    bookingCount: 0,
    isDemoData: false
  });
  const [isApiHealthy, setIsApiHealthy] = useState<boolean | null>(null);

  // Check API health on component mount
  // Note: Auto-sync initialization is handled at app root level (AutoSyncInitializer)
  useEffect(() => {
    checkApiHealth();
    // Note: Auto-sync is now initialized globally at app root, not here
    // This prevents multiple initializations and ensures it runs regardless of page
  }, []);

  const checkApiHealth = async () => {
    try {
      const healthy = await airbnbApi.checkHealth();
      setIsApiHealthy(healthy);
      
      if (!healthy) {
        setSyncStatus(prev => ({
          ...prev,
          error: 'Airbnb API is not available'
        }));
      }
    } catch (error) {
      setIsApiHealthy(false);
      setSyncStatus(prev => ({
        ...prev,
        error: 'Cannot connect to Airbnb API'
      }));
    }
  };

  const syncAirbnbBookings = async () => {
    if (syncStatus.isSyncing) {
      toast.success('Sync already in progress...');
      return;
    }

    setSyncStatus(prev => ({
      ...prev,
      isSyncing: true,
      error: null
    }));

    try {
      
      // Step 1: Check API health
      await checkApiHealth();
      
      // Step 2: Sync bookings to database
      if (roomId) {
        await airbnbApi.syncRoomBookings(roomId);
      } else {
        // Sync all rooms
        const rooms = await api.getRooms();
        for (const room of rooms) {
          await airbnbApi.syncRoomBookings(room.id);
        }
      }
      
      // Step 3: Fetch the synced bookings to display
      const options = roomId ? { roomId, forceSync: false } : { forceSync: false };
      const bookings = await airbnbApi.fetchAirbnbBookings(options);
      
      // Check if we're using demo data (real bookings have 'airbnb_' prefix, demo has 'demo' prefix)
      const isDemoData = bookings.some(booking => booking.id.includes('demo'));
      const isRealData = bookings.some(booking => booking.id.includes('airbnb_'));
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        bookingCount: bookings.length,
        error: null,
        isDemoData: isDemoData && !isRealData // Only demo if no real data found
      }));

      // Notify parent component about new bookings
      if (onBookingsUpdate) {
        onBookingsUpdate(bookings);
      }

      // Trigger refresh to update calendar
      if (onRefresh) {
        onRefresh();
      }

      // Step 4: Show appropriate success message
      if (isDemoData && !isRealData) {
        toast.success(`⚠️ Using demo data: ${bookings.length} Airbnb bookings (API unavailable)`);
      } else if (isRealData) {
        toast.success(`✅ Successfully synced ${bookings.length} real Airbnb bookings to database!`);
      } else {
        toast.success(`✅ Successfully synced ${bookings.length} Airbnb bookings to database!`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: errorMessage,
        isDemoData: false
      }));

      toast.error(`❌ Sync failed: ${errorMessage}`);
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    
    if (syncStatus.error) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
    
    if (syncStatus.lastSync) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    
    return <CloudArrowDownIcon className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing...';
    }
    
    if (syncStatus.error) {
      return 'Sync failed';
    }
    
    if (syncStatus.lastSync) {
      return `Last sync: ${syncStatus.lastSync.toLocaleTimeString()}`;
    }
    
    return 'Not synced';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Airbnb Integration</h3>
            <p className="text-sm text-gray-500">
              {roomId ? `Room ${roomId} Airbnb bookings` : 'All Airbnb bookings'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm text-gray-600">{getStatusText()}</span>
        </div>
      </div>

      {/* API Health Status */}
      {isApiHealthy === false && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">
              Airbnb API is not available. Please ensure the backend server is running.
            </span>
          </div>
        </div>
      )}

      {/* Sync Status */}
      {syncStatus.lastSync && (
        <div className={`mb-4 p-3 border rounded-md ${
          syncStatus.isDemoData 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {syncStatus.isDemoData ? (
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              )}
              <span className={`text-sm ${
                syncStatus.isDemoData ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {syncStatus.isDemoData 
                  ? `${syncStatus.bookingCount} comprehensive demo Airbnb bookings loaded`
                  : `${syncStatus.bookingCount} comprehensive Airbnb bookings synced`
                }
              </span>
            </div>
            <span className={`text-xs ${
              syncStatus.isDemoData ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {syncStatus.lastSync.toLocaleDateString()}
            </span>
          </div>
          {syncStatus.isDemoData && (
            <div className="mt-2 text-xs text-yellow-600">
              ⚠️ Real Airbnb API is unavailable. Using comprehensive demo data for testing.
            </div>
          )}
          <div className="mt-2 text-xs text-gray-600">
            📊 Includes historical and current bookings with detailed status tracking
          </div>
        </div>
      )}

      {/* Error Display */}
      {syncStatus.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{syncStatus.error}</span>
          </div>
        </div>
      )}

      {/* Quick Unblock Tool */}
      <QuickUnblockButton onRefresh={onRefresh} />

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={syncAirbnbBookings}
          disabled={syncStatus.isSyncing}
          className={`
            flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
            ${syncStatus.isSyncing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800'
            }
          `}
        >
          {syncStatus.isSyncing ? (
            <ClockIcon className="h-5 w-5 animate-spin" />
          ) : (
            <CloudArrowDownIcon className="h-5 w-5" />
          )}
          <span className="font-semibold">
            {syncStatus.isSyncing ? 'Syncing...' : 'Sync Airbnb'}
          </span>
        </button>
        
        <ForceSyncButton onRefresh={onRefresh} />
      </div>

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          • <strong>Sync Airbnb:</strong> Comprehensive sync process - fetches ALL historical and current Airbnb bookings
        </p>
        <p>
          • <strong>Data Includes:</strong> Confirmed, cancelled, and pending bookings from all configured calendar URLs
        </p>
        <p>
          • <strong>Historical Data:</strong> Past bookings are preserved and displayed for complete booking history
        </p>
        <p>
          • <strong>Visual Indicators:</strong> Different colors for confirmed (red), cancelled (gray), and pending (amber) bookings
        </p>
        <p>
          • Bookings appear on your calendar and are read-only (cannot be modified)
        </p>
        <p>
          • Sync runs automatically every 2 minutes or manually via this button
        </p>
      </div>
    </div>
  );
};

export default AirbnbIntegration; 
