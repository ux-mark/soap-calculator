# Adding Oils Table to Supabase

## Overview
You now have 3 migration files to run in sequence:

1. ✅ **Already Done:** `20251109000001_create_mvp_tables.sql` (profiles + recipes)
2. ⏳ **Next:** `20251109000002_add_oils_table.sql` (oils table structure)
3. ⏳ **Then:** `20251109000003_seed_all_oils.sql` (149 oils data)

---

## Step 1: Add Oils Table

**In Supabase Dashboard → SQL Editor:**

1. Open `supabase/migrations/20251109000002_add_oils_table.sql`
2. Copy the entire file
3. Paste into SQL Editor
4. Click **Run**

**Expected Result:** Success message

**Verify:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'oils';
```
Should return 1 row.

---

## Step 2: Seed All Oils

**In Supabase Dashboard → SQL Editor:**

1. Open `supabase/migrations/20251109000003_seed_all_oils.sql`
2. Copy the entire file (149 INSERT statements)
3. Paste into SQL Editor
4. Click **Run**

**Expected Result:** Success, 149 rows inserted

**Verify:**
```sql
SELECT COUNT(*) as total_oils FROM oils WHERE is_system = true;
```
Should return 149.

**Check by category:**
```sql
SELECT category, COUNT(*) as count 
FROM oils 
WHERE is_system = true 
GROUP BY category 
ORDER BY count DESC;
```

---

## Step 3: Update TypeScript Types

Add the oils table to your database types:

**Edit `lib/database.types.ts`** and add:

```typescript
export interface Oil {
  id: string; // Primary key (slug format)
  name: string;
  user_id: string | null; // NULL for system oils
  sap_naoh: number;
  sap_koh: number;
  iodine: number;
  ins: number;
  category: string;
  fatty_acids: FattyAcidProfile; // JSONB
  is_system: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface OilInsert {
  id: string;
  name: string;
  user_id?: string | null;
  sap_naoh: number;
  sap_koh: number;
  iodine: number;
  ins: number;
  category: string;
  fatty_acids: FattyAcidProfile;
  is_system?: boolean;
  is_public?: boolean;
}

export interface OilUpdate {
  name?: string;
  sap_naoh?: number;
  sap_koh?: number;
  iodine?: number;
  ins?: number;
  category?: string;
  fatty_acids?: FattyAcidProfile;
  is_public?: boolean;
}
```

And update the `Database` interface:

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      recipes: {
        Row: Recipe;
        Insert: RecipeInsert;
        Update: RecipeUpdate;
      };
      oils: {
        Row: Oil;
        Insert: OilInsert;
        Update: OilUpdate;
      };
    };
    // ...
  };
}
```

---

## Step 4: Query Oils from Your App

Now you can query oils from Supabase instead of using the static file:

**Example - Get all system oils:**
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: oils, error } = await supabase
  .from('oils')
  .select('*')
  .eq('is_system', true)
  .order('name')
```

**Example - Search oils:**
```typescript
const { data: oils } = await supabase
  .from('oils')
  .select('*')
  .eq('is_system', true)
  .ilike('name', `%${searchTerm}%`)
  .limit(20)
```

**Example - Filter by category:**
```typescript
const { data: oils } = await supabase
  .from('oils')
  .select('*')
  .eq('is_system', true)
  .eq('category', 'Hard Oil')
```

---

## Benefits of Database Oils

✅ **Centralized data** - No need to bundle oil data in your app  
✅ **Easy updates** - Update oil properties without code changes  
✅ **User custom oils** - Users can create their own oils (future feature)  
✅ **Smaller bundle** - Remove `lib/oilData.ts` static data  
✅ **Search & filter** - Use SQL queries for advanced filtering  

---

## Migration from Static to Database

### Option 1: Keep Both (Recommended for now)
- Keep `lib/oilData.ts` for offline/fallback
- Query database oils when available
- Migrate gradually

### Option 2: Full Migration
- Remove `lib/oilData.ts`
- Update all components to query from Supabase
- Requires auth for most features

---

## Database Structure Summary

```
oils table
├── id (TEXT, PRIMARY KEY)          - "coconut-oil-76"
├── name (TEXT)                     - "Coconut Oil, 76 deg"
├── user_id (UUID, nullable)        - NULL for system oils
├── sap_naoh (DECIMAL)              - 0.257
├── sap_koh (DECIMAL)               - 0.257
├── iodine (INTEGER)                - 10
├── ins (INTEGER)                   - 258
├── category (TEXT)                 - "Hard Oil"
├── fatty_acids (JSONB)             - {lauric: 48, myristic: 19, ...}
├── is_system (BOOLEAN)             - true
├── is_public (BOOLEAN)             - false
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

---

## RLS Policies

✅ Anyone can read system oils  
✅ Anyone can read public custom oils  
✅ Users can read their own custom oils  
✅ Users can create custom oils  
✅ Users can update/delete their own custom oils  
❌ Users cannot modify system oils  

---

## Next Steps

After adding oils to the database:

1. **Test queries** - Verify you can fetch oils
2. **Update components** - Modify OilSelector to query database
3. **Add custom oils feature** - Let users create oils
4. **Remove static data** - Clean up `lib/oilData.ts` (optional)

---

## Troubleshooting

### Issue: "relation 'oils' does not exist"
**Solution:** Run migration #2 (`20251109000002_add_oils_table.sql`)

### Issue: "No rows returned" after seeding
**Solution:** Check if migration #3 ran successfully. Run the verification query.

### Issue: Duplicate key errors
**Solution:** The oils table already has data. Use `DELETE FROM oils WHERE is_system = true;` before re-running the seed.

---

**Status:** Ready to add oils table  
**Files:** 2 migrations ready to run  
**Total Oils:** 149 system oils
