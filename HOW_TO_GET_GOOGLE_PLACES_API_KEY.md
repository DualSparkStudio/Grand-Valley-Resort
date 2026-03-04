# How to Get Google Places API Key - Step by Step Guide

## Overview
This guide will walk you through getting a Google Places API key to fetch real reviews for your resort website.

**Time Required**: 10-15 minutes  
**Cost**: Free (with $200/month credit)

---

## Step 1: Create Google Cloud Account

### 1.1 Go to Google Cloud Console
- Open your browser and go to: **https://console.cloud.google.com/**
- Sign in with your Google account (Gmail)

### 1.2 Accept Terms
- If this is your first time, you'll see a Terms of Service page
- Check the box to agree to the terms
- Click "Agree and Continue"

### 1.3 Set Up Billing (Required but Free)
- Google requires a credit card for verification
- You get **$200 free credit per month**
- You won't be charged unless you exceed the free tier
- Click "Activate" or "Start Free Trial"
- Enter your billing information:
  - Country: India
  - Account type: Individual or Business
  - Name and address
  - Credit/Debit card details
- Click "Start my free trial"

**Note**: Google won't charge you automatically. You need to manually upgrade to a paid account after the trial.

---

## Step 2: Create a New Project

### 2.1 Create Project
- At the top of the page, click on the project dropdown (says "Select a project")
- Click "NEW PROJECT"

### 2.2 Configure Project
- **Project name**: Enter "Grand Valley Resort" (or any name you prefer)
- **Organization**: Leave as "No organization" (unless you have one)
- **Location**: Leave as default
- Click "CREATE"

### 2.3 Wait for Creation
- Wait 10-30 seconds for the project to be created
- You'll see a notification when it's ready
- Click "SELECT PROJECT" in the notification

---

## Step 3: Enable Places API

### 3.1 Go to API Library
- In the left sidebar, click on "APIs & Services"
- Click on "Library" (or "Enable APIs and Services")

### 3.2 Search for Places API
- In the search bar, type: **"Places API"**
- You'll see several results:
  - **Places API (New)** - This is the one you want
  - Places API (Legacy)
  - Nearby Search API
  
### 3.3 Enable the API
- Click on **"Places API (New)"**
- Click the blue "ENABLE" button
- Wait a few seconds for it to enable

### 3.4 Also Enable (Optional but Recommended)
Go back to Library and also enable:
- **Maps JavaScript API** (for future map features)
- **Geocoding API** (for location services)

---

## Step 4: Create API Key

### 4.1 Go to Credentials
- In the left sidebar, click "Credentials"
- Click the "+ CREATE CREDENTIALS" button at the top
- Select "API key" from the dropdown

