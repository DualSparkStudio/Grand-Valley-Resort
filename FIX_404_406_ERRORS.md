# Fix for 404 and 406 Supabase Errors

## Problem Summary

You're experiencing two types of errors:

1. **404 Errors** - Missing tables in your Supabase database:
   - `house_rules` table doesn't exist
   - Possibly other tables missing

2. **406 Errors** - API request format issues:
   - Missing or incorrect `Accept` header in Supabase client requests
   - Supabase is rejecting the request format

## Root Causes

### 1. Missing Database Tables
The `house_rules` table (and possibly `faqs`, `features`) were never created in your Supabase database. Your code references these tables, but they don't exist.

### 2. Supabase Client Configuration
The 406 error typically occurs when:
- The Supabase client isn't properly configured with headers
- The API endpoint expects a specific response format
- There's a mismatch between the client request and server expectations

## Solutions

### Step 1: Create Missing Tables

Run the SQL script in your Supabase SQL Editor:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy and paste the contents of `create-missing-tables.sql`
5. Click **Run** to execute the script

This will create:
- `house_rules` table with sample data
- `faqs` table with sample data
- `features` table (if it doesn't exist)
- Proper indexes and triggers

### Step 2: Verify Tables Were Created

Run this command to verify:

```bash
node -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); supabase.from('house_rules').select('*').limit(5).then(({data, error}) => { if(error) console.log('ERROR:', error); else console.log('Success! Found', data.length, 'house rules'); })"
```

### Step 3: Fix Supabase Client Configuration

The 406 error is likely due to the Supabase client not sending proper headers. Update your `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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

### Step 4: Enable Row Level Security (RLS) Policies

If you have RLS enabled on your tables, you need to add policies to allow public read access:

```sql
-- Allow public read access to house_rules
ALTER TABLE house_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active house rules"
ON house_rules FOR SELECT
USING (is_active = true);

-- Allow public read access to faqs
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active faqs"
ON faqs FOR SELECT
USING (is_active = true);

-- Allow public read access to features
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active features"
ON features FOR SELECT
USING (is_active = true);

-- Allow public read access to rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active rooms"
ON rooms FOR SELECT
USING (is_active = true);
```

**Note:** Only run the RLS policies if you want to restrict access. For development, you can keep RLS disabled.

### Step 5: Check Supabase API Settings

1. Go to **Settings** > **API** in your Supabase dashboard
2. Verify that:
   - Your API URL matches `VITE_SUPABASE_URL` in `.env`
   - Your anon/public key matches `VITE_SUPABASE_ANON_KEY` in `.env`
   - The API is not in maintenance mode

### Step 6: Test the Fixes

After completing the above steps:

1. **Clear browser cache and reload** your application
2. **Check the browser console** for any remaining errors
3. **Test the affected pages**:
   - Room detail page (with slug)
   - House rules section
   - Any page that displays FAQs or features

## Verification Commands

### Check if tables exist:
```bash
node -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); Promise.all([supabase.from('house_rules').select('count'), supabase.from('faqs').select('count'), supabase.from('features').select('count'), supabase.from('rooms').select('count')]).then(results => { console.log('house_rules:', results[0].count || 'ERROR'); console.log('faqs:', results[1].count || 'ERROR'); console.log('features:', results[2].count || 'ERROR'); console.log('rooms:', results[3].count || 'ERROR'); })"
```

### Test room query by slug:
```bash
node -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); supabase.from('rooms').select('*').limit(1).then(({data, error}) => { if(error) console.log('ERROR:', error); else if(data && data[0]) { console.log('Testing slug:', data[0].slug); supabase.from('rooms').select('*').eq('slug', data[0].slug).single().then(result => { console.log('Slug query result:', result.error ? 'ERROR: ' + result.error.message : 'SUCCESS'); }); } })"
```

## Common Issues and Solutions

### Issue: Still getting 404 after creating tables
**Solution:** 
- Verify you're connected to the correct Supabase project
- Check that the table names match exactly (case-sensitive)
- Ensure your `.env` file has the correct `VITE_SUPABASE_URL`

### Issue: Still getting 406 errors
**Solution:**
- Clear your browser cache completely
- Restart your development server (`npm run dev`)
- Check browser network tab to see the actual request headers
- Verify the Supabase client configuration includes proper headers

### Issue: RLS policies blocking access
**Solution:**
- Temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
- Or add proper policies as shown in Step 4

### Issue: Slug queries returning 404
**Solution:**
- Verify rooms have slugs: `SELECT id, name, slug FROM rooms;`
- If slugs are missing, run: `node scripts/generate-room-slugs.js`
- Check that the slug in the URL matches the slug in the database

## Additional Debugging

If issues persist, enable detailed logging:

```typescript
// Add to src/lib/supabase.ts
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
  },
  // Enable debug mode
  db: {
    schema: 'public'
  }
})

// Add error logging to API calls
export const api = {
  async getRooms() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  },
  // ... rest of API methods
}
```

## Summary

The main fixes are:
1. ✅ Create missing `house_rules`, `faqs`, and `features` tables
2. ✅ Add proper headers to Supabase client configuration
3. ✅ Set up RLS policies if needed
4. ✅ Verify all environment variables are correct
5. ✅ Clear cache and restart development server

After completing these steps, your 404 and 406 errors should be resolved.
