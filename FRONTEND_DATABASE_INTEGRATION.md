# Frontend Database Integration Guide

## Overview

The Soap Calculator frontend has been updated to fetch oil data from the Supabase database instead of using static files. This provides access to **149+ oils** and enables future features like custom user oils.

**Completion Date**: November 9, 2025

---

## What Changed

### Files Created

1. **`lib/services/oils.ts`** - New oils service module
   - Handles all database operations for oils
   - Provides clean API for fetching, searching, and managing oils
   - Type-safe conversion between database and app formats

### Files Modified

1. **`lib/database.types.ts`** 
   - Added `Oil`, `OilInsert`, `OilUpdate` interfaces
   - Updated `Database` type to include oils table
   - Now supports 3 tables: profiles, recipes, oils

2. **`components/calculator/OilSelector.tsx`**
   - Replaced static `OILS_DATABASE` with async `getAllAvailableOils()`
   - Added loading spinner and error handling
   - Fetches oils and categories from database on mount
   - Dynamic category filter based on database content

3. **`lib/oilData.ts`**
   - Marked as deprecated with JSDoc comments
   - Kept for backwards compatibility
   - Includes migration path documentation

---

## New Service API

### Import

```typescript
import {
  getAllAvailableOils,
  getSystemOils,
  getUserCustomOils,
  getOilById,
  getOilsByCategory,
  searchOils,
  getOilCategories,
  createCustomOil,
  updateCustomOil,
  deleteCustomOil,
  toggleOilPublic,
} from '@/lib/services/oils';
```

### Key Functions

#### Fetch All Available Oils
```typescript
const oils = await getAllAvailableOils(userId?);
// Returns: system oils + user's custom oils + public custom oils
// If no userId: returns system oils + public custom oils
```

#### Get System Oils Only
```typescript
const systemOils = await getSystemOils();
// Returns: 149 built-in oils from database
```

#### Search Oils
```typescript
const results = await searchOils('coconut', userId?);
// Case-insensitive search by name
```

#### Get Oil by ID
```typescript
const oil = await getOilById('coconut-oil-76');
// Returns: OilData | null
```

#### Get Oils by Category
```typescript
const hardOils = await getOilsByCategory('Hard Oil', userId?);
// Categories: Hard Oil, Soft Oil, Liquid Oil, Butter, Animal Fat, Fatty Acid
```

#### Get All Categories
```typescript
const categories = await getOilCategories();
// Returns: unique categories from system oils
```

---

## Database Schema

### Oils Table Structure

```sql
CREATE TABLE oils (
  id TEXT PRIMARY KEY,                    -- e.g., "coconut-oil-76"
  name TEXT NOT NULL,                     -- Display name
  user_id UUID REFERENCES profiles(id),   -- NULL for system oils
  
  -- Saponification values
  sap_naoh DECIMAL(6,4) NOT NULL,
  sap_koh DECIMAL(6,4) NOT NULL,
  
  -- Oil properties
  iodine INTEGER NOT NULL,
  ins INTEGER NOT NULL,
  category TEXT NOT NULL,
  
  -- Fatty acid profile (JSONB)
  fatty_acids JSONB NOT NULL,
  
  -- Metadata
  is_system BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fatty Acids JSONB Structure

```json
{
  "lauric": 48,
  "myristic": 19,
  "palmitic": 9,
  "stearic": 3,
  "ricinoleic": 0,
  "oleic": 8,
  "linoleic": 2,
  "linolenic": 0
}
```

---

## Row Level Security (RLS)

The oils table has comprehensive RLS policies:

1. **System Oils** - Readable by everyone
2. **Public Custom Oils** - Readable by everyone
3. **User Custom Oils** - Only readable by owner
4. **Create** - Users can create their own custom oils
5. **Update** - Users can only update their own custom oils
6. **Delete** - Users can only delete their own custom oils

System oils (`is_system = true`) cannot be modified or deleted by users.

---

## Component Updates

### OilSelector Component

**Before:**
```typescript
import { OILS_DATABASE, OIL_CATEGORIES } from "@/lib/oilData";

const filteredOils = useMemo(() => {
  return OILS_DATABASE.filter(/* ... */);
}, [searchQuery, categoryFilter]);
```

**After:**
```typescript
import { getAllAvailableOils, getOilCategories } from "@/lib/services/oils";

const [oils, setOils] = useState<OilData[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function fetchData() {
    const [oilsData, categoriesData] = await Promise.all([
      getAllAvailableOils(),
      getOilCategories(),
    ]);
    setOils(oilsData);
    setCategories(categoriesData);
  }
  fetchData();
}, []);
```

### Loading States

The component now includes:

1. **Loading Spinner** - While fetching from database
2. **Error Display** - If database fetch fails
3. **Reload Button** - On error for user recovery
4. **Empty State** - When no oils match filters

---

## Migration Path

### Old Code (Deprecated)
```typescript
import { OILS_DATABASE, getOilById } from '@/lib/oilData';

