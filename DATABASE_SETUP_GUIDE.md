# Database Setup Guide

This guide will help you set up the complete database schema for the Resort Booking System.

## 📋 Files Included

- `database_schema.sql` - Complete database schema with all tables, indexes, and constraints

## 🚀 Quick Setup

### Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Navigate to your Supabase project
   - Click on "SQL Editor" in the left sidebar

2. **Run the Schema**
   - Click "New query"
   - Open `database_schema.sql` file
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see all tables listed:
     - users
     - rooms
     - room_images
     - bookings
     - blocked_dates
     - facilities
     - testimonials
     - contact_messages
     - resort_closures
     - calendar_settings
     - social_media_links
     - tourist_attractions
     - whatsapp_sessions
     - whatsapp_messages

### Method 2: Using Supabase CLI

```bash
# 1. Link your project
supabase link --project-ref your-project-ref-id

# 2. Run the schema
supabase db reset
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < database_schema.sql
```

### Method 3: Using pg_dump/psql

```bash
# Run the schema file
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < database_schema.sql
```

## 📊 Database Tables Overview

### Core Tables

1. **users** - User accounts and admin users
2. **rooms** - Room information, pricing, amenities
3. **bookings** - Booking records with payment info
4. **blocked_dates** - Manually blocked dates for rooms

### Content Tables

5. **facilities** - Resort facilities information
6. **testimonials** - Guest reviews and testimonials
7. **contact_messages** - Contact form submissions
8. **tourist_attractions** - Nearby attractions

### Configuration Tables

9. **calendar_settings** - Calendar integration settings
10. **social_media_links** - Social media links
11. **resort_closures** - Resort-wide closure dates

### Optional Tables

12. **room_images** - Separate image management (optional)
13. **whatsapp_sessions** - WhatsApp chat sessions (optional)
14. **whatsapp_messages** - WhatsApp messages (optional)

## 🔑 Important Features

### Indexes
- All tables have appropriate indexes for performance
- Foreign key relationships are properly indexed

### Constraints
- Check constraints for data validation
- Foreign key constraints for data integrity
- Unique constraints where needed

### Triggers
- Automatic `updated_at` timestamp updates for bookings and calendar_settings

### Data Types
- Proper data types for all fields
- JSONB for flexible data storage (platform_data)
- Arrays for amenities and images

## 📝 Post-Setup Steps

### 1. Create Admin User

After running the schema, create your first admin user:

```sql
INSERT INTO users (username, email, first_name, last_name, is_admin)
VALUES ('admin', 'admin@yourresort.com', 'Admin', 'User', true);
```

### 2. Add Sample Room (Optional)

```sql
INSERT INTO rooms (
    room_number, 
    name, 
    slug,
    description, 
    price_per_night, 
    max_occupancy, 
    amenities,
    image_url,
    is_active,
    is_available,
    price_double_occupancy,
    price_triple_occupancy,
    check_in_time,
    check_out_time
) VALUES (
    '101',
    'Deluxe Room',
    'deluxe-room',
    'Beautiful deluxe room with river view',
    2500.00,
    3,
    ARRAY['WiFi', 'AC', 'TV', 'Balcony'],
    'https://example.com/room1.jpg',
    true,
    true,
    2500.00,
    3000.00,
    '14:00',
    '10:00'
);
```

### 3. Configure Environment Variables

Make sure your Netlify environment variables are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🔍 Verification

Run these queries to verify everything is set up correctly:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## ⚠️ Important Notes

1. **Row Level Security (RLS)**: The schema includes commented RLS setup. Uncomment if you want to use RLS policies.

2. **UUID Extension**: The schema enables UUID extension if needed. You can remove this if not using UUIDs.

3. **Sample Data**: The schema includes commented sample data. Uncomment and modify as needed for testing.

4. **Backup**: Always backup your database before running schema changes in production.

## 🐛 Troubleshooting

### Error: "relation already exists"
- Tables already exist. Drop them first or use `CREATE TABLE IF NOT EXISTS` (already included).

### Error: "permission denied"
- Make sure you're using the service role key or have proper database permissions.

### Error: "extension does not exist"
- Some extensions might not be available. Remove the UUID extension line if not needed.

## 📚 Next Steps

1. ✅ Run the schema
2. ✅ Create admin user
3. ✅ Add your rooms
4. ✅ Configure environment variables
5. ✅ Test the application

## 🔄 Migration Order

If you're applying migrations incrementally, use this order:

1. Base schema (all CREATE TABLE statements)
2. Indexes
3. Foreign keys
4. Triggers
5. RLS policies (if needed)
6. Sample data (optional)

---

**Need Help?** Check the main `EXPORT_DATABASE_GUIDE.md` for more database management tips.
