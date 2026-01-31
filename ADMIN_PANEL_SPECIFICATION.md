# Admin Panel Complete Specification

## 📋 Overview

This document contains **everything needed** to build the admin panel with the same functionality and features, but with a custom UI that matches your project's theme (dark blue & golden color scheme).

**Note:** This specification does NOT include UI code - only functionality, API calls, data structures, and feature requirements.

---

## 🎨 Theme Colors Reference

Use these colors from `tailwind.config.js`:
- **Primary Dark Blue:** `#0d2d7a` (dark-blue-500)
- **Deep Dark Blue:** `#040f32` (dark-blue-800) - for backgrounds
- **Primary Golden:** `#d4af37` (golden-500)
- **Gradients:** `gradient-luxury`, `gradient-ocean`, `gradient-forest`, `gradient-golden`

---

## 🔐 Authentication System

### Authentication Flow
1. **Login Page** (`/login`)
   - Email and password fields
   - Calls: `/.netlify/functions/simple-login` with `{ action: 'login', email, password }`
   - **Security:** Only users with `is_admin: true` can access admin panel
   - On success: Store user in `localStorage` as `resort_session`
   - Redirect to `/admin` on successful login

2. **Session Management**
   - Check `localStorage.getItem('resort_session')` on app load
   - Validate user has `is_admin: true`
   - If invalid, clear session and redirect to `/login`

3. **Logout**
   - Clear `localStorage.removeItem('resort_session')`
   - Redirect to `/login`

### Auth API Functions
```javascript
// Login
POST /.netlify/functions/simple-login
Body: { action: 'login', email, password }
Returns: { user: { id, email, first_name, last_name, is_admin, ... } }

// Register (if needed)
POST /.netlify/functions/simple-login
Body: { action: 'register', userData: { email, password, first_name, last_name } }

// Update Profile
POST /.netlify/functions/simple-login
Body: { action: 'updateProfile', userData: { id, ...updates } }

// Change Password
POST /.netlify/functions/simple-login
Body: { action: 'changePassword', userData: { id, current_password, new_password } }
```

---

## 📊 Admin Routes & Pages

### Route Structure
All admin routes are under `/admin` prefix and require authentication.

```
/admin                    → Dashboard
/admin/rooms             → Room Management
/admin/bookings           → Booking Management
/admin/calendar           → Calendar View
/admin/reviews            → Reviews/Testimonials
/admin/profile            → Admin Profile
/admin/attractions        → Tourist Attractions
/admin/features           → Features Management
/admin/faq                → FAQ Management
/admin/house-rules        → House Rules
/admin/maintenance        → Maintenance Mode Control
```

---

## 1. Dashboard (`/admin`)

### Features
- Display statistics cards
- Quick action links
- Booking status overview
- System status indicators

### API Calls
```javascript
api.getDashboardStats()
// Returns: { totalBookings, confirmedBookings, pendingBookings, totalRooms, totalUsers }

api.getBookings()
// Returns: Array of all bookings
```

### Statistics to Display
1. **Total Bookings** - Count from `getDashboardStats()`
2. **Revenue Generated** - Sum of `total_amount` from confirmed bookings
3. **Active Bookings** - Count of confirmed bookings
4. **Total Rooms** - Count of active rooms

### Quick Actions
- Link to `/admin/bookings` - "Manage Bookings"
- Link to `/admin/rooms` - "Room Management"
- Link to `/admin/reviews` - "Guest Reviews"
- Link to `/` - "View Website" (opens in new tab)

### Booking Status Overview
- **Confirmed** - Count of bookings with `booking_status: 'confirmed'`
- **Pending** - Count of bookings with `booking_status: 'pending'`
- **Completed** - Calculated: `totalBookings - confirmedBookings - pendingBookings`

### System Status
- Website Status: Always "Online" (green indicator)
- Booking System: Always "Active" (green indicator)
- Payment Gateway: Always "Connected" (green indicator)

---

## 2. Room Management (`/admin/rooms`)

### Features
- List all rooms (active and inactive)
- Add new room
- Edit existing room
- Delete room
- Toggle room active/inactive status
- Manage room images (multiple images per room)
- Set occupancy-based pricing
- Set global check-in/check-out times

