/**
 * Auto-sync service for fetching Airbnb bookings and blocked dates every minute
 * and storing them in the database for display on room booking calendar
 */

import { airbnbApi } from './airbnbApi';

export interface AutoSyncConfig {
  isEnabled: boolean;
  intervalMinutes: number;
  lastSync: Date | null;
  nextSync: Date | null;
  totalBookingsSynced: number;
  totalBlockedDatesSynced: number;
  lastError: string | null;
}

class AutoSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private config: AutoSyncConfig = {
    isEnabled: false,
    intervalMinutes: 1,
    lastSync: null,
    nextSync: null,
    totalBookingsSynced: 0,
    totalBlockedDatesSynced: 0,
    lastError: null
  };
  private listeners: Array<(config: AutoSyncConfig) => void> = [];

  constructor() {
    this.loadConfigFromStorage();
  }

  /**
   * Start auto-sync with specified interval
   */
  public start(intervalMinutes: number = 1): void {
    if (this.syncInterval) {
      this.stop();
    }

    this.config.isEnabled = true;
    this.config.intervalMinutes = intervalMinutes;
    this.config.lastError = null;
    
    
    // Run first sync immediately
    this.performSync();
    
    // Set up interval for subsequent syncs
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMinutes * 60 * 1000);

    this.updateNextSyncTime();
    this.saveConfigToStorage();
    this.notifyListeners();
  }

  /**
   * Stop auto-sync
   */
  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.config.isEnabled = false;
    this.config.nextSync = null;
    
    this.saveConfigToStorage();
    this.notifyListeners();
  }

  /**
   * Perform manual sync
   */
  public async performManualSync(): Promise<{ bookings: number; blockedDates: number }> {
    return await this.performSync(true);
  }

  /**
   * Get current auto-sync configuration
   */
  public getConfig(): AutoSyncConfig {
    return { ...this.config };
  }

  /**
   * Add listener for config changes
   */
  public addListener(listener: (config: AutoSyncConfig) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  public removeListener(listener: (config: AutoSyncConfig) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Perform the actual sync operation
   */
  private async performSync(isManual: boolean = false): Promise<{ bookings: number; blockedDates: number }> {
    try {
      this.config.lastSync = new Date();
      this.config.lastError = null;
      

      // Get sync configurations (rooms with Airbnb iCal URLs)
      const syncConfigs = await airbnbApi.getSyncConfigurations();
      
      if (syncConfigs.length === 0) {
        this.config.lastError = 'No Airbnb integrations configured';
        this.saveConfigToStorage();
        this.notifyListeners();
        return { bookings: 0, blockedDates: 0 };
      }

      let totalBookings = 0;
      let totalBlockedDates = 0;

      // Sync each room's data
      for (const config of syncConfigs) {
        try {
          
          // Sync bookings for this room
          await airbnbApi.syncRoomBookings(config.roomId);
          
          // Sync blocked dates for this room
          await airbnbApi.syncRoomBlockedDates(config.roomId);
          
          // Get updated stats for this room
          const roomStats = await airbnbApi.getRoomSyncStats(config.roomId);
          totalBookings += roomStats.bookingsCount;
          totalBlockedDates += roomStats.blockedDatesCount;
          
          
        } catch (roomError) {
          this.config.lastError = `Room ${config.roomId}: ${roomError instanceof Error ? roomError.message : 'Unknown error'}`;
        }
      }

      // Update total counts
      this.config.totalBookingsSynced += totalBookings;
      this.config.totalBlockedDatesSynced += totalBlockedDates;
      
      
      // Update next sync time
      this.updateNextSyncTime();
      
      // Save config and notify listeners
      this.saveConfigToStorage();
      this.notifyListeners();

      return { bookings: totalBookings, blockedDates: totalBlockedDates };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.config.lastError = errorMessage;
      this.config.lastSync = new Date();
      
      this.saveConfigToStorage();
      this.notifyListeners();
      
      throw error;
    }
  }

  /**
   * Update next sync time based on current time and interval
   */
  private updateNextSyncTime(): void {
    if (this.config.isEnabled && this.config.lastSync) {
      this.config.nextSync = new Date(this.config.lastSync.getTime() + (this.config.intervalMinutes * 60 * 1000));
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfigToStorage(): void {
    try {
      localStorage.setItem('airbnb_auto_sync_config', JSON.stringify({
        ...this.config,
        lastSync: this.config.lastSync?.toISOString() || null,
        nextSync: this.config.nextSync?.toISOString() || null
      }));
    } catch (error) {
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfigFromStorage(): void {
    try {
      const stored = localStorage.getItem('airbnb_auto_sync_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = {
          ...parsed,
          lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null,
          nextSync: parsed.nextSync ? new Date(parsed.nextSync) : null
        };
      }
    } catch (error) {
    }
  }

  /**
   * Notify all listeners of config changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.config });
      } catch (error) {
      }
    });
  }

  /**
   * Get formatted time until next sync
   */
  public getTimeUntilNextSync(): string {
    if (!this.config.nextSync) {
      return 'Not scheduled';
    }

    const now = new Date();
    const diff = this.config.nextSync.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Syncing now...';
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Reset sync statistics
   */
  public resetStats(): void {
    this.config.totalBookingsSynced = 0;
    this.config.totalBlockedDatesSynced = 0;
    this.config.lastError = null;
    
    this.saveConfigToStorage();
    this.notifyListeners();
  }
}

// Create singleton instance
export const autoSyncService = new AutoSyncService();

// Auto-start auto-sync when page loads (always enabled)
window.addEventListener('load', () => {
  autoSyncService.start(1); // Always start with 1-minute interval
});

// Also start immediately if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  autoSyncService.start(1);
}

export default autoSyncService;
