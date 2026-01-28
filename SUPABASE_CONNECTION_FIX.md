# 🔧 Supabase Connection Error Fix - ERR_NAME_NOT_RESOLVED

## 🚨 **Critical Issue Identified**

**Error:** `net::ERR_NAME_NOT_RESOLVED`

**URL Failing:** `uufbgvtqgoccbhzayaxb.supabase.co`

**Root Cause:** The Supabase URL in your `.env` file is **incorrect, misspelled, or invalid**.

---

## ❌ **What's Wrong:**

The DNS cannot resolve `uufbgvtqgoccbhzayaxb.supabase.co`, which means:
1. The URL is misspelled
2. The Supabase project doesn't exist
3. The project was deleted
4. There's a typo in the `.env` file

---

## ✅ **How to Fix:**

### Step 1: Get Your Correct Supabase URL

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Login to your account

2. **Select Your Project:**
   - Click on your "Grand Valley Resort" project

3. **Get Your Project Settings:**
   - Click on the **Settings** icon (gear icon) in the left sidebar
   - Click on **API** in the settings menu

4. **Copy Your Project URL:**
   - Look for **Project URL** (NOT the reference ID)
   - It should look like: `https://xxxxxxxxxxxxx.supabase.co`
   - Example: `https://abcdefghijklmn.supabase.co`

5. **Copy Your Anon Key:**
   - Look for **anon public** key
   - It's a long string starting with `eyJ...`

### Step 2: Update Your .env File

1. **Open your `.env` file** in the project root
2. **Update with correct values:**

```env
VITE_SUPABASE_URL=https://YOUR-ACTUAL-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-actual-key-here
```

**Example (use YOUR actual values):**
```env
VITE_SUPABASE_URL=https://abcdefghijklmn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEyMzQ1NjcsImV4cCI6MTk5NjgxMDU2N30.xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Clear Browser Cache

```javascript
// In browser console (F12), run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🔍 **How to Verify Your Supabase URL**

### Method 1: Test in Browser
Open your Supabase URL in a browser:
```
https://YOUR-PROJECT-ID.supabase.co
```

**Expected Result:** 
- ✅ Should show a JSON response or Supabase API page
- ❌ If you get "Site can't be reached" - URL is wrong

### Method 2: Test with cURL
```bash
curl https://YOUR-PROJECT-ID.supabase.co/rest/v1/
```

**Expected Result:**
- ✅ Should return something (even if it's an error about missing API key)
- ❌ If "Could not resolve host" - URL is wrong

### Method 3: Check Project Status
1. Go to Supabase Dashboard
2. Verify project is **Active** (not paused or deleted)
3. Check if you can see your database tables

---

## 📋 **Common URL Issues:**

### ❌ **Wrong Format:**
```
uufbgvtqgoccbhzayaxb.supabase.co          ❌ No https://
http://xxxxx.supabase.co                  ❌ Should be https://
https://xxxxx.supabase.com                ❌ Should be .co not .com
https://xxxxx.supabase.io                 ❌ Old format
```

### ✅ **Correct Format:**
```
https://xxxxxxxxxxxxx.supabase.co         ✅ Correct!
```

---

## 🛠️ **Create .env File if Missing**

If you don't have a `.env` file:

1. **Create file:** `.env` in project root
2. **Add these lines:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE

# Optional: For production
# VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. **Replace with your actual values**
4. **Restart dev server**

---

## 🔐 **Security Notes:**

1. **Never commit `.env` to Git:**
   ```bash
   # Add to .gitignore:
   echo ".env" >> .gitignore
   ```

2. **Use `.env.example` for reference:**
   ```env
   # .env.example (safe to commit)
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

3. **Keep your keys secret** - never share in screenshots or public repos

---

## 🚀 **After Fixing:**

You should see:
- ✅ No more `ERR_NAME_NOT_RESOLVED` errors
- ✅ Data loads successfully
- ✅ Rooms, bookings, calendar all work
- ✅ No failed network requests in console

---

## 🐛 **Still Having Issues?**

### Issue 1: "Failed to fetch"
**Cause:** Internet connection or Supabase is down
**Solution:** 
- Check your internet connection
- Visit https://status.supabase.com

### Issue 2: "Invalid API key"
**Cause:** Wrong anon key
**Solution:** 
- Copy the correct anon key from Supabase dashboard
- Make sure you copied the full key (it's very long)

### Issue 3: "Row Level Security policy violation"
**Cause:** RLS policies too restrictive
**Solution:**
```sql
-- Temporarily disable RLS for testing:
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
-- etc for other tables
```

---

## 📝 **Quick Fix Checklist:**

- [ ] Login to Supabase Dashboard
- [ ] Verify project exists and is active
- [ ] Copy correct Project URL (with https://)
- [ ] Copy correct Anon Key
- [ ] Update `.env` file
- [ ] Restart dev server (`npm run dev`)
- [ ] Clear browser cache
- [ ] Refresh page
- [ ] Check console - should have no DNS errors

---

## 🎯 **Test Your Fix:**

Run this in browser console after fixing:

```javascript
// Test Supabase connection
const testConnection = async () => {
  try {
    const response = await fetch(
      'https://YOUR-PROJECT-ID.supabase.co/rest/v1/rooms?select=count',
      {
        headers: {
          'apikey': 'YOUR-ANON-KEY',
          'Authorization': 'Bearer YOUR-ANON-KEY'
        }
      }
    );
    
    if (response.ok) {
      console.log('✅ Connection successful!');
    } else {
      console.log('❌ Connection failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testConnection();
```

---

## 📞 **Need Your Actual Supabase URL?**

If you can't access your Supabase dashboard:

1. **Check email:** Supabase sends project creation emails with URLs
2. **Check browser history:** Search for `supabase.com`
3. **Check old code commits:** Look for previous `.env` files
4. **Create new project:** If all else fails, create a new Supabase project

---

## ⚡ **Quick Commands:**

```bash
# 1. Stop current server
Ctrl+C

# 2. Edit .env file
notepad .env  # Windows
nano .env     # Mac/Linux

# 3. Add correct values, save, then restart:
npm run dev

# 4. Test in browser:
# Open: http://localhost:5173
```

---

## 📊 **Expected Console After Fix:**

**Before (with errors):**
```
❌ Failed to load resource: net::ERR_NAME_NOT_RESOLVED
❌ Failed to load resource: net::ERR_NAME_NOT_RESOLVED
❌ Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

**After (clean):**
```
✅ 🔄 Loading data...
✅ 📊 Data loaded: {bookings: 5, rooms: 3, blockedDates: 2}
```

---

## 🎓 **Understanding the Error:**

**`ERR_NAME_NOT_RESOLVED`** means:
- Your computer can't find the server
- DNS lookup failed
- The domain name doesn't exist
- Like calling a phone number that doesn't exist

**It's NOT:**
- A permission error
- A CORS error  
- An authentication error
- A code bug

**It IS:**
- A configuration error
- Wrong URL in .env file

---

## ✅ **Status After Fix:**

Once you update your `.env` with the correct Supabase URL:
- ✅ All database calls will work
- ✅ Admin panel will load data
- ✅ Rooms, bookings, calendar will function
- ✅ No more DNS errors in console

---

**IMPORTANT:** The current URL `uufbgvtqgoccbhzayaxb.supabase.co` is definitely incorrect. Please update it with your actual Supabase project URL from your dashboard.

---

**Last Updated:** January 28, 2026  
**Priority:** 🔴 **CRITICAL** - Must fix to use the application
