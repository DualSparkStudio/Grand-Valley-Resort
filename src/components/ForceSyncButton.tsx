import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { airbnbApi } from '../services/airbnbApi';

interface ForceSyncButtonProps {
  roomId?: number;
  onRefresh?: () => void;
}

const ForceSyncButton: React.FC<ForceSyncButtonProps> = ({ roomId, onRefresh }) => {
  const [isForcing, setIsForcing] = useState(false);

  const handleForceSync = async () => {
    try {
      setIsForcing(true);
      
      console.log('🚀 Starting FORCE SYNC...');
      toast.loading('Force syncing... This may take a moment', { duration: 3000 });
      
      // Step 1: Try normal sync first
      console.log('📡 Step 1: Normal sync');
      if (roomId) {
        await airbnbApi.syncRoomBookings(roomId);
      } else {
        // Sync all rooms
        const syncs = await airbnbApi.getSyncConfigurations();
        for (const sync of syncs) {
          await airbnbApi.syncRoomBookings(sync.roomId);
        }
      }
      
      // Step 2: Ultra-fast retry (500ms delay)
      console.log('⚡ Step 2: Ultra-fast retry (500ms)...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (roomId) {
        await airbnbApi.syncRoomBookings(roomId);
      } else {
        const syncs = await airbnbApi.getSyncConfigurations();
        for (const sync of syncs) {
          await airbnbApi.syncRoomBookings(sync.roomId);
        }
      }
      
      // Step 3: Final retry (1 second delay)
      console.log('🎯 Step 3: Final retry (1s)...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (roomId) {
        await airbnbApi.syncRoomBookings(roomId);
      } else {
        const syncs = await airbnbApi.getSyncConfigurations();
        for (const sync of syncs) {
          await airbnbApi.syncRoomBookings(sync.roomId);
        }
      }
      
      // Step 4: Trigger refresh
      console.log('🔄 Step 4: Refreshing calendar');
      if (onRefresh) {
        onRefresh();
      }
      
      // Also trigger the registered refresh callback in airbnbApi
      if (airbnbApi.triggerUIRefresh) {
        airbnbApi.triggerUIRefresh();
      }
      
      toast.success('✅ Force sync completed! Check console for details.');
      console.log('🎉 Force sync completed successfully');
      
    } catch (error) {
      console.error('❌ Force sync failed:', error);
      toast.error('❌ Force sync failed. Check console for details.');
    } finally {
      setIsForcing(false);
    }
  };

  return (
    <button
      onClick={handleForceSync}
      disabled={isForcing}
      className={`
        px-4 py-2 rounded-md font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
        ${isForcing
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800'
        }
      `}
    >
      {isForcing ? (
        <>
          <span className="animate-spin mr-2">⚡</span>
          Force Syncing...
        </>
      ) : (
        <>
          ⚡ Force Sync
        </>
      )}
    </button>
  );
};

export default ForceSyncButton;
