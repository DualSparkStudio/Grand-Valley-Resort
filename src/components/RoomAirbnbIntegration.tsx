import { ArrowPathIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { clearAirbnbDataCache, getAirbnbBookings } from '../lib/airbnb-integration';
import type { Room } from '../lib/supabase';
import { api } from '../lib/supabase';
import { airbnbApi } from '../services/airbnbApi';

interface RoomAirbnbConfig {
  id: number;
  room_id: number;
  ical_url: string;
  room_name: string;
  last_sync?: string;
  booking_count?: number;
}

interface RoomAirbnbIntegrationProps {
  rooms: Room[];
  onConfigChange?: () => void;
  onRefresh?: () => void;
}

const RoomAirbnbIntegration: React.FC<RoomAirbnbIntegrationProps> = ({
  rooms,
  onConfigChange,
  onRefresh
}) => {
  const [configs, setConfigs] = useState<RoomAirbnbConfig[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [newConfig, setNewConfig] = useState({
    room_id: '',
    ical_url: ''
  });
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadConfigs();
    checkDatabaseSchema();
  }, []);

  const checkDatabaseSchema = async () => {
    try {
      // Try to get bookings with booking_source filter to check if the column exists
      const { data: bookings, error } = await api.getBookings();
      
      if (error) {
        toast.error('Database schema needs to be updated. Please run the migration.');
      }
    } catch (error) {
    }
  };

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const settings = await api.getCalendarSettings();
      
      // Get booking counts from database
      const { data: bookings } = await api.getBookings();
      
      const roomConfigs: RoomAirbnbConfig[] = [];
      
      settings.forEach(setting => {
        // Only process settings that are actual iCal URLs, not sync timestamps, and have non-empty values
        if (setting.setting_key.startsWith('airbnb_room_') && 
            !setting.setting_key.includes('_last_sync') && 
            setting.setting_value && 
            setting.setting_value.trim() !== '') {
          const roomId = parseInt(setting.setting_key.replace('airbnb_room_', ''));
          const room = rooms.find(r => r.id === roomId);
          if (room) {
            // Count Airbnb bookings for this room
            const roomBookings = bookings?.filter(b => b.room_id === roomId && b.booking_source === 'airbnb') || [];
            
            roomConfigs.push({
              id: roomId,
              room_id: roomId,
              ical_url: setting.setting_value,
              room_name: room.name,
              last_sync: setting.updated_at,
              booking_count: roomBookings.length
            });
          }
        }
      });
      setConfigs(roomConfigs);
      
      // Check for configurations that haven't been synced yet
      await checkAndSyncUnsyncedConfigs(roomConfigs);
    } catch (error) {
      toast.error('Failed to load room configurations');
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAndSyncUnsyncedConfigs = async (configs: RoomAirbnbConfig[]) => {
    try {
      for (const config of configs) {
        // Check if this configuration has been synced (has last_sync timestamp)
        const lastSyncSetting = await api.getCalendarSettings();
        const hasLastSync = lastSyncSetting.some(s => 
          s.setting_key === `airbnb_room_${config.room_id}_last_sync` && 
          s.setting_value && 
          s.setting_value.trim() !== ''
        );
        
        if (!hasLastSync && config.booking_count === 0) {
          try {
            await airbnbApi.syncRoomBookings(config.room_id, config.ical_url);
            await api.updateCalendarSetting(`airbnb_room_${config.room_id}_last_sync`, new Date().toISOString());
          } catch (error) {
          }
        }
      }
    } catch (error) {
    }
  };

  const handleAddConfig = async () => {
    if (!newConfig.room_id || !newConfig.ical_url.trim()) {
      toast.error('Please select a room and enter the iCal URL');
      return;
    }

    try {
      setLoading(true);
      const roomId = parseInt(newConfig.room_id);
      const room = rooms.find(r => r.id === roomId);
      
      if (!room) {
        toast.error('Selected room not found');
        return;
      }

      // Check if database migration has been run
      try {
        const { data: testBookings, error: testError } = await api.getBookings();
        if (testError && testError.message?.includes('column "booking_source" does not exist')) {
          toast.error('Database migration needed. Please run the migration first.');
          return;
        }
      } catch (error) {
        toast.error('Database error. Please check your database connection.');
        return;
      }

      // Test the iCal URL and get initial bookings
      const testBookings = await getAirbnbBookings(newConfig.ical_url.trim());
      
      // Save the configuration
      await api.updateCalendarSetting(`airbnb_room_${roomId}`, newConfig.ical_url.trim());
      
      // Automatically sync and store the bookings
      await airbnbApi.syncRoomBookings(roomId, newConfig.ical_url.trim());
      
      // Update last sync time
      await api.updateCalendarSetting(`airbnb_room_${roomId}_last_sync`, new Date().toISOString());
      
      toast.success(`Airbnb calendar configured for ${room.name} and ${testBookings.length} bookings synced`);
      
      // Reset form and update UI immediately
      setNewConfig({ room_id: '', ical_url: '' });
      
      // Clear cache to ensure fresh data
      clearAirbnbDataCache();
      
      // Update configs immediately without reloading
      setConfigs(prev => [...prev, {
        id: Date.now(), // Temporary ID
        room_id: roomId,
        ical_url: newConfig.ical_url.trim(),
        room_name: room.name,
        last_sync: new Date().toISOString(),
        booking_count: testBookings.length
      }]);
      
      onConfigChange?.();
      
    } catch (error) {
      toast.error('Failed to configure Airbnb calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConfig = async (roomId: number) => {
    try {
      setLoading(true);
      
      // Optimized: Perform all operations in parallel for better performance
      const operations = [
        // Remove the iCal URL configuration
        api.updateCalendarSetting(`airbnb_room_${roomId}`, ''),
        // Remove the last sync timestamp
        api.updateCalendarSetting(`airbnb_room_${roomId}_last_sync`, ''),
        // Delete Airbnb bookings for this room (with timeout)
        Promise.race([
          api.deleteAirbnbBookingsForRoom(roomId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Delete timeout')), 3000))
        ]).catch(error => {
          // Continue with the operation even if deletion fails
        })
      ];
      
      // Execute all operations in parallel
      await Promise.all(operations);
      
      toast.success('Airbnb calendar removed successfully');
      
      // Optimized: Update UI immediately without reloading all configs
      setConfigs(prev => prev.filter(c => c.room_id !== roomId));
      
      // Clear cache to ensure fresh data on next load
      clearAirbnbDataCache();
      
      onConfigChange?.();
      
    } catch (error) {
      toast.error('Failed to remove configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSync = async (roomId: number) => {
    try {
      const config = configs.find(c => c.room_id === roomId);
      if (!config || !config.ical_url) {
        toast.error('No iCal URL configured for this room');
        return;
      }

      // Get current booking count before sync
      const { data: bookingsBefore } = await api.getBookings();
      const airbnbBookingsBefore = bookingsBefore?.filter(b => b.room_id === roomId && b.booking_source === 'airbnb') || [];

      // Sync bookings to database
      await airbnbApi.syncRoomBookings(roomId, config.ical_url);
      
      // Update last sync time
      await api.updateCalendarSetting(`airbnb_room_${roomId}_last_sync`, new Date().toISOString());
      
      // Get the updated booking count from database
      const { data: bookingsAfter } = await api.getBookings();
      const roomBookings = bookingsAfter?.filter(b => b.room_id === roomId && b.booking_source === 'airbnb') || [];
      
      // Update the config with new sync time and booking count
      setConfigs(prev => prev.map(c => 
        c.room_id === roomId 
          ? { ...c, last_sync: new Date().toISOString(), booking_count: roomBookings.length }
          : c
      ));
      
      const newBookings = roomBookings.length - airbnbBookingsBefore.length;
      if (newBookings > 0) {
        toast.success(`Synced! Found ${newBookings} new Airbnb bookings for ${config.room_name}`);
      } else {
        toast.success(`Synced! No new bookings found for ${config.room_name}`);
      }
      
      if (onConfigChange) {
        onConfigChange();
      }
      
      // Trigger refresh to update calendar
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error('Failed to refresh sync');
    }
  };

  const handleRefreshAll = async () => {
    try {
      setLoading(true);
      let totalNewBookings = 0;
      let totalExistingBookings = 0;
      
      for (const config of configs) {
        try {
          // Get current booking count before sync
          const { data: bookingsBefore } = await api.getBookings();
          const airbnbBookingsBefore = bookingsBefore?.filter(b => b.room_id === config.room_id && b.booking_source === 'airbnb') || [];
          
          // Sync bookings to database
          await airbnbApi.syncRoomBookings(config.room_id, config.ical_url);
          
          // Update last sync time
          await api.updateCalendarSetting(`airbnb_room_${config.room_id}_last_sync`, new Date().toISOString());
          
          // Get the updated booking count from database
          const { data: bookingsAfter } = await api.getBookings();
          const roomBookings = bookingsAfter?.filter(b => b.room_id === config.room_id && b.booking_source === 'airbnb') || [];
          
          const newBookings = roomBookings.length - airbnbBookingsBefore.length;
          totalNewBookings += newBookings;
          totalExistingBookings += roomBookings.length;
          
        } catch (error) {
        }
      }
      
      if (totalNewBookings > 0) {
        toast.success(`Synced ${totalNewBookings} new Airbnb bookings across all rooms`);
      } else {
        toast.success(`Sync completed. No new bookings found.`);
      }
      
      await loadConfigs();
      onConfigChange?.();
      
      // Trigger refresh to update calendar
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      toast.error('Failed to refresh all Airbnb data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🏠 Room-Specific Airbnb Integration
        </h3>
        <p className="text-sm text-gray-600">
          Configure individual Airbnb calendar links for each room
        </p>
      </div>



        {/* How to Get Airbnb Calendar Link Guide */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="text-sm font-medium text-blue-900 mb-2 hover:text-blue-700 flex items-center"
              >
                How to Get Your Airbnb Calendar Link
                <svg 
                  className={`ml-2 h-4 w-4 transition-transform ${showGuide ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showGuide && (
                <div className="text-sm text-blue-800 space-y-2">
                  <p className="font-medium">📱 From Airbnb Mobile App:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open the Airbnb app on your phone</li>
                    <li>Go to your <strong>Host Dashboard</strong></li>
                    <li>Select the <strong>property/room</strong> you want to sync</li>
                    <li>Tap on <strong>"Calendar"</strong> or <strong>"Availability"</strong></li>
                    <li>Look for <strong>"Export Calendar"</strong> or <strong>"Calendar Settings"</strong></li>
                    <li>Tap <strong>"Export Calendar"</strong> or <strong>"iCal"</strong></li>
                    <li>Copy the <strong>iCal URL</strong> (starts with <code className="bg-blue-100 px-1 rounded text-xs">https://www.airbnb.com/calendar/ical/</code>)</li>
                  </ol>
                  <p className="font-medium mt-3">💻 From Airbnb Website:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to <a href="https://www.airbnb.com/hosting/reservations" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">airbnb.com/hosting/reservations</a></li>
                    <li>Select your <strong>property</strong></li>
                    <li>Click <strong>"Calendar"</strong> in the left sidebar</li>
                    <li>Click <strong>"Export Calendar"</strong></li>
                    <li>Copy the <strong>iCal URL</strong></li>
                  </ol>
                  <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                    <strong>💡 Tip:</strong> The iCal URL should look like: <code className="bg-white px-1 rounded">https://www.airbnb.com/calendar/ical/123456789.ics?s=abc123&locale=en-GB</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add New Room Configuration */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Room Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={newConfig.room_id}
            onChange={(e) => setNewConfig({ ...newConfig, room_id: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">Select Room</option>
            {rooms && rooms.length > 0 ? (
              rooms
                .filter(room => !configs.find(c => c.room_id === room.id))
                .map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))
            ) : (
              <option value="" disabled>No rooms available</option>
            )}
          </select>
          
          <input
            type="url"
            value={newConfig.ical_url}
            onChange={(e) => setNewConfig({ ...newConfig, ical_url: e.target.value })}
            placeholder="Airbnb iCal URL"
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
          
          <button
            onClick={handleAddConfig}
            disabled={loading || !newConfig.room_id || !newConfig.ical_url.trim()}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Configuration
          </button>
        </div>
      </div>

      {/* Sync All Button */}
      {configs.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleRefreshAll}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Sync All Airbnb Bookings
          </button>
        </div>
      )}

      {/* Existing Configurations */}
      <div className="space-y-4">
        {configs.map(config => (
          <div key={config.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{config.room_name}</h4>
                <p className="text-sm text-gray-500 truncate hidden">{config.ical_url}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRefreshSync(config.room_id)}
                  disabled={loading}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                  title="Sync Airbnb bookings to database"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRemoveConfig(config.room_id)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                  title="Remove configuration"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              {config.last_sync && (
                <span>Last synced: {new Date(config.last_sync).toLocaleString()}</span>
              )}
              {config.booking_count !== undefined && (
                <span className="text-blue-600 font-medium">
                  {config.booking_count} Airbnb bookings
                </span>
              )}
            </div>
          </div>
        ))}
        
        {configs.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No room configurations found. Add your first room configuration above.
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomAirbnbIntegration; 
