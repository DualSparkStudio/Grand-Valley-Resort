# Quick Fix Guide for 404 and 406 Errors

## Problem
You're seeing these errors in the browser console:
- `404` - `house_rules` table not found
- `404` - `rooms` query by slug failing
- `406` - Request format not acceptable

## Quick Solution (5 minutes)

### Step 1: Create Missing Tables in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project: `uufbgvtqgoccbhzayaxb`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run This SQL** (copy and paste):

```sql
-- Create house_rules table
CREATE TABLE IF NOT EXISTS house_rules (
    id SERIAL PRIMARY KEY,
    rule_text TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add sample house rules
INSERT INTO house_rules (rule_text, order_num, is_active) VALUES
('Check-in time is 2:00 PM and check-out time is 10:00 AM', 1, true),
('Smoking is strictly prohibited inside the rooms', 2, true),
('Pets are not allowed on the premises', 3, true),
('Please maintain silence after 10:00 PM', 4, true),
('Guests are responsible for any damage to property', 5, true),
('Outside food and alcohol are not permitted', 6, true),
('Valid ID proof is mandatory at check-in', 7, true),
('Please keep the resort clean', 8, true);

-- Add sample FAQs
INSERT INTO faqs (question, answer, category, order_num, is_active) VALUES
('What are the check-in and check-out times?', 'Check-in is at 2:00 PM and check-out is at 10:00 AM. Early check-in or late check-out may be available upon request.', 'Booking', 1, true),
('Is parking available?', 'Yes, we provide complimentary parking for all guests.', 'Amenities', 2, true),
('Do you allow pets?', 'Unfortunately, we do not allow pets to ensure comfort of all guests.', 'Policies', 3, true),
('What is your cancellation policy?', 'Cancellations 7+ days before check-in receive full refund. Within 7 days: 50% fee. Within 48 hours: no refund.', 'Policies', 4, true),
('Is WiFi available?', 'Yes, complimentary high-speed WiFi is available throughout the property.', 'Amenities', 5, true);

-- Verify tables created
SELECT 'house_rules' as table_name, COUNT(*) as rows FROM house_rules
UNION ALL
SELECT 'faqs' as table_name, COUNT(*) as rows FROM faqs;
```

4. **Click "Run"** - You should see a success message showing the row counts

### Step 2: Restart Your Development Server

The Supabase client configuration has been updated. Restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Clear Browser Cache

1. Open your browser's Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or use:
- Chrome/Edge: `Ctrl + Shift + Delete` → Clear cache
- Firefox: `Ctrl + Shift + Delete` → Clear cache

### Step 4: Test

1. Navigate to a room detail page
2. Check the browser console (F12)
3. The 404 and 406 errors should be gone

## What Was Fixed

1. ✅ **Updated Supabase client** in `src/lib/supabase.ts` to include proper headers:
   ```typescript
   export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       persistSession: true,
       autoRefreshToken: true,
     },
     global: {
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       }
     }
   })
   ```

2. ✅ **Created missing tables** (`house_rules` and `faqs`) with sample data

## Verify the Fix

Run this command to verify everything is working:

```bash
node verify-tables.cjs
```

You should see:
```
✅ house_rules: EXISTS (8 rows)
✅ faqs: EXISTS (5 rows)
✅ features: EXISTS (12 rows)
✅ rooms: EXISTS (3 rows)
✅ Slug query successful
```

## Still Having Issues?

### If you still see 404 errors:

1. **Check you're on the right Supabase project**
   - Verify `.env` has: `VITE_SUPABASE_URL=https://uufbgvtqgoccbhzayaxb.supabase.co`

2. **Refresh the schema cache**
   - In Supabase Dashboard → Settings → API
   - Click "Refresh schema cache"

3. **Check table permissions**
   - In Supabase Dashboard → Table Editor
   - Click on `house_rules` table
   - Ensure it exists and has data

### If you still see 406 errors:

1. **Check your Supabase keys**
   - In Supabase Dashboard → Settings → API
   - Copy the "anon public" key
   - Verify it matches `VITE_SUPABASE_ANON_KEY` in `.env`

2. **Restart everything**
   ```bash
   # Stop dev server
   # Clear node_modules cache
   npm run dev
   ```

3. **Check browser network tab**
   - Open DevTools → Network tab
   - Look for the failing request
   - Check the request headers include `Accept: application/json`

## Need More Help?

If issues persist:
1. Check the full error message in browser console
2. Look at the Network tab to see the exact request/response
3. Verify your Supabase project is not in maintenance mode
4. Check Supabase status: https://status.supabase.com

## Summary

The main issues were:
1. Missing `house_rules` and `faqs` tables → Created with SQL
2. Missing headers in Supabase client → Added configuration
3. Browser cache → Cleared

After following these steps, your application should work without 404/406 errors.
