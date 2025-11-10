# Supabase MVP Setup Guide
## Minimal Database for Soap Calculator (2 Tables Only)

**Created:** November 9, 2025  
**Purpose:** Add database persistence to the existing client-side Soap Calculator  
**Tables:** 2 (profiles + recipes)  
**Estimated Setup Time:** 30-60 minutes

---

## 📋 Overview

This guide implements the **minimal database schema** as specified in `CURRENT_FUNCTIONALITY.md`. We're adding only what's needed to enable recipe persistence:

✅ **What This Adds:**
- User authentication (Supabase Auth)
- Save recipes to database
- Load saved recipes
- Edit/delete recipes
- Public/private recipe visibility

❌ **What This Doesn't Include (Yet):**
- Social features (ratings, comments, forks)
- Collections/folders
- Custom oils
- Recipe sharing
- Activity tracking

---

## 🚀 Step-by-Step Setup

### Step 1: Create Supabase Project (10 minutes)

1. **Go to Supabase:** https://supabase.com
2. **Sign in** or create an account
3. **Click "New Project"**
   - Name: `soap-calculator` (or your choice)
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
   - Pricing Plan: Free tier is fine for MVP
4. **Wait for project to initialize** (~2 minutes)
5. **Note your project credentials:**
   - Project URL: `https://xxxxxxxxxxxxx.supabase.co`
   - Anon/Public Key: `eyJhbG...` (long string)

---

### Step 2: Run Database Migration (5 minutes)

1. **Open SQL Editor** in Supabase Dashboard
   - Navigate to: SQL Editor (left sidebar)

2. **Create a new query**
   - Click "+ New Query"

3. **Copy the migration file**
   - Open: `supabase/migrations/20251109000001_create_mvp_tables.sql`
   - Copy the entire contents

4. **Paste and run**
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

5. **Verify success**
   - You should see: "Success. No rows returned"
   - Check Table Editor (left sidebar) - you should see `profiles` and `recipes` tables

---

### Step 3: Configure Environment Variables (5 minutes)

1. **Create `.env.local` file** in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key-here...
```

2. **Replace with your actual values:**
   - Go to: Project Settings → API
   - Copy "Project URL" → paste as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Add to `.gitignore`** (if not already there):

```bash
# Environment variables
.env*.local
```

---

### Step 4: Install Supabase Client (5 minutes)

Run in your terminal:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

Or with yarn:

```bash
yarn add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

---

### Step 5: Verify Installation (5 minutes)

1. **Check tables exist:**
   - Go to: Table Editor in Supabase Dashboard
   - You should see:
     - ✅ `profiles` table
     - ✅ `recipes` table

2. **Check RLS is enabled:**
   - Click on `profiles` table
   - Go to "Policies" tab
   - You should see 3 policies:
     - ✅ "Users can read own profile"
     - ✅ "Users can update own profile"
     - ✅ "Anyone can read public profiles"

3. **Check recipes policies:**
   - Click on `recipes` table
   - Go to "Policies" tab
   - You should see 5 policies:
     - ✅ "Users can insert own recipes"
     - ✅ "Users can read own recipes"
     - ✅ "Users can update own recipes"
     - ✅ "Users can delete own recipes"
     - ✅ "Anyone can read public recipes"

---

## 📊 Database Schema Reference

### Table 1: `profiles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (references auth.users) |
| `email` | TEXT | User email (unique) |
| `username` | TEXT | Display name (unique) |
| `full_name` | TEXT | Full name (optional) |
| `avatar_url` | TEXT | Profile picture URL |
| `default_unit` | TEXT | 'g', 'oz', or 'lb' |
| `default_soap_type` | TEXT | 'hard' or 'liquid' |
| `default_superfat` | INTEGER | 0-20 (default: 5) |
| `profile_public` | BOOLEAN | Public profile visibility |
| `created_at` | TIMESTAMPTZ | Account creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

### Table 2: `recipes`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Recipe owner (references profiles) |
| `name` | TEXT | Recipe name |
| `description` | TEXT | Recipe description (optional) |
| `notes` | TEXT | Private notes (optional) |
| `inputs` | JSONB | RecipeInputs object |
| `selected_oils` | JSONB | SelectedOil[] array |
| `calculated_results` | JSONB | CalculationResults (cached) |
| `is_public` | BOOLEAN | Public visibility |
| `tags` | TEXT[] | Tags for organization |
| `view_count` | INTEGER | View counter |
| `created_at` | TIMESTAMPTZ | Creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |

---

## 🔒 Security (RLS Policies)

### Profiles Security

```
✅ Users can read/update their own profile
✅ Anyone can read public profiles
❌ Users cannot modify other users' profiles
```

### Recipes Security

```
✅ Users can create/read/update/delete their own recipes
✅ Anyone can read public recipes
❌ Users cannot modify other users' recipes
```

---

## 🧪 Testing the Database

### Test 1: Check Tables (SQL Editor)

```sql
-- Should return 2 rows
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'recipes');
```

### Test 2: Check RLS (SQL Editor)

```sql
-- Should return true for both tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'recipes');
```

### Test 3: Check Indexes (SQL Editor)

```sql
-- Should return multiple indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'recipes')
ORDER BY tablename, indexname;
```

---

## 🎯 Next Steps (After Database Setup)

Now that your database is ready, you need to integrate it with your Next.js app:

