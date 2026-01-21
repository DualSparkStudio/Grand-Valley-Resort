# How to Clone/Export Supabase Database with Schema

This guide provides multiple methods to export your entire Supabase database including schema, data, and all database objects.

---

## Method 1: Using Supabase CLI (Recommended) ⭐

### Step 1: Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Or using Homebrew (Mac)
brew install supabase/tap/supabase

# Or using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
# Get your project reference ID from Supabase dashboard
supabase link --project-ref your-project-ref-id
```

### Step 4: Export Database Schema

```bash
# Export only schema (structure)
supabase db dump --schema-only -f schema.sql

# Export schema + data
supabase db dump -f full_database.sql

# Export specific schema
supabase db dump --schema public -f public_schema.sql
```

### Step 5: Export Data Only

```bash
# Export data only (no schema)
supabase db dump --data-only -f data.sql
```

---

## Method 2: Using pg_dump (PostgreSQL Native)

### Step 1: Get Database Connection String

1. Go to Supabase Dashboard → Settings → Database
2. Scroll to "Connection string" section
3. Copy the "URI" connection string (includes password)
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Step 2: Install PostgreSQL Client Tools

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use: `choco install postgresql` (if you have Chocolatey)

**Mac:**
```bash
brew install postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql-client  # Ubuntu/Debian
sudo yum install postgresql  # CentOS/RHEL
```

### Step 3: Export Database

```bash
# Export schema only
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --schema-only \
  --no-owner \
  --no-acl \
  -f schema.sql

# Export schema + data
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --no-owner \
  --no-acl \
  -f full_database.sql

# Export with data in INSERT format
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --data-only \
  --inserts \
  -f data.sql

# Export specific tables
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --table=rooms \
  --table=bookings \
  --table=users \
  -f selected_tables.sql
```

---

## Method 3: Using Supabase Dashboard (Easiest)

### Step 1: Export Schema via SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Run this query to get all table schemas:

```sql
-- Get all table schemas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

3. Copy the results

### Step 2: Export Data via Table Editor

1. Go to Supabase Dashboard → Table Editor
2. For each table:
   - Click on the table
   - Click "..." menu → "Export" → "CSV" or "JSON"

**Note:** This method exports data only, not the full schema structure.

---

## Method 4: Complete Schema Export Script

Create a script to export everything:

### Create `export-database.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exportSchema() {
  try {
    // Get all tables
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) throw error;

    let schemaSQL = '-- Complete Database Schema Export\n';
    schemaSQL += `-- Generated: ${new Date().toISOString()}\n\n`;

    // Export each table structure
    for (const table of tables) {
      const tableName = table.table_name;
      
      // Get table columns
      const { data: columns } = await supabase.rpc('get_table_columns', {
        table_name: tableName
      });

      schemaSQL += `\n-- Table: ${tableName}\n`;
      schemaSQL += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      // Add column definitions here
      // (This is a simplified version - you'd need to query column details)
      
      schemaSQL += `);\n\n`;
    }

    fs.writeFileSync('exported_schema.sql', schemaSQL);
    console.log('Schema exported to exported_schema.sql');
  } catch (error) {
    console.error('Export failed:', error);
  }
}

exportSchema();
```

---

## Method 5: Using Supabase Migration System

If you want to create a complete migration file:

### Step 1: Generate Migration from Current State

```bash
# This creates a migration based on your current database
supabase db diff -f complete_schema
```

### Step 2: Apply to New Database

```bash
# In your new Supabase project
supabase migration up
```

---

## Recommended: Complete Export Script

Here's a complete script that exports everything:

### `export-complete-database.sh`

```bash
#!/bin/bash

# Configuration
DB_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
OUTPUT_DIR="./database_export"
DATE=$(date +%Y%m%d_%H%M%S)

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Starting database export..."

# 1. Export complete schema
echo "Exporting schema..."
pg_dump "$DB_URL" \
  --schema-only \
  --no-owner \
  --no-acl \
  -f "$OUTPUT_DIR/schema_$DATE.sql"

# 2. Export complete database (schema + data)
echo "Exporting full database..."
pg_dump "$DB_URL" \
  --no-owner \
  --no-acl \
  -f "$OUTPUT_DIR/full_database_$DATE.sql"

# 3. Export data only
echo "Exporting data..."
pg_dump "$DB_URL" \
  --data-only \
  --inserts \
  --no-owner \
  --no-acl \
  -f "$OUTPUT_DIR/data_$DATE.sql"

# 4. Export as custom format (for easy restore)
echo "Exporting custom format..."
pg_dump "$DB_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  -f "$OUTPUT_DIR/database_$DATE.dump"

echo "Export complete! Files saved in $OUTPUT_DIR"
```

---

## How to Restore/Import Database

### Using Supabase CLI

```bash
# Restore from SQL file
supabase db reset
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < schema.sql
```

### Using pg_restore

```bash
# Restore from custom format
pg_restore -d "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  database_20240101_120000.dump

# Restore from SQL file
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < full_database.sql
```

### Using Supabase Dashboard

1. Go to SQL Editor
2. Paste your SQL file content
3. Click "Run"

---

## Quick Export Checklist

- [ ] Schema (table structures, columns, types)
- [ ] Data (all rows from all tables)
- [ ] Indexes
- [ ] Foreign keys
- [ ] Triggers
- [ ] Functions/Stored procedures
- [ ] Views
- [ ] Sequences
- [ ] Policies (RLS policies)
- [ ] Extensions

---

## Important Notes

1. **Connection String**: Replace `[PASSWORD]` and `[HOST]` with your actual credentials
2. **Security**: Never commit database dumps with real data to version control
3. **Size**: Large databases may take time to export
4. **Permissions**: You need database admin access to export everything
5. **RLS Policies**: Make sure to export Row Level Security policies if you use them

---

## Troubleshooting

### Error: "password authentication failed"
- Check your database password in Supabase Dashboard → Settings → Database

### Error: "connection refused"
- Check if your IP is whitelisted in Supabase Dashboard → Settings → Database → Connection Pooling

### Error: "relation does not exist"
- Make sure you're connected to the correct database
- Check table names are correct (case-sensitive)

---

## Best Practices

1. **Regular Backups**: Export database weekly/monthly
2. **Version Control**: Keep schema migrations in git (not data)
3. **Test Restores**: Periodically test restoring from backups
4. **Documentation**: Document any manual schema changes
5. **Environment Separation**: Keep separate exports for dev/staging/prod
