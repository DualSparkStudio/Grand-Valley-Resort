# How to Get Your Supabase Service Role Key

## The Error You're Seeing:
```
Failed to load resource: the server responded with a status of 500
Missing environment variables
```

This means the `SUPABASE_SERVICE_ROLE_KEY` is missing from your `.env` file.

## Step-by-Step Solution:

### 1. Go to Supabase Dashboard
Visit: https://supabase.com/dashboard/project/uufbgvtqgoccbhzayaxb

### 2. Navigate to API Settings
- Click on **Settings** (gear icon in sidebar)
- Click on **API**

### 3. Find Your Service Role Key
You'll see two keys:
- ✅ **anon / public** key (you already have this)
- ✅ **service_role** key (THIS IS WHAT YOU NEED)

The service_role key looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZmJndnRxZ29jY2JoemF5YXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgyMzIyMSwiZXhwIjoyMDg0Mzk5MjIxfQ.XXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Copy the Service Role Key
Click the **Copy** button next to the service_role key

### 5. Update Your .env File
Open your `.env` file and update this line:
```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
```

Replace `YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE` with the key you just copied.

### 6. Restart Your Development Server
```bash
# Stop the server (Ctrl+C in terminal)
# Then restart
npm run dev
```

### 7. Try Logging In Again
- Email: `admin@resortbookingsystem.com`
- Password: `Admin@123`

## Important Notes:

⚠️ **Security Warning**: The service_role key has full database access. Never commit it to Git or share it publicly!

✅ **What Each Key Does**:
- `VITE_SUPABASE_ANON_KEY` - Public key for client-side operations (safe to expose)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key for server-side operations (KEEP SECRET!)

## Still Not Working?

If you still see the error after adding the key:

1. **Check the key is correct** - Make sure you copied the entire key
2. **No extra spaces** - Make sure there are no spaces before or after the key
3. **Restart server** - Always restart after changing .env
4. **Check browser console** - Look for more specific error messages

## Your Current .env Should Look Like:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://uufbgvtqgoccbhzayaxb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZmJndnRxZ29jY2JoemF5YXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MjMyMjEsImV4cCI6MjA4NDM5OTIyMX0.StbVYpMPUR_cCB2bF-AhauTOEEyqSF2RR7k5SyHyMN0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZmJndnRxZ29jY2JoemF5YXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgyMzIyMSwiZXhwIjoyMDg0Mzk5MjIxfQ.YOUR_ACTUAL_KEY_HERE

# Razorpay Configuration (for payments)
VITE_RAZORPAY_KEY_ID=rzp_live_RCFI36DXrr5rnP
VITE_RAZORPAY_KEY_SECRET=kscoMv2le7wC9qUQetFTnBil
```

---

**Once you add the correct SUPABASE_SERVICE_ROLE_KEY, the login will work!** 🔐