### 4.2 Copy Your API Key
- A popup will appear with your API key
- **IMPORTANT**: Copy this key immediately!
- It will look like: `AIzaSyD1234567890abcdefghijklmnopqrst`
- Click "CLOSE" (we'll restrict it in the next step)

---

## Step 5: Restrict Your API Key (IMPORTANT for Security)

### 5.1 Open API Key Settings
- You should see your new API key in the list
- Click on the key name (or the pencil icon to edit)

### 5.2 Set Application Restrictions
Scroll down to "Application restrictions":

**Option A: For Production (Recommended)**
- Select "HTTP referrers (web sites)"
- Click "ADD AN ITEM"
- Add your domains:
  ```
  https://grandvalleyresort.com/*
  https://*.netlify.app/*
  http://localhost:8888/*
  ```
- Click "DONE"

**Option B: For Testing (Less Secure)**
- Select "None" (not recommended for production)
- You can change this later

### 5.3 Set API Restrictions
Scroll down to "API restrictions":
- Select "Restrict key"
- Click "Select APIs" dropdown
- Check these APIs:
  - ✅ Places API (New)
  - ✅ Maps JavaScript API (if you enabled it)
  - ✅ Geocoding API (if you enabled it)
- Click "OK"

### 5.4 Save
- Scroll to the bottom
- Click "SAVE"
- Wait for the confirmation message

---

## Step 6: Add API Key to Your Project

### 6.1 Update Local .env File

Open your `.env` file and update:

```env
# Google Places API
GOOGLE_PLACES_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrst
```

Replace `AIzaSyD1234567890abcdefghijklmnopqrst` with your actual API key.

### 6.2 Add to Netlify (For Production)

1. Go to your Netlify dashboard: **https://app.netlify.com/**
2. Select your site
3. Go to "Site settings" (or "Site configuration")
4. Click "Environment variables" in the left sidebar
5. Click "Add a variable" or "Add environment variable"
6. Enter:
   - **Key**: `GOOGLE_PLACES_API_KEY`
   - **Value**: Your API key (paste it)
7. Click "Create variable" or "Save"

### 6.3 Redeploy Your Site

After adding the environment variable:
1. Go to "Deploys" tab
2. Click "Trigger deploy" > "Deploy site"
3. Wait for deployment to complete

---

## Step 7: Verify Your Business on Google

For the API to find your resort's reviews, your business must be on Google Maps.

### 7.1 Check if Your Business Exists
1. Go to **https://www.google.com/maps**
2. Search for: "Grand Valley Resort Bhilar"
3. If you find it, great! Note the exact name.
4. If not, you need to add it.

### 7.2 Claim Your Business (If Not Already Done)
1. Go to **https://business.google.com/**
2. Click "Manage now"
3. Search for your business
4. If found, click "Claim this business"
5. If not found, click "Add your business to Google"

### 7.3 Verify Your Business
Google will send a verification code via:
- Postcard (5-14 days)
- Phone call
- Email
- Video verification

Choose the method and complete verification.

### 7.4 Update Function with Exact Business Name

If your business name on Google is different from "Grand Valley Resort Bhilar":

1. Open `netlify/functions/get-google-reviews.js`
2. Find this line:
   ```javascript
   const placeName = 'Grand Valley Resort Bhilar'
   ```
3. Change it to your exact business name on Google Maps
4. Save and redeploy

---

## Step 8: Test Your Setup

### 8.1 Test Locally with Netlify Dev
```bash
# Stop your current dev server (Ctrl+C)

# Start with Netlify Dev
npm run dev

# Open browser to http://localhost:8888
```

Check the browser console:
- Should see "Loading reviews..."
- Should fetch real reviews (if business is verified)
- No 404 errors

### 8.2 Test in Production
1. Deploy your site to Netlify
2. Visit your live site
3. Scroll to the reviews section
4. Open browser console (F12)
5. Should see real Google reviews

---

## Troubleshooting

### Error: "API key not valid"
**Solutions**:
- Wait 5-10 minutes after creating the key (propagation time)
- Check if Places API is enabled
- Verify the key is copied correctly (no extra spaces)
- Check API restrictions match your domain

### Error: "This API project is not authorized to use this API"
**Solutions**:
- Make sure you enabled "Places API (New)"
- Check API restrictions in the key settings
- Wait a few minutes for changes to propagate

### Error: "Place not found"
**Solutions**:
- Verify your business exists on Google Maps
- Check the exact business name
- Update `placeName` in the function to match Google Maps exactly
- Make sure your business is verified on Google My Business

### Error: "You have exceeded your daily request quota"
**Solutions**:
- Check your Google Cloud Console > APIs & Services > Dashboard
- View quota usage
- Increase quota or wait for reset (midnight Pacific Time)
- Consider implementing better caching

### Still showing mock reviews?
**Check**:
1. API key is added to Netlify environment variables
2. Site is redeployed after adding the variable
3. Business is verified on Google
4. Function is using correct business name
5. Check browser console for error messages

---

## Understanding Costs

### Free Tier (Monthly)
- **$200 free credit** every month
- Resets on the 1st of each month
- No rollover of unused credits

### Places API Pricing
- **Text Search**: $32 per 1,000 requests
- **Place Details**: $17 per 1,000 requests
- **Total per request**: ~$0.049 (about 5 cents)

### Your Expected Usage
With 30-minute caching:
- ~48 requests per day
- ~1,440 requests per month
- **Cost**: ~$70/month
- **Covered by**: Free $200 credit ✅

### Setting Up Billing Alerts
1. Go to Google Cloud Console
2. Click "Billing" in the left sidebar
3. Click "Budgets & alerts"
4. Click "CREATE BUDGET"
5. Set alert at $50, $100, $150
6. Add your email for notifications

---

## Security Best Practices

### ✅ DO:
- Restrict API key to specific domains
- Restrict API key to only needed APIs
- Use environment variables (never commit keys to Git)
- Set up billing alerts
- Regularly review API usage
- Rotate keys every 90 days

### ❌ DON'T:
- Share your API key publicly
- Commit API keys to GitHub
- Use the same key for multiple projects
- Leave keys unrestricted
- Ignore billing alerts

---

## Quick Reference

### Important Links
- **Google Cloud Console**: https://console.cloud.google.com/
- **Google My Business**: https://business.google.com/
- **API Documentation**: https://developers.google.com/maps/documentation/places/web-service/overview
- **Pricing Calculator**: https://cloud.google.com/products/calculator

### Your API Key Location
- **Local**: `.env` file (root of project)
- **Production**: Netlify Dashboard > Site Settings > Environment Variables

### Support
- **Google Cloud Support**: https://cloud.google.com/support
- **Community Forum**: https://stackoverflow.com/questions/tagged/google-places-api

---

## Summary Checklist

Before you start:
- [ ] Have a Google account (Gmail)
- [ ] Have a credit/debit card for verification
- [ ] Know your business name on Google Maps

Steps completed:
- [ ] Created Google Cloud account
- [ ] Created a new project
- [ ] Enabled Places API
- [ ] Created API key
- [ ] Restricted API key (domains + APIs)
- [ ] Added key to `.env` file
- [ ] Added key to Netlify environment variables
- [ ] Verified business on Google My Business
- [ ] Updated function with correct business name
- [ ] Tested locally with `npm run dev`
- [ ] Deployed to production
- [ ] Verified real reviews are loading

---

## Need Help?

If you get stuck:
1. Check the Troubleshooting section above
2. Review Google Cloud Console > APIs & Services > Dashboard for errors
3. Check browser console for specific error messages
4. Verify all steps were completed in order

**Common mistake**: Forgetting to redeploy Netlify after adding environment variables!

---

Good luck! Your Google reviews will look amazing on your website. 🌟
