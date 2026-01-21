import { supabase } from '../lib/supabase';

/**
 * Enhanced Airbnb API Service for Frontend
 * 
 * AIRBNB iCAL INTEGRATION LIMITATIONS:
 * =====================================
 * 
 * 1. GUEST DATA LIMITATIONS:
 *    - iCal feeds do NOT include guest email addresses
 *    - iCal feeds do NOT include guest phone numbers  
 *    - iCal feeds do NOT include detailed guest information
 *    - Only basic guest names may be available in event summaries
 *    - Guest data is only available via Airbnb API (requires OAuth integration)
 * 
 * 2. BOOKING DATA LIMITATIONS:
 *    - No payment information (amounts, payment status)
 *    - No guest count information (number of guests)
 *    - No special requests or notes from guests
 *    - Limited to basic booking dates and status
 * 
 * 3. BLOCKED DATE LIMITATIONS:
 *    - Some manually blocked dates may not appear in iCal feeds
 *    - Host-created blocks might be missing from calendar exports
 *    - Maintenance periods may not be reflected in iCal
 *    - Need fallback mechanism for manual blocked date management
 * 
 * 4. SYNC LIMITATIONS:
 *    - iCal feeds are typically updated every 15-30 minutes
 *    - Real-time updates are not available
 *    - Manual sync required for immediate updates
 *    - No webhook support for instant notifications
 * 
 * 5. PLATFORM LIMITATIONS:
 *    - No direct API access without OAuth approval from Airbnb
 *    - Limited to read-only calendar data
 *    - Cannot modify bookings or blocked dates via iCal
 *    - No access to guest communication or reviews
 * 
 * WORKAROUNDS IMPLEMENTED:
 * =======================
 * 
 * 1. Enhanced Event Classification:
 *    - "Reserved" = confirmed booking (Airbnb's standard)
 *    - "Not available" = manually blocked by host
 *    - Smart pattern recognition for guest names
 *    - Fallback to booking for ambiguous events (safety first)
 * 
 * 2. Manual Blocked Date Fallback:
 *    - Admin panel allows manual blocked date creation
 *    - Stored in same database table with source tracking
 *    - Visual differentiation in calendar (blue vs gray)
 *    - Prevents double bookings from missing blocked dates
 * 
 * 3. Enhanced Guest Data Handling:
 *    - Extract available information from summaries
 *    - Store placeholders for missing data with clear indicators
 *    - Preserve original iCal data for future reference
 *    - Ready for API integration when available
 * 
 * 4. Visual Differentiation:
 *    - Red: Confirmed bookings (both website and Airbnb)
 *    - Gray: Airbnb blocked dates ("Not available")
 *    - Blue: Manual blocked dates (admin panel)
 *    - Yellow: Pending bookings
 * 
 * FUTURE ENHANCEMENTS:
 * ===================
 * 
 * 1. Airbnb API Integration:
 *    - OAuth integration for full guest data access
 *    - Real-time booking updates via webhooks
 *    - Guest communication and review access
 *    - Payment and financial data integration
 * 
 * 2. Advanced Analytics:
 *    - Revenue tracking from Airbnb bookings
 *    - Guest behavior analysis
 *    - Occupancy rate calculations
 *    - Performance comparison (website vs Airbnb)
 * 
 * 3. Automated Workflows:
 *    - Auto-sync scheduling (every 1 minute)
 *    - Email notifications for new bookings
 *    - Guest welcome message automation
 *    - Review request automation
 */

export interface AirbnbBooking {
  id: string;
  title: string;
  start: string;
  end: string;
  source: 'Airbnb';
  roomId: number;
  guestName: string;
  numGuests: number;
  phone?: string;
  description?: string;
  status: string;
  createdAt: string;
  // Enhanced fields for full integration
  booking_source?: string;
  external_booking_id?: string;
  room_id?: number;
  check_in_date?: string;
  check_out_date?: string;
  booking_status?: string;
  payment_status?: string;
  email?: string;
  special_requests?: string;
  is_airbnb?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  original_status?: string;
  event_summary?: string;
  event_description?: string;
  // New enhanced fields
  platform_data?: any;
  sync_timestamp?: string;
  last_updated?: string;
  conflict_resolved?: boolean;
  manual_override?: boolean;
  roomInfo?: string; // Added for enhanced bookings
}

export interface AirbnbApiResponse {
  success: boolean;
  data: AirbnbBooking[];
  count: number;
  message?: string;
  timestamp?: string;
  hasValidData?: boolean;
  totalEventsProcessed?: number;
  totalValidBookings?: number;
  isDemoData?: boolean;
  // Enhanced response fields
  syncStats?: {
    totalSynced: number;
    newBookings: number;
    updatedBookings: number;
    cancelledBookings: number;
    conflicts: number;
    errors: number;
  };
  platformInfo?: {
    platform: string;
    lastSync: string;
    nextSync: string;
    syncStatus: string;
  };
}

export interface SyncConfiguration {
  roomId: number;
  calendarUrl: string;
  platform: 'airbnb' | 'booking.com' | 'expedia';
  syncFrequency: number; // minutes
  autoResolveConflicts: boolean;
  syncEnabled: boolean;
}

