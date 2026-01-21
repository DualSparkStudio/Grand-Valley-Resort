/**
 * Airbnb iCal Integration Utilities
 * 
 * ========================================
 * AIRBNB iCAL INTEGRATION LIMITATIONS
 * ========================================
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
 *    - Auto-sync scheduling (every 15 minutes)
 *    - Email notifications for new bookings
 *    - Guest welcome message automation
 *    - Review request automation
 */

import { api, type Room } from './supabase';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    source: 'Airbnb' | 'Website';
    roomId: number;
    guestName?: string;
    numGuests?: number;
    phone?: string;
    email?: string;
    totalAmount?: number;
    booking?: any;
    type?: string;
    reason?: string;
    roomName?: string;
    isReadOnly?: boolean;
    bookingStatus?: string;
    paymentStatus?: string;
    platform?: string;
    roomInfo?: string;
    bookingCount?: number;
  };
}

export interface AirbnbBooking {
  id: string;
  start: string;
  end: string;
  guestName?: string;
  roomInfo?: string;
  numGuests?: number;
  phone?: string;
  email?: string;
  totalAmount?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  roomId?: number;
}

export interface AirbnbICalEvent {
  uid: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  status?: string;
}

export interface AirbnbBlockedDate {
  start: string;
  end: string;
  roomId: number;
  reason: 'airbnb_blocked';
}

export interface RoomAirbnbData {
  roomId: number;
  bookings: AirbnbBooking[];
  blockedDates: AirbnbBlockedDate[];
}

