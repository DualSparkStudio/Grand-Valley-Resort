import { useEffect } from 'react';
import { airbnbApi } from '../services/airbnbApi';

/**
 * Root-level component that initializes Airbnb auto-sync when the app loads.
 * This ensures auto-sync runs regardless of which page the user is on.
 * 
 * This component should be placed at the root level in App.tsx so it always mounts.
 */
const AutoSyncInitializer: React.FC = () => {
  useEffect(() => {
    // Small delay to ensure app is fully loaded
    const initTimer = setTimeout(() => {
      airbnbApi.initializeAutoSync().catch(() => {
        // Silent fail - auto-sync will retry on next page interaction if needed
      });
    }, 1000); // 1 second delay to ensure everything is ready
    
    // Cleanup: Stop auto-sync when app unmounts (shouldn't happen in SPA, but good practice)
    return () => {
      clearTimeout(initTimer);
      airbnbApi.stopAutoSync();
    };
  }, []); // Empty dependency array - only run once on mount

  // This component doesn't render anything
  return null;
};

export default AutoSyncInitializer;

