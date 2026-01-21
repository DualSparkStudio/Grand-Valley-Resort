import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { airbnbApi } from '../services/airbnbApi';

interface QuickUnblockButtonProps {
  onRefresh?: () => void;
}

const QuickUnblockButton: React.FC<QuickUnblockButtonProps> = ({ onRefresh }) => {
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [targetDate, setTargetDate] = useState('');

  const handleQuickUnblock = async () => {
    if (!targetDate) {
      toast.error('Please enter a date to unblock');
      return;
    }

    try {
      setIsUnblocking(true);
      
      console.log(`🔓 Quick unblocking date: ${targetDate}`);
      toast.loading(`Quick unblocking ${targetDate}...`);
      
      // Get all rooms
      const syncs = await airbnbApi.getSyncConfigurations();
      let totalUnblocked = 0;
      
      for (const sync of syncs) {
        console.log(`🔍 Checking room ${sync.roomId} for date ${targetDate}`);
        const success = await airbnbApi.manualUnblockDate(sync.roomId, targetDate, targetDate);
        if (success) {
          totalUnblocked++;
        }
      }
      
      // Trigger refresh
      if (onRefresh) {
        onRefresh();
      }
      
      if (totalUnblocked > 0) {
        toast.success(`🎉 Quick unblocked ${totalUnblocked} room(s) for ${targetDate}`);
        console.log(`🎉 Quick unblock completed: ${totalUnblocked} rooms unblocked`);
      } else {
        toast.success(`✅ No blocked dates found for ${targetDate}`);
        console.log(`✅ No blocked dates found for ${targetDate}`);
      }
      
    } catch (error) {
      console.error('❌ Quick unblock failed:', error);
      toast.error('❌ Quick unblock failed. Check console for details.');
    } finally {
      setIsUnblocking(false);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center space-x-3">
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          placeholder="Select date to unblock"
        />
        
        <button
          onClick={handleQuickUnblock}
          disabled={isUnblocking || !targetDate}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm
            ${isUnblocking || !targetDate
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800'
            }
          `}
        >
          {isUnblocking ? (
            <>
              <span className="animate-spin mr-2">🔓</span>
              Quick Unblocking...
            </>
          ) : (
            <>
              🔓 Quick Unblock
            </>
          )}
        </button>
      </div>
      
      <div className="mt-2 text-xs text-green-700">
        <p><strong>⚡ Instant:</strong> Immediately removes blocked dates without waiting for iCal sync</p>
      </div>
    </div>
  );
};

export default QuickUnblockButton;