class AirbnbApiService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;
  private refreshCallback: (() => void) | null = null;
  private syncConfigurations: SyncConfiguration[] = [];
  private isAutoSyncInitialized: boolean = false;

  /**
   * Register a callback to trigger UI refresh after sync operations
   * Pass null to remove the callback (cleanup)
   */
  setRefreshCallback(callback: (() => void) | null): void {
    this.refreshCallback = callback;
  }

  /**
   * Trigger UI refresh if callback is registered
   */
  public triggerUIRefresh(): void {
    if (this.refreshCallback) {
      try {
        this.refreshCallback();
      } catch (error) {
        // Silent fail
      }
    }
  }

  /**
   * Initialize automatic sync for all configured rooms
   * This is idempotent - calling it multiple times is safe
   */
  async initializeAutoSync(): Promise<void> {
    // Prevent multiple initializations
    if (this.isAutoSyncInitialized && this.syncInterval) {
      return;
    }

    try {
      // Wait for UI callback to be registered first (optional - won't block if not registered)
      if (!this.refreshCallback) {
        // Wait up to 5 seconds for callback registration
        let attempts = 0;
        while (!this.refreshCallback && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }
      
      const syncs = await this.getSyncConfigurations();
      this.syncConfigurations = syncs;
      
      if (syncs.length === 0) {
        this.isAutoSyncInitialized = true; // Mark as initialized even if no configs
        return;
      }

      // FIXED: Single interval for all rooms (prevents conflicts)
      const enabledRooms = syncs.filter(s => s.syncEnabled && s.calendarUrl && s.calendarUrl.startsWith('http'));
      if (enabledRooms.length > 0) {
        this.startUnifiedSyncInterval();
        this.isAutoSyncInitialized = true;
      } else {
        this.isAutoSyncInitialized = true; // Mark as initialized even if no enabled rooms
      }
      
    } catch (error) {
      // Don't mark as initialized on error, so it can retry
    }
  }

  /**
   * Start unified sync interval for all enabled rooms
   */
  private startUnifiedSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (!this.isSyncing) {
        this.isSyncing = true;
        
        try {
          // IMPORTANT: Fetch fresh sync configurations each time to pick up any changes
          const freshSyncs = await this.getSyncConfigurations();
          this.syncConfigurations = freshSyncs;
          
          // Sync all enabled rooms in parallel
          const enabledRooms = freshSyncs.filter(s => s.syncEnabled && s.calendarUrl && s.calendarUrl.startsWith('http'));
          
          if (enabledRooms.length === 0) {
            this.isSyncing = false;
            return;
          }
          
          const syncPromises = enabledRooms.map(async (config) => {
            try {
              await this.syncRoomBookings(config.roomId);
            } catch (error) {
              // Silent fail - error already handled in syncRoomBookings
            }
          });
          
          await Promise.allSettled(syncPromises);
          
          // Trigger UI refresh after all rooms are synced
          this.triggerUIRefresh();
          
        } catch (error) {
          // Silent fail
        } finally {
          this.isSyncing = false;
        }
      }
    }, 60 * 1000); // 1 minute intervals

  }

  /**
   * Stop all sync intervals
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.isAutoSyncInitialized = false; // Allow re-initialization after stop
    }
  }

  /**
   * Stop any running sync intervals and ensure manual sync only
   */
  ensureManualSyncOnly(): void {
    this.stopAutoSync();
  }

  /**
   * Get sync configurations from database
   */
  async getSyncConfigurations(): Promise<SyncConfiguration[]> {
    try {
      
      // Get calendar settings that contain Airbnb iCal URLs
      const { data: settings, error } = await supabase
        .from('calendar_settings')
        .select('*')
        .like('setting_key', 'airbnb_room_%')
        .neq('setting_key', '%_last_sync');

      if (error) {
        return [];
      }

      // Convert settings to sync configurations
      const configurations: SyncConfiguration[] = [];
      
      settings?.forEach(setting => {
        if (setting.setting_value && setting.setting_value.trim() !== '') {
          const roomId = parseInt(setting.setting_key.replace('airbnb_room_', ''));
          if (!isNaN(roomId)) {
            const config = {
              roomId: roomId,
              calendarUrl: setting.setting_value,
              platform: 'airbnb' as const,
              syncFrequency: 1, // Sync every 1 minute
              autoResolveConflicts: true,
              syncEnabled: true
            };
            configurations.push(config);
          }
        }
      });

      return configurations;
    } catch (error) {
      return [];
    }
  }

  /**
   * Enhanced fetch all Airbnb bookings with comprehensive sync
   */
  async fetchAirbnbBookings(options: {
    roomId?: number;
    startDate?: string;
    endDate?: string;
    forceSync?: boolean;
  } = {}): Promise<AirbnbBooking[]> {
    try {

      // If force sync is requested, perform a fresh sync
      if (options.forceSync) {
        await this.performFullSync(options.roomId);
      }

      // Try multiple approaches to get Airbnb data
      let result = null;
      
      // Approach 1: Try Netlify function
      result = await this.fetchFromNetlifyFunction(options);
      
      // Approach 2: Direct API call (fallback)
      if (!result || !result.success) {
        result = await this.fetchDirectFromAirbnb(options);
      }
      
      // Approach 3: Use demo data as last resort
      if (!result || !result.success) {
        result = {
          success: true,
          data: this.getDemoAirbnbBookings(),
          count: 0,
          hasValidData: true,
          isDemoData: true
        };
      }

      if (result && result.success && result.data) {
        
        // Process and enhance the bookings
        const enhancedBookings = await this.enhanceBookingsData(result.data);
        
        // Update sync status
        await this.updateSyncStatus(enhancedBookings.length, result.isDemoData || false);
        
        return enhancedBookings;
      }

      throw new Error('Failed to fetch Airbnb bookings from all sources');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a full sync for a specific room or all rooms
   */
  async performFullSync(roomId?: number): Promise<void> {
    try {
      this.isSyncing = true;

      const syncs = await this.getSyncConfigurations();
      const targetSyncs = roomId ? syncs.filter(s => s.roomId === roomId) : syncs;

      for (const sync of targetSyncs) {
        try {
          await this.syncRoomBookings(sync.roomId);
        } catch (error) {
        }
      }

    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync bookings for a specific room
   */
  async syncRoomBookings(roomId: number, icalUrl?: string): Promise<void> {
    try {

      let calendarUrl = icalUrl;

      // If no iCal URL provided, try to get it from sync configurations
      if (!calendarUrl) {
        const syncs = await this.getSyncConfigurations();
        const roomSync = syncs.find(s => s.roomId === roomId);
        
        if (!roomSync) {
          return;
        }
        calendarUrl = roomSync.calendarUrl;
      }

      // Validate that calendarUrl is actually a URL, not a timestamp
      if (!calendarUrl || !calendarUrl.startsWith('http')) {
        return;
      }


      // Fetch and parse iCal data directly
      const bookings = await this.fetchFromCalendarUrl(calendarUrl, roomId);
      
      
      if (bookings.length > 0) {
        // Compare with existing bookings and resolve conflicts
        await this.resolveBookingConflicts(roomId, bookings);
        
        // Update sync status
        await this.updateRoomSyncStatus(roomId, bookings.length);
      } else {
      }

      // Also sync blocked dates
      await this.syncRoomBlockedDates(roomId);
      
      // Trigger UI refresh after manual sync
      this.triggerUIRefresh();
      
    } catch (error) {
      await this.updateRoomSyncError(roomId, error);
    }
  }

  /**
   * Sync blocked dates for a specific room
   */
  async syncRoomBlockedDates(roomId: number): Promise<void> {
    try {

      // Get sync configuration for this room
      const syncs = await this.getSyncConfigurations();
      
      const roomSync = syncs.find(s => s.roomId === roomId);
      
      if (!roomSync) {
        return;
      }


      // Fetch blocked dates from Airbnb iCal

      // Get the calendar URL for this room from settings
      const { data: calendarSetting } = await supabase
        .from('calendar_settings')
        .select('setting_value')
        .eq('setting_key', `airbnb_room_${roomId}`)
        .single();

      if (!calendarSetting?.setting_value) {
        return;
      }

      // Fetch raw iCal data with force refresh to get latest data (aggressive cache busting)
      const icalData = await this.fetchRawICalData(calendarSetting.setting_value, true);
      const { blockedDates } = await this.parseICalDataForBlockedDates(icalData, roomId);

      // Sync blocked dates to database (this will remove dates that are no longer in Airbnb)
      await this.resolveBlockedDateConflicts(roomId, blockedDates);

    } catch (error) {
    }
  }

  /**
   * Resolve conflicts between existing and new bookings
   */
  private async resolveBookingConflicts(roomId: number, newBookings: AirbnbBooking[]): Promise<void> {
    try {


      // Get existing Airbnb bookings for this room
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .eq('booking_source', 'airbnb');

      
      const existingBookingsMap = new Map(
        existingBookings?.map(b => [b.external_booking_id, b]) || []
      );

      let conflicts = 0;
      let newBookingsCreated = 0;
      let updatedBookings = 0;

      for (const newBooking of newBookings) {
        const existingBooking = existingBookingsMap.get(newBooking.external_booking_id);

        if (!existingBooking) {
          // Create new booking
          await this.createBookingFromAirbnb(newBooking);
          newBookingsCreated++;
        } else {
          // Check if booking needs update
          if (this.hasBookingChanged(existingBooking, newBooking)) {
            await this.updateBookingFromAirbnb(existingBooking.id, newBooking);
            updatedBookings++;
          }
        }
      }

    } catch (error) {
    }
  }

  /**
   * Check if a booking has changed
   */
  private hasBookingChanged(existing: any, newBooking: AirbnbBooking): boolean {
    return (
      existing.check_in_date !== newBooking.check_in_date ||
      existing.check_out_date !== newBooking.check_out_date ||
      existing.booking_status !== newBooking.booking_status ||
      existing.first_name !== newBooking.guestName?.split(' ')[0] ||
      existing.last_name !== newBooking.guestName?.split(' ').slice(1).join(' ')
    );
  }

  /**
   * Create a new booking from Airbnb data
   */
  private async createBookingFromAirbnb(airbnbBooking: AirbnbBooking): Promise<void> {
    try {

      // Get room details to use room-specific check-in/checkout times
      const roomId = airbnbBooking.room_id || airbnbBooking.roomId;
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('check_in_time, check_out_time')
        .eq('id', roomId)
        .single();

      if (roomError) {
      }

      const bookingData = {
        room_id: roomId,
        check_in_date: airbnbBooking.check_in_date || airbnbBooking.start,
        check_out_date: airbnbBooking.check_out_date || airbnbBooking.end,
        check_in_time: roomData?.check_in_time || '1:00 PM', // Use room-specific check-in time
        check_out_time: roomData?.check_out_time || '10:00 AM', // Use room-specific check-out time
        num_guests: airbnbBooking.numGuests || 2,
        total_amount: 0, // Airbnb handles payments
        booking_status: airbnbBooking.booking_status || 'confirmed',
        payment_status: airbnbBooking.payment_status || 'paid',
        booking_source: 'airbnb',
        first_name: airbnbBooking.guestName?.split(' ')[0] || 'Airbnb',
        last_name: airbnbBooking.guestName?.split(' ').slice(1).join(' ') || 'Guest',
        email: airbnbBooking.email || 'N/A',
        phone: airbnbBooking.phone || 'N/A',
        special_requests: airbnbBooking.special_requests || 'Booked via Airbnb',
        external_booking_id: airbnbBooking.external_booking_id,
        external_platform_data: airbnbBooking.platform_data || {},
        sync_status: 'synced',
        last_sync_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();

      if (error) {
      } else {
      }
    } catch (error) {
    }
  }

  /**
   * Update an existing booking from Airbnb data
   */
  private async updateBookingFromAirbnb(bookingId: number, airbnbBooking: AirbnbBooking): Promise<void> {
    try {

      const updateData = {
        check_in_date: airbnbBooking.check_in_date || airbnbBooking.start,
        check_out_date: airbnbBooking.check_out_date || airbnbBooking.end,
        booking_status: airbnbBooking.booking_status || 'confirmed',
        first_name: airbnbBooking.guestName?.split(' ')[0] || 'Airbnb',
        last_name: airbnbBooking.guestName?.split(' ').slice(1).join(' ') || 'Guest',
        external_platform_data: airbnbBooking.platform_data || {},
        sync_status: 'synced',
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) {
      } else {
      }
    } catch (error) {
    }
  }

  /**
   * Update sync status for a room
   */
  private async updateRoomSyncStatus(roomId: number, bookingsCount: number): Promise<void> {
    try {

      // Update last sync time in settings table
      const { error } = await supabase
        .from('calendar_settings')
        .update({
          setting_value: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', `airbnb_room_${roomId}_last_sync`);

      if (error) {
      } else {
      }
    } catch (error) {
    }
  }

  /**
   * Update sync error for a room
   */
  private async updateRoomSyncError(roomId: number, error: any): Promise<void> {
    try {

      // Store error in last sync time field for now (could create a separate error field later)
      const { error: updateError } = await supabase
        .from('calendar_settings')
        .update({
          setting_value: `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', `airbnb_room_${roomId}_last_sync`);

      if (updateError) {
      } else {
      }
    } catch (updateError) {
    }
  }

  /**
   * Fetch from Netlify function
   */
  private async fetchFromNetlifyFunction(options: any): Promise<AirbnbApiResponse | null> {
    try {
      const params = new URLSearchParams();
      
      if (options.roomId) params.append('roomId', options.roomId.toString());
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const url = `/.netlify/functions/airbnb-bookings${params.toString() ? `?${params.toString()}` : ''}`;
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AirbnbApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch Airbnb bookings');
      }

      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch directly from Airbnb
   */
  private async fetchDirectFromAirbnb(options: any): Promise<AirbnbApiResponse | null> {
    try {
      const syncs = await this.getSyncConfigurations();
      const targetSyncs = options.roomId ? syncs.filter(s => s.roomId === options.roomId) : syncs;

      if (targetSyncs.length === 0) {
        return null;
      }

      let allBookings: AirbnbBooking[] = [];

      for (const sync of targetSyncs) {
        try {
          const bookings = await this.fetchFromCalendarUrl(sync.calendarUrl, sync.roomId);
          allBookings = allBookings.concat(bookings);
        } catch (error) {
        }
      }

      return {
        success: true,
        data: allBookings,
        count: allBookings.length,
        hasValidData: allBookings.length > 0,
        isDemoData: false
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch raw iCal data from a calendar URL
   */
  private async fetchRawICalData(calendarUrl: string, forceRefresh: boolean = false): Promise<string> {
    try {
      // Add aggressive cache busting parameter to force fresh data
      // Use multiple random parameters to ensure no caching
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const cacheBuster = forceRefresh 
        ? `&_t=${timestamp}&_r=${random}&_c=${timestamp}&_v=${Math.random()}&_force=${timestamp}` 
        : `&_t=${timestamp}`;
      const proxyUrl = `/.netlify/functions/fetch-airbnb-ical?icalUrl=${encodeURIComponent(calendarUrl)}${cacheBuster}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-Modified-Since': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch from a specific calendar URL
   */
  private async fetchFromCalendarUrl(calendarUrl: string, roomId: number): Promise<AirbnbBooking[]> {
    try {
      const icalData = await this.fetchRawICalData(calendarUrl);
      return await this.parseICalData(icalData, roomId);
    } catch (error) {
      return [];
    }
  }

  /**
   * Parse iCal data into bookings
   */
  private async parseICalData(icalData: string, roomId: number): Promise<AirbnbBooking[]> {
    const bookings: AirbnbBooking[] = [];
    
    try {
      const events = icalData.split('BEGIN:VEVENT');
      
      for (let i = 1; i < events.length; i++) {
        const event = events[i];
        
        const uidMatch = event.match(/UID:(.+)/);
        const startMatch = event.match(/DTSTART[^:]*:(.+)/);
        const endMatch = event.match(/DTEND[^:]*:(.+)/);
        const summaryMatch = event.match(/SUMMARY:(.+)/);
        const descriptionMatch = event.match(/DESCRIPTION:(.+)/);
        const statusMatch = event.match(/STATUS:(.+)/);
        
        if (uidMatch && startMatch && endMatch && summaryMatch) {
          const uid = uidMatch[1].trim();
          const startDate = this.parseICalDate(startMatch[1].trim());
          const endDate = this.parseICalDate(endMatch[1].trim());
          const summary = summaryMatch[1].trim();
          const description = descriptionMatch ? descriptionMatch[1].replace(/\\n/g, '\n') : '';
          const status = statusMatch ? statusMatch[1].trim() : 'CONFIRMED';
          
          
          // Enhanced event classification
          const classification = this.classifyAirbnbEvent(summary, description, status);
          
          if (classification.type === 'blocked') {
            // Skip blocked dates - they will be handled by syncRoomBlockedDates
            // This prevents duplicate blocked dates and ensures proper cleanup
            continue; // Skip adding to bookings array
          }
          
          
          // Extract guest information with enhanced parsing
          // AIRBNB LIMITATION: iCal feeds don't include detailed guest info
          // We can only extract what's available in the summary/description
          const guestInfo = this.extractGuestInfoFromSummary(summary, description);
          
          // Determine booking status based on classification and status
          let bookingStatus = 'confirmed';
          if (status === 'CANCELLED' || classification.reason === 'cancelled_status') {
            bookingStatus = 'cancelled';
          } else if (status === 'TENTATIVE' || classification.reason === 'tentative_booking') {
            bookingStatus = 'pending';
          }
          
          bookings.push({
            id: `airbnb_${uid}_${roomId}`,
            title: `${guestInfo.guestName} (Airbnb)`,
            start: startDate,
            end: endDate,
            source: 'Airbnb',
            roomId: roomId,
            guestName: guestInfo.guestName,
            numGuests: 2, // AIRBNB LIMITATION: Not available in iCal
            phone: guestInfo.phone,
            description: description || guestInfo.specialRequests,
            status: bookingStatus,
            createdAt: new Date().toISOString(),
            booking_source: 'airbnb',
            external_booking_id: guestInfo.reservationCode || uid,
            room_id: roomId,
            check_in_date: startDate,
            check_out_date: endDate,
            booking_status: bookingStatus,
            payment_status: bookingStatus === 'cancelled' ? 'refunded' : 'paid',
            email: guestInfo.email,
            special_requests: guestInfo.specialRequests,
            is_airbnb: true,
            backgroundColor: bookingStatus === 'cancelled' ? '#6b7280' : '#ef4444', // Red for confirmed bookings
            borderColor: bookingStatus === 'cancelled' ? '#4b5563' : '#dc2626',
            textColor: '#ffffff',
            original_status: status,
            event_summary: summary,
            event_description: description,
            platform_data: {
              uid,
              status,
              summary,
              description: description,
              classification_reason: classification.reason,
              extracted_info: guestInfo.extractedInfo
            },
            sync_timestamp: new Date().toISOString(),
            last_updated: new Date().toISOString()
          });
        }
      }
    } catch (error) {
    }
    
    return bookings;
  }

  /**
   * Parse iCal date format
   */
  private parseICalDate(dateString: string): string {
    
    if (dateString.includes('T')) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const result = `${year}-${month}-${day}`;
      return result;
    } else {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const result = `${year}-${month}-${day}`;
      return result;
    }
  }

  /**
   * Enhance bookings data with additional information
   */
  private async enhanceBookingsData(bookings: AirbnbBooking[]): Promise<AirbnbBooking[]> {
    try {

      // Get room information
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id, room_number, name');

      const roomsMap = new Map(rooms?.map(r => [r.id, r]) || []);

      return bookings.map(booking => {
        const room = roomsMap.get(booking.roomId || booking.room_id || 0);
        return {
          ...booking,
          title: `${booking.guestName} (${room?.room_number || 'Unknown Room'}) - Airbnb`,
          roomInfo: room ? `${room.room_number} - ${room.name}` : 'Unknown Room'
        };
      });
    } catch (error) {
      return bookings;
    }
  }

  /**
   * Update global sync status
   */
  private async updateSyncStatus(bookingsCount: number, isDemoData: boolean): Promise<void> {
    try {

      // Update sync status is handled per room in updateRoomSyncStatus

      if (error) {
      }
    } catch (error) {
    }
  }

  /**
   * Get demo Airbnb bookings for testing
   */
  public getDemoAirbnbBookings(): AirbnbBooking[] {
    const today = new Date();
    
    const room4Bookings = [
      {
        id: 'demo_airbnb_1_4',
        title: 'Demo Guest 1 (101 - Garden Villa) - Airbnb',
        start: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'Airbnb' as const,
        roomId: 4,
        guestName: 'Demo Guest 1',
        numGuests: 2,
        phone: '+1-555-0123',
        description: 'Demo booking for testing',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        booking_source: 'airbnb',
        external_booking_id: 'demo_1',
        room_id: 4,
        check_in_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        check_out_date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        booking_status: 'confirmed',
        payment_status: 'paid',
        email: 'demo1@example.com',
        special_requests: 'Demo booking',
        is_airbnb: true,
        backgroundColor: '#ff5a5f',
        borderColor: '#ff5a5f',
        textColor: '#ffffff',
        roomInfo: '101 - Garden Villa'
      }
    ];

    const room5Bookings = [
      {
        id: 'demo_airbnb_1_5',
        title: 'Demo Guest 2 (102 - Deluxe Ocean Suite) - Airbnb',
        start: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'Airbnb' as const,
        roomId: 5,
        guestName: 'Demo Guest 2',
        numGuests: 1,
        phone: '+1-555-0456',
        description: 'Demo booking for testing',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        booking_source: 'airbnb',
        external_booking_id: 'demo_2',
        room_id: 5,
        check_in_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        check_out_date: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        booking_status: 'confirmed',
        payment_status: 'paid',
        email: 'demo2@example.com',
        special_requests: 'Demo booking',
        is_airbnb: true,
        backgroundColor: '#ff5a5f',
        borderColor: '#ff5a5f',
        textColor: '#ffffff',
        roomInfo: '102 - Deluxe Ocean Suite'
      }
    ];

    return [...room4Bookings, ...room5Bookings];
  }

  /**
   * Convert Airbnb bookings to FullCalendar events
   */
  convertToCalendarEvents(bookings: AirbnbBooking[]) {
    return bookings.map(booking => ({
      id: booking.id,
      title: booking.title,
      start: booking.start,
      end: booking.end,
      backgroundColor: booking.backgroundColor || '#ff5a5f',
      borderColor: booking.borderColor || '#ff5a5f',
      textColor: booking.textColor || '#ffffff',
      extendedProps: {
        source: 'Airbnb',
        roomId: booking.roomId,
        guestName: booking.guestName,
        numGuests: booking.numGuests,
        phone: booking.phone,
        description: booking.description,
        status: booking.status,
        isAirbnb: true,
        isReadOnly: true,
        booking_source: booking.booking_source,
        external_booking_id: booking.external_booking_id,
        room_id: booking.room_id,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        email: booking.email,
        special_requests: booking.special_requests,
        is_airbnb: booking.is_airbnb,
        original_status: booking.original_status,
        event_summary: booking.event_summary,
        event_description: booking.event_description,
        platform_data: booking.platform_data,
        sync_timestamp: booking.sync_timestamp,
        last_updated: booking.last_updated,
        roomInfo: booking.roomInfo
      }
    }));
  }

  /**
   * Check if the API is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const syncs = await this.getSyncConfigurations();
      return syncs.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get sync statistics for a specific room
   */
  async getRoomSyncStats(roomId: number): Promise<{
    bookingsCount: number;
    blockedDatesCount: number;
    lastSync: string | null;
    hasError: boolean;
  }> {
    try {

      // Get bookings count for this room from Airbnb
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .eq('booking_source', 'airbnb');

      if (bookingsError) {
      }

      // Get blocked dates count for this room from Airbnb
      const { data: blockedDates, error: blockedError } = await supabase
        .from('blocked_dates')
        .select('id')
        .eq('room_id', roomId)
        .eq('source', 'airbnb_blocked');

      if (blockedError) {
      }

      // Get last sync time for this room
      const { data: lastSyncData } = await supabase
        .from('calendar_settings')
        .select('setting_value')
        .eq('setting_key', `airbnb_room_${roomId}_last_sync`)
        .single();

      const hasError = lastSyncData?.setting_value?.startsWith('ERROR:') || false;

      return {
        bookingsCount: bookings?.length || 0,
        blockedDatesCount: blockedDates?.length || 0,
        lastSync: hasError ? null : lastSyncData?.setting_value || null,
        hasError
      };
    } catch (error) {
      return {
        bookingsCount: 0,
        blockedDatesCount: 0,
        lastSync: null,
        hasError: true
      };
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    totalSyncs: number;
    activeSyncs: number;
    lastSync: string | null;
    totalBookings: number;
    errors: number;
  }> {
    try {
      // Get sync configurations from settings table
      const { data: settings } = await supabase
        .from('calendar_settings')
        .select('*')
        .like('setting_key', 'airbnb_room_%')
        .neq('setting_key', '%_last_sync');

      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_source', 'airbnb');

      // Calculate stats from settings and bookings
      const activeSyncs = settings?.length || 0;
      const errorSyncs = 0; // Could be calculated from error messages in settings
      const lastSync = null; // Could be calculated from last_sync settings

      return {
        totalSyncs: settings?.length || 0,
        activeSyncs,
        lastSync,
        totalBookings: bookings?.length || 0,
        errors: errorSyncs
      };
    } catch (error) {
      return {
        totalSyncs: 0,
        activeSyncs: 0,
        lastSync: null,
        totalBookings: 0,
        errors: 0
      };
    }
  }

  /**
   * Parse iCal data to extract blocked dates
   */
  private async parseICalDataForBlockedDates(icalData: string, roomId: number): Promise<{ blockedDates: any[] }> {
    const blockedDates: any[] = [];
    
    // Split the iCal data into individual events
    const events = icalData.split('BEGIN:VEVENT');
    
    events.forEach((event, index) => {
      if (index === 0) return; // Skip the first split which is the header
      
      try {
        // Extract event properties
        const summaryMatch = event.match(/SUMMARY:(.*?)(?:\r?\n|$)/);
        const startMatch = event.match(/DTSTART[^:]*:(.+)/);
        const endMatch = event.match(/DTEND[^:]*:(.+)/);
        const descriptionMatch = event.match(/DESCRIPTION:(.*?)(?:\r?\n|$)/);
        const statusMatch = event.match(/STATUS:(.*?)(?:\r?\n|$)/);
        
        if (!startMatch || !endMatch) {
          return;
        }
        
        const summary = summaryMatch ? summaryMatch[1].trim() : '';
        const startDate = this.parseICalDate(startMatch[1]);
        const endDate = this.parseICalDate(endMatch[1]);
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';
        const status = statusMatch ? statusMatch[1].trim() : '';
        
        // Check if this is a blocked date
        const isBlocked = this.isBlockedDate(summary, description, status);
        
        if (isBlocked) {
          blockedDates.push({
            room_id: roomId,
            start_date: startDate,
            end_date: endDate,
            reason: 'Airbnb Blocked',
            notes: `Synced from Airbnb: ${summary}`,
            source: 'airbnb_blocked'
          });
        }
        
      } catch (error) {
      }
    });

    return { blockedDates };
  }

  /**
   * Determine if an iCal event represents a blocked date
   */
  /**
   * Enhanced event classification for Airbnb iCal events
   * 
   * AIRBNB LIMITATIONS:
   * - iCal feeds do NOT include guest details (name, email, phone)
   * - Limited to basic event info: summary, dates, status
   * - Guest data only available via Airbnb API (not iCal)
   * - Some blocked dates may not appear in iCal feeds
   * 
   * @param summary Event summary/title from iCal
   * @param description Event description from iCal  
   * @param status Event status from iCal
   * @returns Object with event type and source information
   */
  private classifyAirbnbEvent(summary: string, description: string, status: string): {
    type: 'booking' | 'blocked' | 'unknown',
    source: 'airbnb_booking' | 'airbnb_blocked' | 'unknown',
    reason?: string
  } {
    
    const summaryLower = summary.toLowerCase();
    const descriptionLower = description.toLowerCase();
    const statusLower = status.toLowerCase();
    
    // 1. DEFINITIVE BOOKING INDICATORS
    // "Reserved" = confirmed booking (Airbnb's standard booking indicator)
    if (summaryLower.includes('reserved')) {
      return { type: 'booking', source: 'airbnb_booking', reason: 'reserved_booking' };
    }
    
    // Guest name patterns (Airbnb includes guest names in summaries)
    const guestNamePattern = /^[A-Za-z\s]+(?:-\s*[A-Za-z\s]+)?$/;
    if (guestNamePattern.test(summary.trim()) && !summaryLower.includes('not available')) {
      return { type: 'booking', source: 'airbnb_booking', reason: 'guest_name_detected' };
    }
    
    // 2. DEFINITIVE BLOCKED DATE INDICATORS  
    // "Not available" = manually blocked by host (not a booking)
    if (summaryLower.includes('not available') || descriptionLower.includes('not available')) {
      return { type: 'blocked', source: 'airbnb_blocked', reason: 'not_available_blocked' };
    }
    
    // Explicit blocked indicators
    const blockedIndicators = [
      /blocked\s*out/i,
      /calendar\s*blocked/i,
      /no\s*availability/i,
      /closed/i,
      /maintenance/i,
      /offline/i,
      /blocked\s*by\s*host/i,
      /host\s*blocked/i,
      /calendar\s*unavailable/i,
      /blocked\s*calendar/i,
      /unavailable/i,
      /out\s*of\s*service/i
    ];

    const hasBlockedIndicators = blockedIndicators.some(pattern => 
      pattern.test(summary) || pattern.test(description)
    );

    if (hasBlockedIndicators) {
      return { type: 'blocked', source: 'airbnb_blocked', reason: 'explicit_blocked_indicators' };
    }
    
    // 3. BOOKING-RELATED KEYWORDS
    const bookingKeywords = [
      /guest/i,
      /booking/i,
      /reservation/i,
      /confirmed/i,
      /paid/i,
      /booked/i,
      /check-in/i,
      /check-out/i,
      /stay/i,
      /visit/i,
      /airbnb/i,
      /bnb/i
    ];

    const hasBookingKeywords = bookingKeywords.some(pattern => 
      pattern.test(summary) || pattern.test(description)
    );

    if (hasBookingKeywords) {
      return { type: 'booking', source: 'airbnb_booking', reason: 'booking_keywords_detected' };
    }
    
    // 4. STATUS-BASED CLASSIFICATION
    if (statusLower.includes('cancelled')) {
      return { type: 'blocked', source: 'airbnb_blocked', reason: 'cancelled_status' };
    }
    
    if (statusLower.includes('tentative')) {
      return { type: 'booking', source: 'airbnb_booking', reason: 'tentative_booking' };
    }
    
    // 5. DEFAULT CLASSIFICATION
    // When in doubt, treat as booking to avoid double bookings
    return { type: 'booking', source: 'airbnb_booking', reason: 'default_classification' };
  }

  /**
   * Extract guest information from Airbnb iCal event summary/description
   * 
   * AIRBNB LIMITATIONS:
   * - iCal feeds do NOT include: email, phone, detailed guest info
   * - Limited to: summary (may contain guest name), description (minimal)
   * - Guest data only available via Airbnb API (requires OAuth integration)
   * 
   * @param summary Event summary from iCal
   * @param description Event description from iCal
   * @returns Extracted guest information with placeholders for missing data
   */
  private extractGuestInfoFromSummary(summary: string, description: string): {
    guestName: string;
    reservationCode?: string;
    email: string;
    phone: string;
    specialRequests: string;
    extractedInfo: string;
  } {
    // Try to extract guest name from summary
    // Common patterns: "John Doe", "John - 2 guests", "Reserved by John"
    let guestName = 'Airbnb Guest';
    let reservationCode = '';
    
    // Pattern 1: Direct guest name (most common)
    const directNamePattern = /^([A-Za-z\s]+?)(?:\s*-\s*|\s*$)/;
    const directMatch = summary.match(directNamePattern);
    if (directMatch && !directMatch[1].toLowerCase().includes('reserved')) {
      guestName = directMatch[1].trim();
    }
    
    // Pattern 2: "Reserved by [Name]"
    const reservedByPattern = /reserved\s*by\s*([A-Za-z\s]+)/i;
    const reservedMatch = summary.match(reservedByPattern);
    if (reservedMatch) {
      guestName = reservedMatch[1].trim();
    }
    
    // Pattern 3: Extract reservation code if present
    const codePattern = /(?:reservation|booking|confirmation)\s*[#:]?\s*([A-Z0-9]+)/i;
    const codeMatch = summary.match(codePattern) || description.match(codePattern);
    if (codeMatch) {
      reservationCode = codeMatch[1];
    }
    
    // Build extracted info string for reference
    const extractedInfo = `Summary: "${summary}"${description ? `, Description: "${description}"` : ''}${reservationCode ? `, Code: ${reservationCode}` : ''}`;
    
    return {
      guestName: guestName || 'Airbnb Guest',
      reservationCode: reservationCode || undefined,
      email: 'N/A - Not available in iCal', // AIRBNB LIMITATION
      phone: 'N/A - Not available in iCal', // AIRBNB LIMITATION  
      specialRequests: `Booked via Airbnb${reservationCode ? ` (Reservation: ${reservationCode})` : ''}`,
      extractedInfo
    };
  }

  /**
   * Store Airbnb blocked dates in the blocked_dates table
   * This provides a fallback mechanism for blocked dates not captured in iCal
   * 
   * @param blockedDateData Data for the blocked date
   */
  private async storeAirbnbBlockedDate(blockedDateData: {
    room_id: number;
    start_date: string;
    end_date: string;
    reason: string;
    notes: string;
    source: string;
    external_id: string;
    platform_data: any;
  }): Promise<void> {
    try {

      // Check if this blocked date already exists
      const { data: existing } = await supabase
        .from('blocked_dates')
        .select('id')
        .eq('room_id', blockedDateData.room_id)
        .eq('start_date', blockedDateData.start_date)
        .eq('end_date', blockedDateData.end_date)
        .eq('source', blockedDateData.source)
        .single();

      if (existing) {
        return;
      }

      // Insert new blocked date
      const { error } = await supabase
        .from('blocked_dates')
        .insert([{
          room_id: blockedDateData.room_id,
          start_date: blockedDateData.start_date,
          end_date: blockedDateData.end_date,
          reason: blockedDateData.reason,
          notes: blockedDateData.notes,
          source: blockedDateData.source,
          external_id: blockedDateData.external_id,
          platform_data: blockedDateData.platform_data,
          created_at: new Date().toISOString()
        }]);

      if (error) {
      } else {
      }
    } catch (error) {
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use classifyAirbnbEvent instead
   */
  private isBlockedDate(summary: string, description: string, status: string): boolean {
    const classification = this.classifyAirbnbEvent(summary, description, status);
    return classification.type === 'blocked';
  }

  /**
   * Resolve conflicts between existing and new blocked dates
   */
  private async resolveBlockedDateConflicts(roomId: number, newBlockedDates: any[]): Promise<void> {
    try {

      // Get existing Airbnb blocked dates for this room
      const { data: existingBlockedDates } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('room_id', roomId)
        .eq('source', 'airbnb_blocked');

      console.log(`🗄️ Room ${roomId}: Found ${existingBlockedDates?.length || 0} existing blocked dates in database:`, 
        existingBlockedDates?.map(bd => `${bd.start_date} to ${bd.end_date} (ID: ${bd.id})`) || []);

      // Create a map of existing blocked dates by date range
      const existingBlockedDatesMap = new Map();
      existingBlockedDates?.forEach(blocked => {
        const key = `${blocked.start_date}_${blocked.end_date}`;
        existingBlockedDatesMap.set(key, blocked);
      });

      let newBlockedDatesCreated = 0;
      let updatedBlockedDates = 0;
      let removedBlockedDates = 0;

      // Create a set of new blocked date keys for comparison
      const newBlockedDatesKeys = new Set(
        newBlockedDates.map(bd => `${bd.start_date}_${bd.end_date}`)
      );

      // Remove blocked dates that are no longer in Airbnb
      // This ensures unblocked dates are removed immediately when sync runs
      for (const [key, existingBlockedDate] of existingBlockedDatesMap) {
        if (!newBlockedDatesKeys.has(key)) {
          const { error } = await supabase
            .from('blocked_dates')
            .delete()
            .eq('id', existingBlockedDate.id);

          if (!error) {
            removedBlockedDates++;
          }
        }
      }

      // Process new blocked dates and add them to calendar
      for (const newBlockedDate of newBlockedDates) {
        const key = `${newBlockedDate.start_date}_${newBlockedDate.end_date}`;
        const existingBlockedDate = existingBlockedDatesMap.get(key);

        // Check if there are website bookings on these dates (for informational logging only)
        const { data: overlappingBookings } = await supabase
          .from('bookings')
          .select('id, check_in_date, check_out_date, booking_status')
          .eq('room_id', roomId)
          .eq('booking_source', 'website')
          .neq('booking_status', 'cancelled')
          .gte('check_out_date', newBlockedDate.start_date) // Booking ends after blocked period starts
          .lte('check_in_date', newBlockedDate.end_date);   // Booking starts before blocked period ends

        // Note: Overlapping bookings are allowed (both will be displayed on calendar)

        if (!existingBlockedDate) {
          // Create new blocked date
          const { error } = await supabase
            .from('blocked_dates')
            .insert([newBlockedDate]);

          if (!error) {
            newBlockedDatesCreated++;
          }
        } else {
          // Check if blocked date needs update
          if (existingBlockedDate.reason !== newBlockedDate.reason || existingBlockedDate.notes !== newBlockedDate.notes) {
            const { error } = await supabase
              .from('blocked_dates')
              .update({
                reason: newBlockedDate.reason,
                notes: newBlockedDate.notes
              })
              .eq('id', existingBlockedDate.id);

            if (!error) {
              updatedBlockedDates++;
            }
          }
        }
      }



    } catch (error) {
    }
  }

  /**
   * Manually sync Airbnb blocked dates for a specific room (for testing)
   */
  async syncAirbnbBlockedDates(roomId: number): Promise<void> {
    try {
      await this.syncRoomBlockedDates(roomId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Manually sync Airbnb blocked dates for all rooms (for testing)
   */
  async syncAllAirbnbBlockedDates(): Promise<void> {
    try {
      const syncs = await this.getSyncConfigurations();
      
      for (const sync of syncs) {
        if (sync.syncEnabled) {
          try {
            await this.syncRoomBlockedDates(sync.roomId);
          } catch (error) {
          }
        }
      }
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Manually unblock a specific date range for a room (bypasses iCal sync)
   * This allows immediate unblocking without waiting for Airbnb iCal updates
   */
  async manualUnblockDate(roomId: number, startDate: string, endDate: string): Promise<boolean> {
    try {
      console.log(`🔓 Manually unblocking date range ${startDate} to ${endDate} for room ${roomId}`);
      
      // Find and remove the blocked date
      const { data: blockedDates } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('room_id', roomId)
        .eq('source', 'airbnb_blocked')
        .gte('start_date', startDate)
        .lte('end_date', endDate);

      if (!blockedDates || blockedDates.length === 0) {
        console.log(`⚠️ No Airbnb blocked dates found for the specified range`);
        return false;
      }

      // Remove all matching blocked dates
      let removedCount = 0;
      for (const blocked of blockedDates) {
        const { error } = await supabase
          .from('blocked_dates')
          .delete()
          .eq('id', blocked.id);

        if (error) {
          console.error(`❌ Error removing blocked date ${blocked.id}:`, error);
        } else {
          removedCount++;
          console.log(`✅ Removed blocked date: ${blocked.start_date} to ${blocked.end_date} (ID: ${blocked.id})`);
        }
      }

      console.log(`🎉 Successfully unblocked ${removedCount} date(s) for room ${roomId}`);
      return removedCount > 0;
    } catch (error) {
      console.error('❌ Error in manual unblock:', error);
      return false;
    }
  }

  /**
   * Get Airbnb bookings for a specific room directly from iCal feed (not stored in DB)
   * This is used for guest calendar display to prevent double bookings
   */
  async getAirbnbBookingsForRoom(roomId: number): Promise<AirbnbBooking[]> {
    try {

      
      // Get the calendar URL for this room
      const syncs = await this.getSyncConfigurations()
      const roomSync = syncs.find(sync => sync.roomId === roomId && sync.platform === 'airbnb')
      
      if (!roomSync) {
        return []
      }

      // Fetch bookings directly from iCal feed
      const bookings = await this.fetchFromCalendarUrl(roomSync.calendarUrl, roomId)
      
      // Filter out blocked dates and only return actual bookings
      const actualBookings = bookings.filter(booking => {
        // Check if this is a blocked date (not a booking)
        const isBlocked = this.isBlockedDate(
          booking.event_summary || booking.title,
          booking.event_description || booking.description || '',
          booking.original_status || booking.status
        )
        
        if (isBlocked) {
          return false
        }
        
        return true
      })

      return actualBookings
    } catch (error) {
      return []
    }
  }
}

// Export singleton instance
export const airbnbApi = new AirbnbApiService();

// Export the class for testing
export { AirbnbApiService };