### API Calls
```javascript
// Get all rooms
api.getAllRooms()
// Returns: Array<Room>

// Create room
api.createRoom(roomData)
// roomData: {
//   room_number: string,
//   name: string,
//   description: string,
//   price_per_night: number,
//   max_occupancy: number,
//   amenities: string[],
//   image_url: string,
//   images: string[], // Array of image URLs
//   is_active: boolean,
//   accommodation_details?: string,
//   floor?: number,
//   check_in_time?: string,
//   check_out_time?: string,
//   price_double_occupancy?: number,
//   price_triple_occupancy?: number,
//   price_four_occupancy?: number,
//   extra_mattress_price?: number
// }

// Update room
api.updateRoom(id, updates)
// Same structure as createRoom

// Delete room
api.deleteRoom(id)

// Update room with automatic slug generation
api.updateRoomWithSlug(id, updates)
```

### Room Data Structure
```typescript
interface Room {
  id: number
  room_number: string
  name: string
  slug?: string // Auto-generated cryptic slug
  description: string
  price_per_night: number
  max_occupancy: number
  amenities?: string[]
  image_url: string // Primary image (deprecated, use images array)
  images?: string[] // Array of image URLs (preferred)
  is_active: boolean
  is_available: boolean
  extra_guest_price?: number // Deprecated
  accommodation_details?: string
  floor?: number
  check_in_time?: string // e.g., '14:00' or '2:00 PM'
  check_out_time?: string // e.g., '10:00 AM'
  price_double_occupancy?: number
  price_triple_occupancy?: number
  price_four_occupancy?: number
  extra_mattress_price?: number // Default: 200
  created_at: string
}
```

### Form Fields Required
1. **Basic Info:**
   - Room Number (required, unique)
   - Room Name (required)
   - Description (required, textarea)
   - Floor (optional, number)

2. **Pricing:**
   - Base Price Per Night (required, number)
   - Price for 2 Guests (optional)
   - Price for 3 Guests (optional)
   - Price for 4 Guests (optional)
   - Extra Mattress Price (default: 200)

3. **Details:**
   - Max Occupancy (required, number)
   - Amenities (comma-separated or array input)
   - Accommodation Details (optional, textarea)

4. **Images:**
   - Primary Image URL (optional)
   - Multiple Images (array of URLs, can add/remove/reorder)

5. **Settings:**
   - Active Status (toggle)
   - Check-in Time (optional, text input)
   - Check-out Time (optional, text input)

### Global Check-in/Check-out Times
- Store in `localStorage`:
  - `globalCheckInTime`
  - `globalCheckOutTime`
- Can be set once and applied to all rooms
- Display in UI as optional quick-set feature

### Image Management
- Support multiple images per room
- Allow adding/removing image fields
- Allow reordering images (drag-and-drop or up/down buttons)
- Validate image URLs before saving
- Show preview of first valid image

### Validation Rules
- Room number: Required, must be unique
- Room name: Required
- Description: Required
- Price per night: Required, must be positive number
- Max occupancy: Required, must be positive integer

---

## 3. Booking Management (`/admin/bookings`)

### Features
- List all bookings (website bookings)
- Search bookings (by guest name, email, phone, room name)
- Filter by status (all, pending, confirmed, cancelled)
- Filter by source (all, website)
- View booking details
- Edit booking details
- Update booking status
- Update payment status
- Delete booking
- Bulk operations (select multiple bookings)

### API Calls
```javascript
// Get all bookings
api.getBookings()
// Returns: Array<Booking> with room relation

// Get single booking
api.getBooking(id)
// Returns: Booking with room relation

// Create booking
api.createBooking(bookingData)
// bookingData: {
//   room_id: number,
//   check_in_date: string (YYYY-MM-DD),
//   check_out_date: string (YYYY-MM-DD),
//   num_guests: number,
//   first_name: string,
//   last_name: string,
//   email: string,
//   phone: string,
//   special_requests?: string,
//   total_amount: number,
//   booking_status: 'pending' | 'confirmed' | 'cancelled',
//   payment_status: 'pending' | 'paid' | 'failed',
//   payment_gateway: 'direct' | 'razorpay',
//   razorpay_order_id?: string,
//   razorpay_payment_id?: string
// }

// Update booking
api.updateBooking(id, updates)
// Same structure as createBooking

// Cancel booking
api.cancelBooking(id)
// Sets booking_status to 'cancelled'

// Delete booking
api.deleteBooking(id)
```

