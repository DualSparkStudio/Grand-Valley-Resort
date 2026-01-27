# Supabase Setup Guide - Fix Console Errors

## Problem
You're seeing `ERR_NAME_NOT_RESOLVED` errors for Supabase because the `.env` file is missing or misconfigured.

## Solution

### Step 1: Create `.env` File

Create a `.env` file in the **project root** directory with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://uufbgvtqgoccbhzayaxb.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_KEY_HERE

# Email Configuration (for notifications)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
ADMIN_EMAIL=riverbreezehomestay@gmail.com

# Application Settings
APP_NAME=Grand Valley Resort
APP_URL=http://localhost:5173

# Security Settings
VITE_SLUG_SECRET=grand-valley-resort-secret-key-2026

# Google Places API (for reviews)
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### Step 2: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project or create a new one
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → Replace `VITE_SUPABASE_URL` value
   - **anon/public key** → Replace `VITE_SUPABASE_ANON_KEY` value

### Step 3: Update `.env` File

Replace `YOUR_ACTUAL_ANON_KEY_HERE` with your actual Supabase anon key from Step 2.

The URL `https://uufbgvtqgoccbhzayaxb.supabase.co` looks correct, but you need the actual anon key.

### Step 4: Restart Development Server

After creating/updating the `.env` file:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 5: Configure Netlify Environment Variables

For Netlify Functions to work, also add these environment variables in Netlify:

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL` (same as VITE_SUPABASE_URL)
   - `SUPABASE_ANON_KEY` (same as VITE_SUPABASE_ANON_KEY)
   - `GOOGLE_PLACES_API_KEY` (if you have one)

## Quick Commands

### Windows (PowerShell)

```powershell
# Copy env.example to .env
Copy-Item env.example .env

# Edit .env file
notepad .env
```

### Linux/Mac

```bash
# Copy env.example to .env
cp env.example .env

# Edit .env file
nano .env
# or
code .env
```

## Verify Configuration

After setup, check that the environment variables are loaded:

1. Restart your dev server
2. Open browser console
3. The Supabase errors should be gone
4. If errors persist, check that:
   - `.env` file is in the project root (same directory as `package.json`)
   - Variable names start with `VITE_` for client-side access
   - No extra spaces around `=` sign
   - Values are not wrapped in quotes

## Troubleshooting

### Error Still Appears?

1. **Check file location**: `.env` must be in the project root
2. **Check file name**: Must be exactly `.env` (with the dot)
3. **Restart server**: Vite doesn't hot-reload `.env` changes
4. **Check Supabase project**: Make sure it's not paused in Supabase dashboard

### Alternative: Use Local Supabase

If you don't have a Supabase project yet:

```bash
# Start local Supabase (requires Docker)
npx supabase start

# This will give you local credentials to use in .env
```

## Need the Actual Credentials?

If you don't have access to the Supabase dashboard, you'll need to:

1. Contact the project owner for the credentials, OR
2. Create a new Supabase project at https://app.supabase.com
3. Run the database migrations in `supabase/migrations/` folder
4. Update `.env` with your new project credentials

## Next Steps

After fixing Supabase configuration:
- Refresh your browser
- Console errors should be gone
- Website should load data from Supabase
