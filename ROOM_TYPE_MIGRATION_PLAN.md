# Room Type System Migration Plan

## Overview
Migrate from individual room tracking to room type system with quantity management.

## Current System
- Each room is a separate database entry (Room 101, Room 102, etc.)
- Bookings reference specific room IDs
- Availability checked per individual room

## New System
- Room types (e.g., "Deluxe Suite", "Premium Room")
- Each room type has a quantity (number of rooms available)
- Bookings reference room type + check availability against quantity
- Calendar shows aggregate availability for room type

## Database Changes

### 1. Add `quantity` column to rooms table
```sql
ALTER TABLE rooms ADD COLUMN quantity INTEGER DEFAULT 1;
```

### 2. Update room_number to be optional (since we're tracking types, not individual rooms)
```sql
ALTER TABLE rooms ALTER COLUMN room_number DROP NOT NULL;
```

### 3. Add index for better performance
```sql
CREATE INDEX IF NOT EXISTS idx_rooms_quantity ON rooms(quantity);
```

## Application Changes

### 1. Admin Room Management (`src/pages/AdminRooms.tsx`)
- Add "Number of Rooms" field to the form
- Display quantity in the rooms table
- Update create/edit logic to handle quantity

### 2. Room Display (`src/pages/Rooms.tsx`)
- Show "X rooms available" instead of individual room numbers
- Update room cards to display quantity

### 3. Room Detail Page (`src/pages/RoomDetail.tsx`)
- Check availability against quantity (not individual room)
- Show "X rooms available for these dates"

### 4. Booking System
- When booking, check if quantity of available rooms > number of confirmed bookings for those dates
- Update availability logic in `src/lib/supabase.ts`

### 5. Admin Calendar (`src/pages/AdminCalendar.tsx`)
- Show aggregate bookings for room type
- Display "2/5 rooms booked" style indicators

### 6. Admin Bookings (`src/pages/AdminBookings.tsx`)
- Display room type name instead of room number
- Update booking display logic

## Migration Strategy

### Phase 1: Database Update
1. Add quantity column
2. Set quantity = 1 for all existing rooms (backward compatible)
3. Make room_number optional

### Phase 2: UI Updates
1. Update admin room management
2. Update room display pages
3. Update booking flow

### Phase 3: Availability Logic
1. Update checkRoomAvailability to count bookings vs quantity
2. Update calendar to show aggregate availability
3. Update booking creation to handle room types

### Phase 4: Testing
1. Test room type creation with quantity
2. Test booking with multiple rooms of same type
3. Test availability checking
4. Test calendar display

## Backward Compatibility
- Existing rooms will have quantity = 1
- Existing bookings will continue to work
- room_number field kept for reference but not required

## Implementation Order
1. Run database migration SQL
2. Update Room interface in supabase.ts
3. Update AdminRooms.tsx
4. Update availability checking logic
5. Update frontend display pages
6. Test thoroughly