### Booking Data Structure
```typescript
interface Booking {
  id: number
  room_id: number
  check_in_date: string // YYYY-MM-DD
  check_out_date: string // YYYY-MM-DD
  num_guests: number
  first_name: string
  last_name: string
  email: string
  phone: string
  special_requests?: string
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed'
  payment_gateway: 'direct' | 'razorpay'
  razorpay_order_id?: string
  razorpay_payment_id?: string
  booking_source?: string // 'website'
  created_at: string
  updated_at: string
  room?: Room // Relation
}
```

### Display Columns
1. Checkbox (for bulk selection)
2. Guest Name (first_name + last_name)
3. Room Name
4. Check-in Date
5. Check-out Date
6. Guests (num_guests)
7. Status (booking_status badge)
8. Payment Status (payment_status badge)
9. Total Amount
10. Source (always "Website")
11. Actions (View, Edit, Delete)

### Search Functionality
- Search across: guest name, email, phone, room name
- Real-time filtering as user types

### Filter Options
- **Status Filter:** All, Pending, Confirmed, Cancelled
- **Source Filter:** All, Website

### Booking Details Modal
Display all booking information:
- Guest details (name, email, phone)
- Room information
- Dates (check-in, check-out)
- Number of guests
- Special requests
- Booking status
- Payment status
- Payment gateway info (if Razorpay)
- Total amount
- Booking date (created_at)

### Edit Booking Form
All fields from Booking interface, editable:
- Guest information (first_name, last_name, email, phone)
- Dates (check_in_date, check_out_date)
- Number of guests
- Special requests
- Booking status (dropdown)
- Payment status (dropdown)
- Total amount

### Validation Rules
- Check-in date must be before check-out date
- Check-out date must be after check-in date
- Email must be valid format
- Phone must be provided
- Total amount must be positive number

---

## 4. Calendar View (`/admin/calendar`)

### Features
- Full calendar view of all bookings
- Room filter (all rooms or specific room)
- View blocked dates
- Block dates manually
- Unblock dates
- Color-coded events (bookings vs blocked dates)
- Click date to block/unblock
- View booking details on click

### API Calls
```javascript
// Get all bookings
api.getBookings()

// Get all rooms
api.getRooms()

// Get blocked dates
api.getBlockedDates(roomId?)
// Returns: Array of blocked dates

// Get calendar events for a room
api.getCalendarEvents(roomId)
// Returns: Array of events (bookings + blocked dates)

// Block dates
api.blockDates(blockData)
// blockData: {
//   room_id: string (convert to number),
//   start_date: string (YYYY-MM-DD),
//   end_date: string (YYYY-MM-DD),
//   reason: string,
//   notes?: string,
//   source?: string // Default: 'manual'
// }

// Create blocked date
api.createBlockedDate(blockedDateData)
// Same as blockDates

// Update blocked date
api.updateBlockedDate(id, updates)
// updates: { start_date?, end_date?, reason?, notes? }

// Delete blocked date
api.deleteBlockedDate(id)
```

### Blocked Date Data Structure
```typescript
interface BlockedDate {
  id: number
  room_id: number
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  reason: string
  notes?: string
  source: string // 'manual' | 'external'
  external_id?: string
  platform_data?: any
  created_at: string
}
```

### Calendar Display
- Use FullCalendar component or similar
- Show bookings in one color (e.g., red for confirmed, orange for pending)
- Show blocked dates in another color (e.g., gray)
- Click on date range to open block/unblock modal
- Click on booking to view booking details

### Room Filter
- Dropdown to select room or "All Rooms"
- Filter calendar events based on selection

### Block Dates Modal
Form fields:
- Room (dropdown, required)
- Start Date (date picker, required)
- End Date (date picker, required)
- Reason (text input, required)
- Notes (textarea, optional)

### Unblock Dates
- Only allow unblocking dates with `source: 'manual'`
- Show confirmation dialog before unblocking
- Display blocked date details before unblocking