### Phase 1: Authentication (Next task)
1. Create Supabase client utilities
2. Add authentication UI (login/signup)
3. Add session management
4. Add protected routes

### Phase 2: Recipe CRUD (After auth)
1. Add "Save Recipe" functionality
2. Add "My Recipes" page
3. Add "Load Recipe" functionality
4. Add "Edit Recipe" functionality
5. Add "Delete Recipe" functionality

### Phase 3: UI Enhancements
1. Add loading states
2. Add error handling
3. Add success notifications
4. Add recipe list/grid view

---

## 📦 JSONB Data Examples

### Example `inputs` (JSONB)

```json
{
  "totalOilWeight": 500,
  "unit": "g",
  "soapType": "hard",
  "lyeType": "NaOH",
  "superfatPercentage": 5,
  "waterMethod": "water_as_percent_of_oils",
  "waterValue": 38,
  "fragranceWeight": 0
}
```

### Example `selected_oils` (JSONB)

```json
[
  {
    "id": "coconut-oil-76",
    "name": "Coconut Oil, 76 deg",
    "percentage": 25,
    "weight": 125,
    "sap_naoh": 0.183,
    "sap_koh": 0.257,
    "fatty_acids": {
      "lauric": 48,
      "myristic": 19,
      "palmitic": 9,
      "stearic": 3,
      "ricinoleic": 0,
      "oleic": 8,
      "linoleic": 2,
      "linolenic": 0
    },
    "iodine": 10,
    "ins": 258,
    "category": "Hard Oil"
  },
  {
    "id": "olive-oil",
    "name": "Olive Oil",
    "percentage": 75,
    "weight": 375,
    "sap_naoh": 0.135,
    "sap_koh": 0.190,
    "fatty_acids": {
      "lauric": 0,
      "myristic": 0,
      "palmitic": 11,
      "stearic": 4,
      "ricinoleic": 0,
      "oleic": 72,
      "linoleic": 10,
      "linolenic": 1
    },
    "iodine": 85,
    "ins": 109,
    "category": "Soft Oil"
  }
]
```

### Example `calculated_results` (JSONB)

```json
{
  "selectedOils": [ /* same as selected_oils */ ],
  "totalOilWeight": 500,
  "lyeWeight": 67.5,
  "waterWeight": 190,
  "fragranceWeight": 0,
  "totalBatchWeight": 757.5,
  "qualities": {
    "hardness": 41,
    "cleansing": 16,
    "conditioning": 58,
    "bubbly": 20,
    "creamy": 28,
    "iodine": 64,
    "ins": 145
  },
  "fattyAcids": {
    "lauric": 12,
    "myristic": 5,
    "palmitic": 10,
    "stearic": 4,
    "ricinoleic": 0,
    "oleic": 56,
    "linoleic": 8,
    "linolenic": 1
  }
}
```

---

## 🆘 Troubleshooting

### Issue: Migration fails with "permission denied"

**Solution:** Make sure you're running the SQL as the project owner, not as an authenticated user.

### Issue: RLS blocks all queries

**Solution:** 
1. Check you're authenticated (auth.uid() returns a value)
2. Verify policies are created correctly
3. Test with RLS disabled temporarily:

```sql
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
-- Test your query
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
```

### Issue: Can't see tables in Table Editor

**Solution:**
1. Refresh the page
2. Check the SQL Editor output for errors
3. Run validation queries above

### Issue: Environment variables not working

**Solution:**
1. Restart Next.js dev server after creating `.env.local`
2. Make sure variables start with `NEXT_PUBLIC_`
3. Check for typos in variable names

---

## 📊 Database Size Estimates

### Small (100 users, 10 recipes each)
- Profiles: ~50 KB
- Recipes: ~5 MB (assuming ~5 KB per recipe)
- **Total: ~5 MB** ✅ Free tier

### Medium (1,000 users, 50 recipes each)
- Profiles: ~500 KB
- Recipes: ~250 MB
- **Total: ~250 MB** ✅ Free tier

### Large (10,000 users, 100 recipes each)
- Profiles: ~5 MB
- Recipes: ~5 GB
- **Total: ~5 GB** ⚠️ Exceeds free tier (500 MB limit)

**Free Tier Limit:** 500 MB database size

---

## ✅ Setup Checklist

- [ ] Supabase project created
- [ ] Project URL and Anon Key saved
- [ ] Migration SQL executed successfully
- [ ] `profiles` table exists
- [ ] `recipes` table exists
- [ ] RLS policies verified
- [ ] Indexes created
- [ ] Triggers created
- [ ] `.env.local` file created
- [ ] Environment variables set
- [ ] Supabase client packages installed
- [ ] `.gitignore` updated

---

## 📚 Related Documentation

- **CURRENT_FUNCTIONALITY.md** - Current app features (what we're adding to)
- **DATABASE_SUMMARY.md** - Full 12-table schema (future phases)
- **supabase/migrations/20251109000001_create_mvp_tables.sql** - The migration file

---

## 🎉 Success!

If you've completed all steps, you now have:

✅ A Supabase project with 2 tables  
✅ Row-level security enabled  
✅ Automatic profile creation on signup  
✅ Environment variables configured  
✅ Ready for authentication integration  

**Next:** Start implementing authentication UI and recipe CRUD operations!

---

**Estimated Total Time:** 30-60 minutes  
**Difficulty:** ⚪ Easy to 🟡 Medium  
**Status:** ✅ Database ready for integration
