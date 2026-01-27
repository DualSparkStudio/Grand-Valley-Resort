# Attraction Images Update Guide

## Overview
This guide explains how to add multiple images to tourist attractions, specifically for Pratapgad Fort and Venna Lake.

## Changes Made

### 1. Database Migration
A new migration file has been created: `supabase/migrations/add_attraction_images.sql`
- Adds an `images` TEXT[] column to the `tourist_attractions` table
- Also adds the column to the `attractions` table if it exists (for backward compatibility)

### 2. TypeScript Interface Update
Updated `src/lib/supabase.ts`:
- Added `images?: string[]` to the `TouristAttraction` interface

### 3. Admin Panel Updates
Updated `src/pages/AdminTouristAttractions.tsx`:
- Added support for multiple image URLs
- Users can now add/remove multiple images per attraction
- Maintains backward compatibility with single `image_url` field

### 4. Public Page Updates
Updated `src/pages/TouristAttractions.tsx`:
- Now properly maps the `images` array from the database
- Falls back to `image_url` if `images` array is empty
- Falls back to placeholder if neither exists

## Setup Instructions

### Step 1: Run the Migration
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/add_attraction_images.sql`

### Step 2: Update Attractions with Images
1. In Supabase SQL Editor, run: `update-attraction-images.sql`
   - This will update Pratapgad Fort and Venna Lake with the provided images

### Step 3: Verify
Check that the attractions have been updated:
```sql
SELECT name, images FROM tourist_attractions 
WHERE LOWER(name) LIKE '%pratapgad%' OR LOWER(name) LIKE '%venna%';
```

## Image URLs Added

### Pratapgad Fort
1. https://tripxl.com/blog/wp-content/uploads/2024/10/Pratapgad-Fort-cp.jpg
2. https://cdn1.tripoto.com/media/filter/tst/img/2366547/Image/1726472242_pratapgad_fort_ariel_view_copy.jpg.webp
3. https://www.hoteldreamland.com/wp-content/uploads/2019/07/Pratapgad-Fort-2.jpg
4. https://media.assettype.com/outlooktraveller/import/outlooktraveller/public/uploads/articles/travelnews/2017/03/Pratapgad-featured.jpg?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true

### Venna Lake
1. https://hblimg.mmtcdn.com/content/hubble/img/mahabaleshwar/mmt/activities/m_activities-mahabaleshwar-venna-lake_l_400_640.jpg
2. https://mahabaleshwartourism.in/images/places-to-visit/headers/venna-lake-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg
3. https://static.wixstatic.com/media/ffb7e9_b262a318aa834fefa5a983167f8014be~mv2.png/v1/fill/w_840,h_480,al_c,lg_1,q_90/ffb7e9_b262a318aa834fefa5a983167f8014be~mv2.png
4. https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH7zuf66Iqqj-7SKenu-zoPsekNuaPaWcwiQ&s

## Using the Admin Panel

To add or edit images for attractions:
1. Go to Admin Panel → Tourist Attractions
2. Click "Edit" on any attraction
3. Scroll to "Additional Images (Multiple URLs)" section
4. Click "+ Add Image" to add more image URLs
5. Enter the image URL
6. Click "Remove" to delete an image URL
7. Save the attraction

## Notes
- The `image_url` field is kept for backward compatibility
- The `images` array takes precedence when displaying images
- If `images` is empty, it falls back to `image_url`
- If both are empty, a placeholder image is used
