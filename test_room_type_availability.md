# Room Type System - Testing Guide

## Database Migration Status: ✅ COMPLETE
- Quantity column added to rooms table
- Room_number made optional
- All existing rooms have quantity = 1
- Constraint added for positive quantity

## What to Test Now:

### 1. Create Room Type with Quantity > 1
1. Go to Admin Panel → Room Type Management
2. Click "Add New Room Type"
3. Fill in details:
   - Room Type Name: "Deluxe Suite"
   - Number of Rooms: 3
   - Price per Night: 2500
   - Max Occupancy: 2
   - Add at least one image URL
4. Click Save

### 2. Verify Room Type Display
- Check table shows "3 rooms" badge
- Verify room type appears in list

### 3. Test Booking Flow (Localhost)
1. Go to Rooms page
2. Click on your new "Deluxe Suite"
3. Select dates
4. Fill booking form
5. Click "Proceed to Pay"

**Expected Result on Localhost:**
- Booking created instantly (no Razorpay)
- Confirmation page shown
- Booking appears in admin bookings

### 4. Test Availability Tracking
1. Make first booking for "Deluxe Suite" on specific dates
2. Try to make second booking for same dates
3. System should allow it (2 rooms still available)
4. Make third booking
5. Try fourth booking - should fail or show "All rooms booked"

### 5. Check Admin Bookings
1. Go to Admin → Bookings
2. Verify bookings show correct room type
3. Check booking details modal

## Quick Verification Queries (Run in Supabase SQL Editor):

```sql
-- Check if quantity column exists and has data
SELECT id, name, room_number, quantity, is_active 
FROM rooms 
ORDER BY id 
LIMIT 10;

-- Check if bookings still work
SELECT COUNT(*) as total_bookings FROM bookings;

-- Check room type with quantity > 1
SELECT * FROM rooms WHERE quantity > 1;
```

## Expected Behavior:

### Before Fix (Old System):
- Each room treated as individual entity
- If Room 101 booked, Room 102 still available (even if same type)
- No concept of "room types with quantity"

### After Fix (New System):
- Room types with quantity tracking
- "Deluxe Suite" with quantity = 3
- 1 booking → 2 rooms still available
- 3 bookings → all rooms booked
- 4th booking attempt → fails/shows unavailable

## Troubleshooting:

### If bookings don't work:
1. Check browser console for errors
2. Verify API calls are successful
3. Check if room is_active = true

### If quantity not showing:
1. Refresh admin page
2. Check database has quantity column
3. Verify room has quantity > 0

### If localhost bypass not working:
1. Make sure you're on `localhost:5173` or `127.0.0.1`
2. Check browser console for "localhost mode" message
3. Verify processPayment function has localhost check

## Success Indicators:
✅ Room type created with quantity = 3  
✅ Table shows "3 rooms" badge  
✅ Booking works on localhost (no payment)  
✅ Multiple bookings allowed for same room type  
✅ Availability messages show correct count  
✅ Admin bookings show room type name  

The system is now ready to use with proper room type quantity tracking!