export function parseICalDate(dateStr: string): string {
  // Handle different iCal date formats
  if (dateStr.includes('T')) {
    // Format: 20231201T120000Z or 20231201T120000
    const date = new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
    return date.toISOString().split('T')[0];
  } else {
    // Format: 20231201
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
}

export function parseAirbnbICal(icalData: string): { bookings: AirbnbBooking[], blockedDates: AirbnbBlockedDate[] } {
  const bookings: AirbnbBooking[] = [];
  const blockedDates: AirbnbBlockedDate[] = [];
  
  // Split the iCal data into individual events
  const events = icalData.split('BEGIN:VEVENT');
  
  events.forEach((event, index) => {
    if (index === 0) return; // Skip the first split which is the header
    
    try {
      // Extract event properties
      const summaryMatch = event.match(/SUMMARY:(.*?)(?:\r?\n|$)/);
      const startMatch = event.match(/DTSTART[^:]*:(.*?)(?:\r?\n|$)/);
      const endMatch = event.match(/DTEND[^:]*:(.*?)(?:\r?\n|$)/);
      const descriptionMatch = event.match(/DESCRIPTION:(.*?)(?:\r?\n|$)/);
      const uidMatch = event.match(/UID:(.*?)(?:\r?\n|$)/);
      const statusMatch = event.match(/STATUS:(.*?)(?:\r?\n|$)/);
      const locationMatch = event.match(/LOCATION:(.*?)(?:\r?\n|$)/);
      
      if (!startMatch || !endMatch) {
        return;
      }
      
      const summary = summaryMatch ? summaryMatch[1].trim() : '';
      const startDate = parseICalDate(startMatch[1]);
      const endDate = parseICalDate(endMatch[1]);
      const description = descriptionMatch ? descriptionMatch[1].trim() : '';
      const uid = uidMatch ? uidMatch[1].trim() : `airbnb-${Date.now()}-${index}`;
      const status = statusMatch ? statusMatch[1].trim() : '';
      const location = locationMatch ? locationMatch[1].trim() : '';
      
      // Airbnb-specific detection logic
      const eventType = determineAirbnbEventType(summary, description, status, location, uid);
      
      if (eventType === 'booking') {
        const booking = convertICalEventToBooking({
          uid,
          summary,
          description,
          start: startDate,
          end: endDate,
          status: status || 'confirmed'
        });
        
        if (booking) {
          bookings.push(booking);
        }
      } else if (eventType === 'blocked') {
        blockedDates.push({
          start: startDate,
          end: endDate,
          roomId: 0, // Will be set later
          reason: 'airbnb_blocked'
        });
      }
      
    } catch (error) {
    }
  });
  
  return { bookings, blockedDates };
}

/**
 * Enhanced Airbnb event classification with improved accuracy
 * 
 * AIRBNB iCAL LIMITATIONS:
 * ========================
 * - iCal feeds do NOT include guest email addresses or phone numbers
 * - Limited to basic event info: summary, dates, status, description
 * - Guest data only available via Airbnb API (requires OAuth integration)
 * - Some manually blocked dates may not appear in iCal feeds
 * 
 * CLASSIFICATION RULES:
 * ====================
 * 1. "Reserved" = confirmed booking (Airbnb's standard booking indicator)
 * 2. "Not available" = manually blocked by host (not a booking)
 * 3. Guest names in summary = confirmed booking
 * 4. Explicit blocked keywords = blocked date
 * 5. Default to booking when uncertain (prevents double bookings)
 */
function determineAirbnbEventType(
  summary: string, 
  description: string, 
  status: string, 
  _location: string, 
  uid: string
): 'booking' | 'blocked' | 'unknown' {
  
  
  const summaryLower = summary.toLowerCase();
  const descriptionLower = description.toLowerCase();
  const statusLower = status.toLowerCase();
  
  // 1. DEFINITIVE BOOKING INDICATORS
  // "Reserved" = confirmed booking (Airbnb's standard booking indicator)
  if (summaryLower.includes('reserved')) {
    return 'booking';
  }
  
  // Guest name patterns (Airbnb includes guest names in summaries)
  const guestNamePattern = /^[A-Za-z\s]+(?:-\s*[A-Za-z\s]+)?$/;
  if (guestNamePattern.test(summary.trim()) && !summaryLower.includes('not available')) {
    return 'booking';
  }
  
  // 2. DEFINITIVE BLOCKED DATE INDICATORS  
  // "Not available" = manually blocked by host (not a booking)
  if (summaryLower.includes('not available') || descriptionLower.includes('not available')) {
    return 'blocked';
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
    return 'blocked';
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
    return 'booking';
  }
  
  // 4. STATUS-BASED CLASSIFICATION
  if (statusLower.includes('cancelled')) {
    return 'blocked';
  }
  
  if (statusLower.includes('tentative')) {
    return 'booking';
  }
  
  // 5. DEFAULT CLASSIFICATION
  // When in doubt, treat as booking to avoid double bookings
  return 'booking';
}

/**
 * Convert iCal event to booking with enhanced guest data extraction
 * 
 * AIRBNB LIMITATIONS:
 * ===================
 * - iCal feeds do NOT include guest email addresses or phone numbers
 * - Limited to basic event info: summary, dates, status, description
 * - Guest data only available via Airbnb API (requires OAuth integration)
 * - We extract what's available and use placeholders for missing data
 */
export function convertICalEventToBooking(event: AirbnbICalEvent): AirbnbBooking | null {
  if (!event.start || !event.end || !event.uid) {
    return null;
  }

  // Extract guest information from summary and description
  // AIRBNB LIMITATION: Only basic info available in iCal feeds
  let guestName: string | undefined;
  let roomInfo: string | undefined;
  let numGuests: number | undefined;
  let phone: string | undefined;
  let email: string | undefined;
  let totalAmount: number | undefined;
  let reservationCode: string | undefined;

  // Enhanced parsing for summary field
  if (event.summary) {
    const summary = event.summary;
    
    // Multiple patterns for guest name extraction
    const namePatterns = [
      /^([^-–—\n\r]+)/, // Everything before first dash/hyphen
      /^([A-Za-z\s]+?)(?:\s*[-–—]\s*|$)/, // Letters and spaces before dash
      /^([A-Za-z]+(?:\s[A-Za-z]+)*)/, // First and last name pattern
      /Guest:\s*([^-–—\n\r]+)/i, // "Guest: Name" pattern
      /Reserved by\s*([^-–—\n\r]+)/i, // "Reserved by Name" pattern
      /Booking for\s*([^-–—\n\r]+)/i, // "Booking for Name" pattern
    ];
    
    for (const pattern of namePatterns) {
      const match = summary.match(pattern);
      if (match && match[1].trim().length > 0) {
        guestName = match[1].trim();
        break;
      }
    }
    
    // Extract room information
    const roomPatterns = [
      /[\(（]([^\)）]+)[\)）]/, // Parentheses
      /Room:\s*([^-–—\n\r]+)/i, // "Room: info" pattern
      /-([^-–—\n\r]+)$/, // After last dash
    ];
    
    for (const pattern of roomPatterns) {
      const match = summary.match(pattern);
      if (match && match[1].trim().length > 0) {
        roomInfo = match[1].trim();
        break;
      }
    }
    
    // Extract number of guests
    const guestPatterns = [
      /(\d+)\s*(guest|guests|person|people)/i,
      /(\d+)\s*guests?/i,
      /(\d+)\s*people/i,
      /(\d+)\s*person/i,
    ];
    
    for (const pattern of guestPatterns) {
      const match = summary.match(pattern);
      if (match) {
        numGuests = parseInt(match[1]);
        break;
      }
    }
    
    // Extract reservation code if present
    const codePatterns = [
      /(?:reservation|booking|confirmation)\s*[#:]?\s*([A-Z0-9]+)/i,
      /#([A-Z0-9]+)/i,
      /([A-Z]{2,}\d+)/i, // Pattern like "AB123"
    ];
    
    for (const pattern of codePatterns) {
      const match = summary.match(pattern);
      if (match) {
        reservationCode = match[1];
        break;
      }
    }
  }

  // Enhanced parsing for description field
  if (event.description) {
    const desc = event.description;
    
    // Extract email with multiple patterns
    // AIRBNB LIMITATION: Email addresses rarely available in iCal feeds
    const emailPatterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      /Email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /Contact:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    ];
    
    for (const pattern of emailPatterns) {
      const match = desc.match(pattern);
      if (match) {
        email = match[0] || match[1];
        break;
      }
    }
    
    // Extract phone number with multiple patterns
    // AIRBNB LIMITATION: Phone numbers rarely available in iCal feeds
    const phonePatterns = [
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /Phone:\s*((?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i,
      /Contact:\s*((?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i,
      /Tel:\s*((?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i,
    ];
    
    for (const pattern of phonePatterns) {
      const match = desc.match(pattern);
      if (match) {
        phone = match[0] || match[1];
        break;
      }
    }
    
    // Extract amount with multiple patterns
    // AIRBNB LIMITATION: Payment amounts not available in iCal feeds
    const amountPatterns = [
      /(?:total|amount|price|cost)[:\s]*[\$₹€£]?(\d+(?:[.,]\d{2})?)/i,
      /[\$₹€£](\d+(?:[.,]\d{2})?)/,
      /(\d+(?:[.,]\d{2})?)\s*(?:USD|INR|EUR|GBP)/i,
      /Total:\s*[\$₹€£]?(\d+(?:[.,]\d{2})?)/i,
    ];
    
    for (const pattern of amountPatterns) {
      const match = desc.match(pattern);
      if (match) {
        totalAmount = parseFloat(match[1].replace(',', ''));
        break;
      }
    }
    
    // If guest name not found in summary, try description
    if (!guestName) {
      const descNamePatterns = [
        /Guest:\s*([^-–—\n\r]+)/i,
        /Name:\s*([^-–—\n\r]+)/i,
        /Booked by:\s*([^-–—\n\r]+)/i,
        /Reserved by:\s*([^-–—\n\r]+)/i,
      ];
      
      for (const pattern of descNamePatterns) {
        const match = desc.match(pattern);
        if (match && match[1].trim().length > 0) {
          guestName = match[1].trim();
          break;
        }
      }
    }
    
    // Try to extract reservation code from description if not found in summary
    if (!reservationCode) {
      const descCodePatterns = [
        /(?:reservation|booking|confirmation)\s*[#:]?\s*([A-Z0-9]+)/i,
        /#([A-Z0-9]+)/i,
        /([A-Z]{2,}\d+)/i,
      ];
      
      for (const pattern of descCodePatterns) {
        const match = desc.match(pattern);
        if (match) {
          reservationCode = match[1];
          break;
        }
      }
    }
  }

  // Determine status
  let status: 'confirmed' | 'pending' | 'cancelled' = 'confirmed';
  if (event.status === 'CANCELLED' || event.status === 'TENTATIVE') {
    status = event.status === 'CANCELLED' ? 'cancelled' : 'pending';
  }

  // Create booking with enhanced data and placeholders for missing information
  const booking = {
    id: event.uid,
    start: event.start,
    end: event.end,
    guestName: guestName || 'Airbnb Guest', // Fallback for missing guest name
    roomInfo: roomInfo || 'Room', // Fallback for missing room info
    numGuests: numGuests || 2, // Default guest count (AIRBNB LIMITATION: not available in iCal)
    phone: phone || 'N/A - Not available in iCal', // AIRBNB LIMITATION: phone not in iCal
    email: email || 'N/A - Not available in iCal', // AIRBNB LIMITATION: email not in iCal
    totalAmount: totalAmount || 0, // AIRBNB LIMITATION: payment amounts not in iCal
    status,
    // Enhanced fields for future API integration
    reservationCode: reservationCode || event.uid, // Use UID as fallback
    originalSummary: event.summary,
    originalDescription: event.description,
    originalStatus: event.status,
    // Metadata for tracking data source and limitations
    dataSource: 'airbnb_ical',
    dataLimitations: {
      email: !email,
      phone: !phone,
      paymentAmount: !totalAmount,
      guestCount: !numGuests,
      detailedGuestInfo: true // Always true for iCal limitation
    }
  };

  return booking;
}

/**
 * Convert Airbnb booking to calendar event with enhanced visual differentiation
 * 
 * COLOR CODING:
 * ============
 * - Red: Confirmed bookings (both website and Airbnb)
 * - Gray: Airbnb blocked dates ("Not available")
 * - Blue: Manual blocked dates (admin panel)
 * - Yellow: Pending bookings
 */
export function convertAirbnbBookingToCalendarEvent(
  booking: AirbnbBooking,
  roomId?: number,
  roomName?: string
): CalendarEvent {
  let backgroundColor = '#ef4444'; // Red for confirmed Airbnb bookings
  let borderColor = '#dc2626';
  let title = booking.guestName || 'Airbnb Guest';
  let icon = '🏠'; // Airbnb icon

  if (booking.status === 'cancelled') {
    backgroundColor = '#6b7280'; // Gray for cancelled
    borderColor = '#4b5563';
    title = `${booking.guestName || 'Airbnb Guest'} - Cancelled`;
    icon = '❌';
  } else if (booking.status === 'pending') {
    backgroundColor = '#f59e0b'; // Yellow for pending
    borderColor = '#d97706';
    title = `${booking.guestName || 'Airbnb Guest'} - Pending`;
    icon = '⏳';
  }

  // Use roomName if provided, otherwise use booking.roomInfo, otherwise use default
  const displayRoomInfo = roomName || booking.roomInfo || 'Room';
  if (displayRoomInfo) {
    title = `${title} (${displayRoomInfo})`;
  }

  return {
    id: `airbnb-${booking.id}`,
    title: `${icon} ${title}`,
    start: booking.start,
    end: booking.end,
    backgroundColor,
    borderColor,
    textColor: '#FFFFFF',
    extendedProps: {
      source: 'Airbnb' as const,
      roomId: roomId || 0,
      guestName: booking.guestName,
      numGuests: booking.numGuests,
      phone: booking.phone,
      email: booking.email,
      isReadOnly: true,
      booking: booking as any,
      type: 'booking' as const,
      bookingStatus: booking.status,
      paymentStatus: booking.status === 'confirmed' ? 'paid' : 'pending',
      platform: 'Airbnb',
      roomInfo: displayRoomInfo,
      totalAmount: booking.totalAmount,
      // Enhanced metadata
      reservationCode: (booking as any).reservationCode,
      originalSummary: (booking as any).originalSummary,
      originalDescription: (booking as any).originalDescription,
      dataSource: (booking as any).dataSource,
      dataLimitations: (booking as any).dataLimitations
    },
    allDay: true
  };
}

/**
 * Convert Airbnb blocked date to calendar event with proper color coding
 * 
 * COLOR CODING:
 * ============
 * - Gray: Airbnb blocked dates ("Not available")
 * - Blue: Manual blocked dates (admin panel)
 */
export function convertAirbnbBlockedDateToCalendarEvent(
  blockedDate: AirbnbBlockedDate,
  rooms: Room[] = []
): CalendarEvent {
  const room = rooms.find(r => r.id === blockedDate.roomId);
  const roomName = room ? room.name : `Room ${blockedDate.roomId}`;
  
  return {
    id: `blocked-${blockedDate.roomId}-${blockedDate.start}`,
    title: `🚫 Airbnb Blocked - ${roomName}`,
    start: blockedDate.start,
    end: blockedDate.end,
    allDay: true,
    backgroundColor: '#6B7280', // Gray for Airbnb blocked dates
    borderColor: '#4B5563', // Darker gray border
    textColor: '#FFFFFF', // White text
    extendedProps: {
      type: 'blocked',
      roomId: blockedDate.roomId,
      source: 'Airbnb',
      reason: blockedDate.reason,
      roomName: roomName,
      blockedSource: 'airbnb_blocked' // Track source for visual differentiation
    }
  };
}

export const fetchAirbnbICal = async (icalUrl: string): Promise<string> => {
  try {
    // Use the Netlify function to proxy the request
    const proxyUrl = `/.netlify/functions/fetch-airbnb-ical?icalUrl=${encodeURIComponent(icalUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const icalData = await response.text();
    
    return icalData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch Airbnb calendar data: ${errorMessage}`);
  }
};

export async function getAirbnbBookings(icalUrl: string): Promise<AirbnbBooking[]> {
  try {
    const icalData = await fetchAirbnbICal(icalUrl);
    const { bookings } = parseAirbnbICal(icalData);
    return bookings;
  } catch (error) {
    throw error;
  }
}

export async function getAirbnbBlockedDates(icalUrl: string): Promise<AirbnbBlockedDate[]> {
  try {
    const icalData = await fetchAirbnbICal(icalUrl);
    const { blockedDates } = parseAirbnbICal(icalData);
    return blockedDates;
  } catch (error) {
    throw error;
  }
}

// Cache for Airbnb data to prevent redundant API calls
const airbnbDataCache = new Map<string, { data: RoomAirbnbData[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // Maximum number of cache entries
const MAX_CACHE_AGE = 30 * 60 * 1000; // 30 minutes - auto-cleanup old entries

/**
 * Clean up old and excess cache entries to prevent memory leaks
 */
function cleanupCache(): void {
  const now = Date.now();
  
  // Remove entries older than MAX_CACHE_AGE
  for (const [key, value] of airbnbDataCache.entries()) {
    if (now - value.timestamp > MAX_CACHE_AGE) {
      airbnbDataCache.delete(key);
    }
  }
  
  // If still too many entries, remove oldest ones
  if (airbnbDataCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(airbnbDataCache.entries());
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    // Remove oldest entries
    const toRemove = entries.slice(0, airbnbDataCache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => {
      airbnbDataCache.delete(key);
    });
  }
}

export async function getAllRoomAirbnbData(): Promise<RoomAirbnbData[]> {
  try {
    // Clean up cache before checking (prevents memory leaks)
    cleanupCache();
    
    const settings = await api.getCalendarSettings();
    const roomData: RoomAirbnbData[] = [];
    
    // Group settings by room
    const roomConfigs = new Map<number, string>();
    settings.forEach(setting => {
      if (setting.setting_key.startsWith('airbnb_room_') && !setting.setting_key.includes('_last_sync')) {
        const roomId = parseInt(setting.setting_key.replace('airbnb_room_', ''));
        // Only include rooms with non-empty iCal URLs
        if (setting.setting_value && setting.setting_value.trim() !== '') {
          roomConfigs.set(roomId, setting.setting_value);
        }
      }
    });
    
    if (roomConfigs.size === 0) {
      return []; // Return empty array immediately if no URLs configured
    }
    
    // Check cache first
    const cacheKey = Array.from(roomConfigs.entries()).map(([id, url]) => `${id}:${url}`).join('|');
    const cached = airbnbDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // Fetch data for each room in parallel for better performance
    const fetchPromises = Array.from(roomConfigs.entries()).map(async ([roomId, icalUrl]) => {
      if (!icalUrl || !icalUrl.trim()) return null;
      
      try {
        const icalData = await fetchAirbnbICal(icalUrl);
        const { bookings, blockedDates } = parseAirbnbICal(icalData);
        
        // Assign room ID to bookings and blocked dates
        const roomBookings = bookings.map(booking => ({ ...booking, roomId }));
        const roomBlockedDates = blockedDates.map(blocked => ({ ...blocked, roomId }));
        
        return {
          roomId,
          bookings: roomBookings,
          blockedDates: roomBlockedDates
        };
      } catch (error) {
        return null;
      }
    });
    
    // Wait for all fetches to complete
    const results = await Promise.all(fetchPromises);
    
    // Filter out null results and add to roomData
    results.forEach(result => {
      if (result) {
        roomData.push(result);
      }
    });
    
    // Cache the results
    airbnbDataCache.set(cacheKey, { data: roomData, timestamp: Date.now() });
    
    // Clean up cache after adding new entry
    cleanupCache();
    
    return roomData;
  } catch (error) {
    throw error;
  }
}

// Function to clear cache when needed
export function clearAirbnbDataCache(): void {
  airbnbDataCache.clear();
}

export function mergeBookings(websiteBookings: CalendarEvent[], airbnbBookings: CalendarEvent[]): CalendarEvent[] {
  const allBookings = [...websiteBookings, ...airbnbBookings];
  return allBookings.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
} 

// Debug function to test guest information extraction
export function debugAirbnbParsing(icalData: string) {
  
  // Analyze the raw iCal structure
  analyzeICalStructure(icalData);
  
  const { bookings, blockedDates } = parseAirbnbICal(icalData);
  
  
  bookings.forEach((booking, index) => {
  });
  
  blockedDates.forEach((blocked, index) => {
  });
  
  return { bookings, blockedDates };
}

// New function to analyze the structure of Airbnb iCal data
function analyzeICalStructure(icalData: string) {
  
  const events = icalData.split('BEGIN:VEVENT');
  
  // Categorize events by their patterns
  const categorizedEvents: {
    bookings: Array<{ index: number; summary: string; description: string; status: string }>;
    blocked: Array<{ index: number; summary: string; description: string; status: string }>;
    unknown: Array<{ index: number; summary: string; description: string; status: string }>;
  } = {
    bookings: [],
    blocked: [],
    unknown: []
  };
  
  events.forEach((event, index) => {
    if (index === 0) return; // Skip header
    
    
    // Extract all possible fields
    const fields = {
      summary: event.match(/SUMMARY:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      description: event.match(/DESCRIPTION:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      start: event.match(/DTSTART[^:]*:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      end: event.match(/DTEND[^:]*:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      uid: event.match(/UID:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      status: event.match(/STATUS:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      location: event.match(/LOCATION:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      created: event.match(/CREATED:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      lastModified: event.match(/LAST-MODIFIED:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      sequence: event.match(/SEQUENCE:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      transp: event.match(/TRANSP:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      class: event.match(/CLASS:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      priority: event.match(/PRIORITY:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      categories: event.match(/CATEGORIES:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      url: event.match(/URL:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      organizer: event.match(/ORGANIZER:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
      attendee: event.match(/ATTENDEE:(.*?)(?:\r?\n|$)/)?.[1]?.trim(),
    };
    
    // Log all non-empty fields
    Object.entries(fields).forEach(([key, value]) => {
      if (value) {
      }
    });
    
    // Look for any other custom fields that might be Airbnb-specific
    const customFields = event.match(/X-[^:]+:(.*?)(?:\r?\n|$)/g);
    if (customFields && customFields.length > 0) {
      customFields.forEach(field => {
      });
    }
    
    // Categorize this event based on its content
    const summary = fields.summary || '';
    const description = fields.description || '';
    const status = fields.status || '';
    
    // Simple categorization for analysis
    if (summary.toLowerCase().includes('blocked') || summary.toLowerCase().includes('unavailable') || summary.toLowerCase().includes('not available')) {
      categorizedEvents.blocked.push({ index, summary, description, status });
    } else if (summary.toLowerCase().includes('reserved') || summary.toLowerCase().includes('booking') || summary.toLowerCase().includes('guest') || /^[A-Z][a-z]+/.test(summary)) {
      categorizedEvents.bookings.push({ index, summary, description, status });
    } else {
      categorizedEvents.unknown.push({ index, summary, description, status });
    }
  });
  
  // Summary of categorization
  
  if (categorizedEvents.bookings.length > 0) {
    categorizedEvents.bookings.slice(0, 3).forEach(event => {
    });
  }
  
  if (categorizedEvents.blocked.length > 0) {
    categorizedEvents.blocked.slice(0, 3).forEach(event => {
    });
  }
  
  if (categorizedEvents.unknown.length > 0) {
    categorizedEvents.unknown.slice(0, 3).forEach(event => {
    });
  }
}

export async function checkAirbnbAvailability(
  checkIn: string, 
  checkOut: string,
  icalUrl?: string
): Promise<{ available: boolean; reason: string; conflicts: any[] }> {
  try {
    if (!icalUrl) {
      return { available: true, reason: 'no_airbnb_sync', conflicts: [] };
    }

    // Fetch Airbnb data
    const icalData = await fetchAirbnbICal(icalUrl);
    const { bookings, blockedDates } = parseAirbnbICal(icalData);

    // Check for booking conflicts
    const bookingConflicts = bookings.filter(booking => {
      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      return (
        (bookingStart <= checkInDate && bookingEnd > checkInDate) ||
        (bookingStart < checkOutDate && bookingEnd >= checkOutDate) ||
        (bookingStart >= checkInDate && bookingEnd <= checkOutDate)
      );
    });

    if (bookingConflicts.length > 0) {
      return {
        available: false,
        reason: 'airbnb_booking_conflict',
        conflicts: bookingConflicts
      };
    }

    // Check for blocked date conflicts
    const blockedConflicts = blockedDates.filter(blocked => {
      const blockedStart = new Date(blocked.start);
      const blockedEnd = new Date(blocked.end);
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      return (
        (blockedStart <= checkInDate && blockedEnd > checkInDate) ||
        (blockedStart < checkOutDate && blockedEnd >= checkOutDate) ||
        (blockedStart >= checkInDate && blockedEnd <= checkOutDate)
      );
    });

    if (blockedConflicts.length > 0) {
      return {
        available: false,
        reason: 'airbnb_blocked_dates',
        conflicts: blockedConflicts
      };
    }

    return {
      available: true,
      reason: 'available',
      conflicts: []
    };

  } catch (error) {
    // If we can't check Airbnb availability, assume it's available
    return { available: true, reason: 'airbnb_check_failed', conflicts: [] };
  }
} 