### Event Colors
- **Confirmed Booking:** Red (#ef4444)
- **Pending Booking:** Orange (#f59e0b)
- **Blocked Date:** Gray (#6b7280)

---

## 5. Reviews Management (`/admin/reviews`)

### Features
- List all testimonials/reviews
- Add new review
- Edit review
- Delete review
- Toggle featured status
- Toggle active status
- Filter by source (website, google)
- Filter by featured status

### API Calls
```javascript
// Get all testimonials
api.getAllTestimonials()
// Returns: Array<Testimonial>

// Get featured testimonials
api.getFeaturedTestimonials()
// Returns: Array<Testimonial> (is_featured: true)

// Create testimonial
api.createTestimonial(testimonialData)
// testimonialData: {
//   guest_name: string,
//   rating: number (1-5),
//   comment: string,
//   is_featured?: boolean,
//   is_active?: boolean
// }

// Update testimonial
api.updateTestimonial(id, updates)
// updates: Partial<Testimonial>

// Delete testimonial
api.deleteTestimonial(id)
```

### Testimonial Data Structure
```typescript
interface Testimonial {
  id: number
  guest_name: string
  rating: number // 1-5
  comment: string
  is_featured: boolean
  is_active: boolean
  source?: 'website' | 'google'
  created_at: string
}
```

### Form Fields
- Guest Name (required)
- Rating (required, 1-5 stars)
- Comment (required, textarea)
- Featured (toggle)
- Active (toggle)
- Source (dropdown: website, google)

### Display Columns
1. Guest Name
2. Rating (stars display)
3. Comment (truncated)
4. Featured (badge)
5. Active (badge)
6. Source (badge)
7. Created Date
8. Actions (Edit, Delete)

### Validation Rules
- Guest name: Required
- Rating: Required, must be 1-5
- Comment: Required, minimum length

---

## 6. Admin Profile (`/admin/profile`)

### Features
- View admin profile information
- Edit profile (name, email, phone, address)
- Change password
- View account information

### API Calls
```javascript
// Get current user (from localStorage)
// No API call needed - use stored session

// Update profile
// Via Netlify function: simple-login with action: 'updateProfile'

// Change password
// Via Netlify function: simple-login with action: 'changePassword'
```

### User Data Structure
```typescript
interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  is_admin: boolean
  created_at: string
}
```

### Profile Form Fields
- First Name (required)
- Last Name (required)
- Email (required, must be valid)
- Phone (optional)
- Address (optional, textarea)
- Username (read-only or editable, check uniqueness)

### Change Password Form
- Current Password (required)
- New Password (required, minimum length validation)
- Confirm New Password (required, must match new password)

### Validation Rules
- Email: Valid email format
- Password: Minimum 6 characters (or your requirement)
- Confirm password: Must match new password

---

## 7. Tourist Attractions (`/admin/attractions`)

### Features
- List all attractions
- Add new attraction
- Edit attraction
- Delete attraction
- Toggle featured status
- Toggle active status
- Manage multiple images per attraction
- Set display order

### API Calls
```javascript
// Get all attractions
api.getAllTouristAttractions()
// Returns: Array<TouristAttraction>

// Get active attractions
api.getTouristAttractions()
// Returns: Array<TouristAttraction> (is_active: true)

// Create attraction
api.createTouristAttraction(attractionData)
// attractionData: {
//   name: string,
//   description: string,
//   image_url?: string,
//   images?: string[], // Array of image URLs
//   location: string,
//   distance_from_resort: number,
//   estimated_time: string,
//   category: string,
//   rating: number (0-5),
//   google_maps_url?: string,
//   is_featured: boolean,
//   is_active: boolean,
//   display_order: number
// }

// Update attraction
api.updateTouristAttraction(id, updates)
// Same structure as create

// Delete attraction
api.deleteTouristAttraction(id)
```

### Attraction Data Structure
```typescript
interface TouristAttraction {
  id: number
  name: string
  description: string
  image_url?: string
  images?: string[] // Array of image URLs
  location: string
  distance_from_resort: number // in km
  estimated_time: string // e.g., '30 minutes', '1 hour'
  category: string
  rating: number // 0-5
  google_maps_url?: string
  is_featured: boolean
  is_active: boolean
  display_order: number
  created_at: string
}
```

### Form Fields
1. **Basic Info:**
   - Name (required)
   - Description (required, textarea)
   - Location (required)
   - Category (required, dropdown or text)

2. **Details:**
   - Distance from Resort (number, in km)
   - Estimated Time (text, e.g., "30 minutes")
   - Rating (number, 0-5)
   - Google Maps URL (optional)

3. **Images:**
   - Primary Image URL (optional)
   - Multiple Images (array of URLs)

4. **Settings:**
   - Featured (toggle)
   - Active (toggle)
   - Display Order (number)

### Image Management
- Support multiple images per attraction
- Add/remove image fields
- Reorder images
- Validate image URLs

### Validation Rules
- Name: Required
- Description: Required
- Location: Required
- Distance: Must be positive number
- Rating: Must be 0-5

---

## 8. Features Management (`/admin/features`)

### Features
- List all features
- Add new feature
- Edit feature
- Delete feature
- Toggle active status
- Toggle featured status
- Filter by category
- Set display order
- Select icon

### API Calls
```javascript
// Get all features
// Direct Supabase query:
supabase.from('features').select('*').order('display_order')

// Create feature
supabase.from('features').insert([featureData])

// Update feature
supabase.from('features').update(updates).eq('id', id)

// Delete feature
supabase.from('features').delete().eq('id', id)
```

### Feature Data Structure
```typescript
interface Feature {
  id: number
  name: string
  description: string
  icon_name: string // Heroicon name
  category: string
  display_order: number
  is_active: boolean
  is_featured: boolean
  created_at?: string
  updated_at?: string
}
```

### Form Fields
- Name (required)
- Description (required, textarea)
- Icon (dropdown of available icons)
- Category (dropdown)
- Display Order (number)
- Active (toggle)
- Featured (toggle)

### Available Categories
- booking
- location
- service
- Connectivity
- Recreation
- Wellness
- Fitness
- Safety
- Business
- Activities
- Transport
- Convenience
- Luxury
- Family
- Culture
- general

### Available Icons (Heroicons)
- StarIcon
- CheckCircleIcon
- CalendarIcon
- MapPinIcon
- WifiIcon
- BeakerIcon
- SparklesIcon
- CakeIcon
- HeartIcon
- ShieldCheckIcon
- ClockIcon
- UserGroupIcon
- SunIcon
- MapIcon
- TruckIcon
- CreditCardIcon
- UserIcon

### Validation Rules
- Name: Required
- Description: Required
- Icon: Required
- Category: Required

---

## 9. FAQ Management (`/admin/faq`)

### Features
- List all FAQs
- Add new FAQ
- Edit FAQ
- Delete FAQ
- Toggle active status
- Reorder FAQs (drag-and-drop)
- Set order number

### API Calls
```javascript
// Get all FAQs
supabase.from('faqs').select('*').order('order_num', { ascending: true })

// Create FAQ
supabase.from('faqs').insert([{
  question: string,
  answer: string,
  order_num: number,
  is_active: boolean,
  created_at: timestamp,
  updated_at: timestamp
}])

// Update FAQ
supabase.from('faqs').update(updates).eq('id', id)

// Delete FAQ
supabase.from('faqs').delete().eq('id', id)
```

### FAQ Data Structure
```typescript
interface FAQ {
  id: number
  question: string
  answer: string
  order_num: number
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### Form Fields
- Question (required, textarea)
- Answer (required, textarea)
- Active (toggle)
- Order Number (auto-calculated or manual)

### Drag-and-Drop
- Allow reordering FAQs
- Update `order_num` when order changes
- Save order to database

### Validation Rules
- Question: Required
- Answer: Required

---

## 10. House Rules (`/admin/house-rules`)

### Features
- View house rules
- Edit house rules
- Add new rule
- Delete rule
- Reorder rules

### API Calls
```javascript
// Get house rules
// Direct Supabase query:
supabase.from('house_rules').select('*').order('display_order')

// Create rule
supabase.from('house_rules').insert([ruleData])

// Update rule
supabase.from('house_rules').update(updates).eq('id', id)

// Delete rule
supabase.from('house_rules').delete().eq('id', id)
```

### House Rule Data Structure
```typescript
interface HouseRule {
  id: number
  title: string
  description: string
  icon?: string
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}
```

### Form Fields
- Title (required)
- Description (required, textarea)
- Icon (optional)
- Display Order (number)
- Active (toggle)

---

## 11. Maintenance Mode (`/admin/maintenance`)

### Features
- View current maintenance mode status
- Toggle maintenance mode on/off
- Show preview of maintenance page
- Display status indicator

### API Calls
```javascript
// Get maintenance mode
api.getMaintenanceMode()
// Returns: boolean

// Set maintenance mode
api.setMaintenanceMode(enabled)
// enabled: boolean
```

### Implementation
- Maintenance mode stored in `calendar_settings` table
- Setting key: `'maintenance_mode'`
- Setting value: `'true'` or `'false'`

### Status Display
- Show current status (Active/Inactive)
- Color indicator (green for inactive, red for active)
- Confirmation dialog before toggling

### How It Works
- When enabled: Homepage shows maintenance page
- Admin panel remains accessible
- Other pages accessible via direct URLs
- Status syncs across all devices (stored in database)

---

## 12. Additional Features

### Social Media Links (`/admin/social-media`)
**Note:** Route not in main app, but functionality exists

- List all social media links
- Add/edit/delete links
- Set display order
- Toggle active status

**API:**
```javascript
api.getAllSocialMediaLinks()
api.createSocialMediaLink(linkData)
api.updateSocialMediaLink(id, updates)
api.deleteSocialMediaLink(id)
```

### WhatsApp Management (`/admin/whatsapp`)
**Note:** Route not in main app, but functionality exists

- View WhatsApp sessions
- View messages
- Create/update sessions
- Create messages

**API:**
```javascript
api.getWhatsAppSessions()
api.getWhatsAppMessages(sessionId)
api.createWhatsAppSession(sessionData)
api.createWhatsAppMessage(messageData)
```

### User Management (`/admin/users`)
**Note:** Route not in main app, but functionality exists

- List all users
- View user details
- Update user role (admin/non-admin)
- Delete users

**API:**
```javascript
api.getAllUsers()
api.updateUserRole(userId, isAdmin)
api.getUserByEmail(email)
```

---

## 🔧 Common Functionality Across All Pages

### Loading States
- Show loading spinner while fetching data
- Disable forms/buttons during API calls
- Show skeleton loaders for lists

### Error Handling
- Display toast notifications for errors
- Show user-friendly error messages
- Log errors to console for debugging

### Success Messages
- Show toast notifications on successful operations
- Auto-dismiss after 3-5 seconds

### Form Validation
- Client-side validation before submission
- Show validation errors inline
- Disable submit button until form is valid

### Confirmation Dialogs
- Show confirmation before delete operations
- Show confirmation before destructive actions
- Allow cancel option

### Search & Filter
- Real-time search (debounced)
- Multiple filter options
- Clear filters button
- Show active filter count

### Pagination (if needed)
- For large lists, implement pagination
- Show items per page selector
- Show total count

### Responsive Design
- Mobile-friendly layouts
- Collapsible sidebar on mobile
- Stack columns on small screens

---

## 📦 Required Dependencies

### Core Libraries
```json
{
  "@supabase/supabase-js": "^2.55.0",
  "react": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "react-hot-toast": "^2.4.1",
  "date-fns": "^2.30.0",
  "@fullcalendar/react": "^6.1.18",
  "@fullcalendar/daygrid": "^6.1.18",
  "@fullcalendar/interaction": "^6.1.18"
}
```

### UI Libraries (Optional - use your own)
- Tailwind CSS (already configured)
- Heroicons (for icons)
- Any animation library (framer-motion, GSAP, etc.)

---

## 🗄️ Database Tables Reference

### Required Tables
1. **users** - User accounts
2. **rooms** - Room information
3. **bookings** - Booking records
4. **blocked_dates** - Manually blocked dates
5. **facilities** - Resort facilities
6. **features** - Feature list
7. **testimonials** - Guest reviews
8. **contact_messages** - Contact form submissions
9. **calendar_settings** - Settings (including maintenance mode)
10. **social_media_links** - Social media URLs
11. **attractions** / **tourist_attractions** - Tourist attractions
12. **faqs** - FAQ items
13. **house_rules** - House rules
14. **whatsapp_sessions** - WhatsApp chat sessions
15. **whatsapp_messages** - WhatsApp messages
16. **room_images** - Room image metadata

See `database_schema.sql` for complete table structures.

---

## 🔑 Environment Variables Required

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For Netlify Functions (if using):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📝 Implementation Checklist

### Authentication
- [ ] Login page with email/password
- [ ] Session management (localStorage)
- [ ] Admin-only access check
- [ ] Logout functionality
- [ ] Protected routes

### Dashboard
- [ ] Statistics cards
- [ ] Quick action links
- [ ] Booking status overview
- [ ] System status indicators
- [ ] Refresh button

### Room Management
- [ ] Room list with filters
- [ ] Add room form
- [ ] Edit room form
- [ ] Delete room (with confirmation)
- [ ] Image management (multiple images)
- [ ] Occupancy pricing fields
- [ ] Global check-in/out times

### Booking Management
- [ ] Booking list
- [ ] Search functionality
- [ ] Status filters
- [ ] Source filters
- [ ] View booking details modal
- [ ] Edit booking form
- [ ] Update status
- [ ] Delete booking (with confirmation)

### Calendar
- [ ] Calendar view (FullCalendar)
- [ ] Room filter
- [ ] Block dates functionality
- [ ] Unblock dates functionality
- [ ] Color-coded events
- [ ] Click to view details

### Reviews
- [ ] Testimonial list
- [ ] Add/edit/delete testimonials
- [ ] Featured toggle
- [ ] Active toggle
- [ ] Source filter

### Profile
- [ ] View profile
- [ ] Edit profile form
- [ ] Change password form
- [ ] Validation

### Attractions
- [ ] Attraction list
- [ ] Add/edit/delete attractions
- [ ] Multiple images
- [ ] Featured/active toggles
- [ ] Display order

### Features
- [ ] Feature list
- [ ] Add/edit/delete features
- [ ] Icon selector
- [ ] Category filter
- [ ] Display order

### FAQ
- [ ] FAQ list
- [ ] Add/edit/delete FAQs
- [ ] Drag-and-drop reordering
- [ ] Active toggle

### House Rules
- [ ] Rules list
- [ ] Add/edit/delete rules
- [ ] Display order

### Maintenance Mode
- [ ] Status display
- [ ] Toggle button
- [ ] Confirmation dialog
- [ ] Preview

---

## 🎨 UI/UX Guidelines

### Color Scheme
- Use dark blue (`#0d2d7a`) for primary actions
- Use golden (`#d4af37`) for accents
- Use gradients for headers/hero sections
- White/light backgrounds for content areas

### Typography
- Use Poppins for body text
- Use Playfair Display for headings (if available)
- Consistent font sizes and weights

### Components
- Cards with rounded corners and shadows
- Consistent button styles
- Modal dialogs for forms
- Toast notifications for feedback
- Loading spinners
- Status badges (colored)

### Layout
- Sidebar navigation (collapsible on mobile)
- Main content area
- Header with page title
- Breadcrumbs (optional)

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🚀 Getting Started

1. **Set up authentication**
   - Create login page
   - Implement session management
   - Protect admin routes

2. **Set up layout**
   - Create admin layout component
   - Add sidebar navigation
   - Add header

3. **Implement pages one by one**
   - Start with Dashboard (simplest)
   - Then Room Management
   - Then Bookings
   - Continue with others

4. **Test each feature**
   - Test CRUD operations
   - Test validation
   - Test error handling

5. **Polish UI**
   - Apply theme colors
   - Add animations
   - Ensure responsiveness

---

## 📚 Additional Resources

- **Supabase API Reference:** See `src/lib/supabase.ts` for all available API functions
- **Database Schema:** See `database_schema.sql` for table structures
- **Type Definitions:** See `src/lib/supabase.ts` for TypeScript interfaces
- **Netlify Functions:** See `netlify/functions/` for backend API implementations

---

## ✅ Final Notes

This specification contains **all functionality** needed to build the admin panel. The UI implementation is left to you to match your project's theme and design preferences.

All API functions are documented, all data structures are defined, and all features are described. Use this as your complete reference guide.

**Good luck building! 🎉**