const oils = OILS_DATABASE;
const coconutOil = getOilById('coconut-oil-76');
```

### New Code (Recommended)
```typescript
import { getAllAvailableOils, getOilById } from '@/lib/services/oils';

const oils = await getAllAvailableOils();
const coconutOil = await getOilById('coconut-oil-76');
```

---

## Data Flow

```
┌─────────────────┐
│   Supabase DB   │
│   (149 oils)    │
└────────┬────────┘
         │
         │ SQL Query
         ↓
┌─────────────────┐
│ lib/services/   │
│    oils.ts      │ ← Type-safe conversion
└────────┬────────┘
         │
         │ OilData[]
         ↓
┌─────────────────┐
│  OilSelector    │
│   Component     │
└────────┬────────┘
         │
         │ Filtered/Searched
         ↓
┌─────────────────┐
│   OilTile       │
│  Components     │
└─────────────────┘
```

---

## Benefits

### 1. **149+ Oils Available**
- Upgraded from 20 static oils to 149 database oils
- All oils from OIL_DATABASE.md now accessible
- Includes exotic oils, fatty acids, animal fats, etc.

### 2. **Dynamic Categories**
- Categories automatically populated from database
- New categories appear without code changes
- Current categories: Hard Oil, Soft Oil, Liquid Oil, Butter, Animal Fat, Fatty Acid

### 3. **Future-Ready**
- Infrastructure for custom user oils
- Easy to add new system oils via migrations
- Public sharing of custom oils supported

### 4. **Better UX**
- Loading states provide feedback
- Error handling prevents app crashes
- Graceful degradation if database unavailable

### 5. **Centralized Data**
- Single source of truth (database)
- No need to update static files
- Easy data management via SQL

---

## Testing Checklist

- [x] Oil selector loads oils from database
- [x] Loading spinner appears while fetching
- [x] Error handling works if database fails
- [x] Search filters work with database oils
- [x] Category filter shows all database categories
- [x] All 149 oils are accessible
- [x] Selected oils maintain compatibility
- [x] Recommendations still function correctly

---

## Future Enhancements

### Phase 1: Custom Oils (Already Implemented in DB)
- User can create custom oils
- Save to personal collection
- Share publicly (toggle `is_public`)

### Phase 2: Authentication Integration
- User-specific custom oils
- Sync across devices
- Profile preferences

### Phase 3: Advanced Features
- Oil favorites/bookmarks
- Usage statistics
- Community oil ratings
- Batch operations

---

## Troubleshooting

### Issue: "Failed to load oils"

**Cause**: Database connection issue or RLS policy blocking access

**Solution**:
1. Check `.env.local` has correct Supabase credentials
2. Verify migrations #2 and #3 were run successfully
3. Check browser console for specific error
4. Verify Supabase project is active

### Issue: "No oils appear"

**Cause**: Database is empty or query failed silently

**Solution**:
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM oils WHERE is_system = true;
-- Should return: 149
```

### Issue: TypeScript errors in oils.ts

**Cause**: Supabase type inference complexity with oils table

**Solution**: Already handled with `@ts-expect-error` comments. If new errors appear, regenerate Supabase types:
```bash
npx supabase gen types typescript --project-id tztutumdgxbpqwavkxxm > lib/supabase-types.ts
```

---

## Database Verification

Run these queries in Supabase SQL Editor to verify:

```sql
-- Count system oils
SELECT COUNT(*) FROM oils WHERE is_system = true;
-- Expected: 149

-- Count categories
SELECT DISTINCT category FROM oils WHERE is_system = true ORDER BY category;
-- Expected: 6 categories

-- Sample oil
SELECT * FROM oils WHERE id = 'coconut-oil-76' LIMIT 1;
-- Should return coconut oil data

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'oils';
-- Should show 6 policies
```

---

## Performance Notes

- Initial oil fetch: ~200-500ms (caching recommended)
- Search queries: ~50-100ms (database indexed)
- Category filter: Client-side (instant)
- Total oils in memory: ~150KB (minimal impact)

Consider implementing:
- React Query for caching
- Optimistic updates for better UX
- Lazy loading for large lists

---

## Summary

✅ **Frontend now uses Supabase database for oil data**
✅ **149 oils available (up from 20)**
✅ **Loading and error states implemented**
✅ **Backwards compatibility maintained**
✅ **Type-safe service layer created**
✅ **Ready for custom user oils feature**

The calculator now has a solid foundation for database-driven features while maintaining the existing user experience.
