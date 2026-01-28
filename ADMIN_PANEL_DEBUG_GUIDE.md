# 🔧 Admin Panel Debugging Guide

## Status: Text visibility issue FIXED ✅
All input fields in the admin panel now have proper text color (`text-gray-900`) applied.

## Common Issues and Solutions

### 1. **Text Not Visible in Input Fields** ✅ FIXED
**Problem:** Text appears white on white background
**Solution:** Added `text-gray-900` class to all input, textarea, and select elements

### 2. **Supabase Connection Issues**

#### Symptoms:
- "Failed to load data" messages
- Empty tables/lists
- Network errors in console

#### Solutions:
1. **Check Environment Variables:**
   ```bash
   # Verify .env file exists with:
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Verify Supabase URL:**
   - Should look like: `https://xxxxx.supabase.co`
   - Test by visiting the URL in browser

3. **Check RLS Policies:**
   ```sql
   -- Disable RLS temporarily for testing (NOT for production)
   ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
   ```

### 3. **Authentication Issues**

#### Problem: Cannot login to admin panel

**Check these:**
1. **Admin user exists in database:**
   ```sql
   SELECT id, email, is_admin FROM users WHERE is_admin = true;
   ```

2. **Password is correct:**
   - Passwords are stored with bcrypt hash
   - Use the exact password you set during account creation

3. **Netlify Functions deployed:**
   - Check if `/.netlify/functions/simple-login` is accessible
   - Redeploy if necessary

### 4. **CRUD Operations Not Working**

#### Common Causes:
1. **RLS Policies too restrictive**
2. **Missing columns in database**
3. **Invalid data types**
4. **Network/CORS issues**

#### Debug Steps:
1. Open Browser Developer Tools (F12)
2. Go to Network tab
3. Perform the operation
4. Check the failed request for error details

### 5. **Specific Table Issues**

#### Bookings Not Loading:
```sql
-- Check if booking_source column exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source TEXT DEFAULT 'website';
```

#### Rooms Not Displaying:
```sql
-- Verify rooms table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rooms';
```

#### Attractions/Features Not Working:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

## Testing Procedure

### Step 1: Test Environment
```bash
# In project directory
npm install
npm run dev
```

### Step 2: Open Test Page
Navigate to: `http://localhost:5173/test-admin-functionality.html`

### Step 3: Run All Tests
1. Click "Test Environment Variables" ✅
2. Click "Test Database Connection" ✅
3. Enter admin credentials and click "Test Login" ✅
4. Click "Test CRUD Operations" ✅
5. Click "Test All Endpoints" ✅

### Step 4: Check Browser Console
Press F12 and look for:
- ❌ Red error messages
- ⚠️ Yellow warnings
- 🔴 Failed network requests

## Quick Fixes

### Fix 1: Clear Browser Cache
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 2: Reset Admin Session
```javascript
// In browser console:
localStorage.removeItem('resort_session');
location.href = '/login';
```

### Fix 3: Test Supabase Connection
```javascript
// In browser console:
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('YOUR_URL', 'YOUR_KEY');
const { data, error } = await supabase.from('rooms').select('*').limit(1);
console.log({ data, error });
```

## Database Schema Verification

### Required Tables:
- ✅ users
- ✅ rooms
- ✅ bookings
- ✅ testimonials
- ✅ features
- ✅ attractions
- ✅ faqs
- ✅ facilities
- ✅ social_media_links
- ✅ calendar_settings
- ✅ blocked_dates
- ✅ whatsapp_sessions
- ✅ whatsapp_messages

### Check All Tables Exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## RLS Policy Templates

### For Testing (Permissive):
```sql
-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON rooms
  FOR ALL USING (auth.role() = 'authenticated');
```

### For Production (Restrictive):
```sql
-- Only admins can modify
CREATE POLICY "Admins can do anything" ON rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Anyone can read active rooms
CREATE POLICY "Anyone can view active rooms" ON rooms
  FOR SELECT USING (is_active = true);
```

## Performance Optimization

### Issue: Slow Loading
```javascript
// Add loading timeouts
const loadWithTimeout = (promise, timeout = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
};
```

### Issue: Too Many Requests
```javascript
// Implement debouncing
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" | Network/CORS issue | Check Supabase URL and CORS settings |
| "Invalid JWT" | Session expired | Re-login |
| "RLS policy violation" | Insufficient permissions | Check RLS policies |
| "Column does not exist" | Database schema mismatch | Run migrations |
| "ENOENT" | File not found | Check file paths |
| "Unauthorized" | Not logged in as admin | Login with admin account |

## Next Steps

1. ✅ Run the test page to identify specific issues
2. ✅ Check Supabase dashboard for connection status
3. ✅ Verify all environment variables are set
4. ✅ Test login with known admin credentials
5. ✅ Review browser console for specific error messages
6. ✅ Check network tab for failed API calls
7. ✅ Verify database tables and RLS policies

## Need More Help?

1. Export browser console logs
2. Check Supabase logs in dashboard
3. Review Netlify function logs
4. Share specific error messages

## Files Modified for Text Visibility Fix:
- ✅ AdminFAQ.tsx
- ✅ AdminReviews.tsx
- ✅ AdminRooms.tsx
- ✅ AdminAttractions.tsx
- ✅ AdminProfile.tsx
- ✅ AdminBookings.tsx
- ✅ AdminFeatures.tsx
- ✅ AdminHouseRules.tsx
- ✅ AdminTouristAttractions.tsx
- ✅ AdminUsers.tsx
- ✅ AdminWhatsApp.tsx
- ✅ AdminSocialMedia.tsx
- ✅ BookingForm.tsx
- ✅ Login.tsx
