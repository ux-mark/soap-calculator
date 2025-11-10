# Supabase Database Setup - Verification Checklist

## ✅ Completed Steps

- [x] Supabase project created
- [x] Environment variables configured (.env.local)
- [x] Supabase packages installed
- [x] Database migration executed
- [x] Tables created (profiles, recipes)
- [x] Supabase client utilities created

---

## 🔍 Verification Steps

### 1. Check Tables Exist

**In Supabase Dashboard → SQL Editor, run:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'recipes');
```

**Expected Result:** 2 rows (profiles, recipes) ✅

---

### 2. Check RLS is Enabled

**Run in SQL Editor:**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'recipes');
```

**Expected Result:**
| tablename | rowsecurity |
|-----------|-------------|
| profiles  | true        |
| recipes   | true        |

---

### 3. Check Policies

**For profiles table:**

```sql
SELECT policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';
```

**Expected Result:** 3 policies
- Users can read own profile
- Users can update own profile
- Anyone can read public profiles

**For recipes table:**

```sql
SELECT policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'recipes';
```

**Expected Result:** 5 policies
- Users can insert own recipes
- Users can read own recipes
- Users can update own recipes
- Users can delete own recipes
- Anyone can read public recipes

---

### 4. Check Indexes

**Run in SQL Editor:**

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'recipes')
ORDER BY tablename, indexname;
```

**Expected Result:** Multiple indexes including:
- idx_profiles_username
- idx_profiles_email
- idx_recipes_user_id
- idx_recipes_is_public
- idx_recipes_created_at
- idx_recipes_user_created
- idx_recipes_tags

---

### 5. Check Triggers

**Run in SQL Editor:**

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
  AND event_object_table IN ('profiles', 'recipes', 'users');
```

**Expected Result:** 3 triggers
- update_profiles_updated_at (on profiles)
- update_recipes_updated_at (on recipes)
- on_auth_user_created (on auth.users)

---

## 📁 Files Created

### Environment Variables
- ✅ `.env.local` - Contains your Supabase credentials

### Supabase Client Utilities
- ✅ `lib/supabase/client.ts` - For client components
- ✅ `lib/supabase/server.ts` - For server components
- ✅ `lib/supabase/middleware.ts` - For middleware
- ✅ `middleware.ts` - Next.js middleware

### TypeScript Types
- ✅ `lib/database.types.ts` - Database type definitions

### Migration Files
- ✅ `supabase/migrations/20251109000001_create_mvp_tables.sql`

---

## 🎯 Next Steps

Now that your database is set up, you can start integrating it into your app:

### Phase 1: Authentication UI
1. Create login/signup pages
2. Add authentication components
3. Add user session management
4. Add protected routes

### Phase 2: Recipe CRUD Operations
1. Create "Save Recipe" functionality
2. Create "My Recipes" page
3. Create "Load Recipe" functionality
4. Create "Edit Recipe" functionality
5. Create "Delete Recipe" functionality

### Phase 3: UI Enhancements
1. Add loading states
2. Add error handling
3. Add success notifications
4. Add recipe list/grid view
5. Add search/filter functionality

---

## 🧪 Test the Connection

You can test if everything is working by creating a simple test page.

**Create `app/test-db/page.tsx`:**

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  // Try to query the database
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      {error ? (
        <div className="text-red-500">
          <p>❌ Error: {error.message}</p>
        </div>
      ) : (
        <div className="text-green-500">
          <p>✅ Database connected successfully!</p>
          <p className="text-sm text-gray-500 mt-2">
            (No profiles yet, but the connection works)
          </p>
        </div>
      )}
    </div>
  )
}
```

**Visit:** http://localhost:3000/test-db

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **RLS is enabled** - Users can only access their own data
3. **Automatic profile creation** - Users get a profile when they sign up
4. **Soft deletes** - Recipes are marked as deleted, not permanently removed

---

## 📚 Useful Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Next.js + Supabase:** https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

---

## 🆘 Troubleshooting

### Issue: "relation 'profiles' does not exist"
**Solution:** Make sure you ran the migration SQL in Supabase SQL Editor

### Issue: Environment variables not found
**Solution:** 
1. Make sure `.env.local` exists in the root directory
2. Restart your Next.js dev server
3. Variables must start with `NEXT_PUBLIC_`

### Issue: RLS policy blocks queries
**Solution:** This is normal before implementing authentication. RLS requires users to be logged in.

---

**Status:** ✅ Database Setup Complete  
**Ready For:** Authentication implementation  
**Estimated Time to Auth:** 2-3 hours
