# Duplicate Data Source Issue

**Date:** November 10, 2025  
**Issue:** Oils appearing with different data / duplicates due to two separate data sources  
**Status:** ⚠️ **CRITICAL ARCHITECTURAL ISSUE** - Needs Refactoring  
**Priority:** HIGH

## The Problem

The application has **TWO SEPARATE** oil databases running simultaneously, causing:
- ✗ Duplicate oils with different fatty acid profiles
- ✗ Inconsistent recommendations
- ✗ "Fractionated" or variant oils appearing unexpectedly  
- ✗ Data source confusion

### Evidence from Screenshot

**Shea Butter appears TWICE:**

1. **First Shea Butter:**
   - Oleic 45%, Stearic 43%, Linoleic 6%
   - Hardness: 0 → 47
   - Standard shea butter profile

2. **"fractionated" (Bottom-left):**
   - Oleic 73%, Linoleic 11%, Stearic 10%
   - Hardness: 0 → 16
   - Completely different composition
   - Says "Unsaturated fats remain liquid"

These are likely:
1. From **hardcoded database** (`lib/oilData.ts`)
2. From **Supabase database** (seeded with different/additional oils)

## Root Cause: Architectural Split

### Data Source #1: Hardcoded Database

**File:** `lib/oilData.ts`  
**Used By:** `lib/recommendations.ts`

```typescript
export const OILS_DATABASE: OilData[] = [
  {
    id: "shea-butter",
    name: "Shea Butter",
    sap_naoh: 0.128,
    // ... standard shea composition
  },
  // ... 20+ oils
];
```

**Usage:**
```typescript
// recommendations.ts - Line 1105
const recommendations: OilRecommendation[] = OILS_DATABASE.filter(
  (oil) => !selectedOilIds.has(oil.id)
).map((oil) => {
  // Generate recommendations from hardcoded data
});

// Line 801 - Finding alternatives
const highOleicOils = OILS_DATABASE.filter(/* ... */);

// Line 1165 - Finding incompatible oils
OILS_DATABASE.forEach((oil) => {
  // Check compatibility
});
```

### Data Source #2: Supabase Database

**Service:** `lib/services/oils.ts`  
**Used By:** `components/calculator/OilSelector.tsx`

```typescript
// OilSelector.tsx - Line 43
const [oilsData, categoriesData] = await Promise.all([
  getAllAvailableOils(), // ← Fetches from Supabase!
  getOilCategories(),
]);
```

**What Supabase Returns:**
- System oils (`is_system = true`)
- User custom oils (`user_id = current_user`)  
- Public custom oils (`is_public = true`)

**Result:** Potentially different oils, different data, or duplicates if:
- Migration script seeded different data
- Users added custom variations
- Public oils added variations

## The Mismatch

| Component | Data Source | Problem |
|-----------|------------|---------|
| **OilSelector Display** | Supabase | Shows what's in database (could have "fractionated" variant) |
| **Recommendations Engine** | Hardcoded | Searches hardcoded list only |
| **Alternative Suggestions** | Hardcoded | Suggests oils that may not exist in Supabase |
| **Incompatible Detection** | Hardcoded | Marks oils from wrong list |

### Specific Code Locations

**Recommendations using hardcoded:**
```typescript
// lib/recommendations.ts:1105
export function getRecommendedOils(
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  maxRecommendations: number = 5
): OilRecommendation[] {
  const selectedOilIds = new Set(context.currentOils.map((oil) => oil.id));

  const recommendations: OilRecommendation[] = OILS_DATABASE.filter( // ← HARDCODED!
    (oil) => !selectedOilIds.has(oil.id)
  ).map((oil) => {
    // ...
  });
}
```

**Display using Supabase:**
```typescript
// OilSelector.tsx:43
const [oilsData, categoriesData] = await Promise.all([
  getAllAvailableOils(), // ← SUPABASE!
  getOilCategories(),
]);

setOils(oilsData); // ← Different data than recommendations use!
```

## Why This Causes Your Issue

1. **Supabase has "fractionated" shea** (or similar variant)
2. **Hardcoded has standard shea**
3. **Both appear** in the display because:
   - Supabase oils shown in main grid
   - Hardcoded recommendations show regular shea
4. **Different data** because they're literally different sources

## The Solution (Refactoring Required)

### Option 1: Pass Available Oils to Recommendations ⭐ **RECOMMENDED**

Modify recommendations functions to accept the oil list as a parameter:

```typescript
// BEFORE
export function getRecommendedOils(
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  maxRecommendations: number = 5
): OilRecommendation[] {
  // Uses OILS_DATABASE
}

// AFTER
export function getRecommendedOils(
  availableOils: OilData[],        // ← NEW PARAMETER
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  maxRecommendations: number = 5
): OilRecommendation[] {
  const selectedOilIds = new Set(context.currentOils.map((oil) => oil.id));
  
  const recommendations: OilRecommendation[] = availableOils.filter( // ← USE PARAMETER
    (oil) => !selectedOilIds.has(oil.id)
  ).map((oil) => {
    // ...
  });
}
```

**Also update:**
- `getIncompatibleOils(availableOils, ...)`
- `findBetterAlternatives(availableOils, ...)`
- `generateRecommendationDetail()` - pass oils for alternative lookup

### Option 2: Remove Hardcoded Database ⚠️ **BREAKING**

Delete `lib/oilData.ts` entirely and ONLY use Supabase.

**Pros:**
- Single source of truth
- No duplication possible

**Cons:**
- Requires refactoring all recommendation logic
- What if database is down?
- What about offline use?

### Option 3: Sync Hardcoded → Supabase 🔄 **TEMPORARY**

Keep hardcoded as backup, but ensure Supabase has exact same data.

**Pros:**
- Quick fix
- Maintains fallback

**Cons:**
- Still two sources to maintain
- Doesn't solve custom oils issue

## Recommended Implementation Plan

### Phase 1: Immediate Fix (1-2 hours)

1. ✅ **Pass oils to CalculatorContext**
   - Fetch oils in Calculator page/component
   - Pass to CalculatorProvider as prop
   - Store in context state

2. ✅ **Update recommendations functions**
   - Add `availableOils: OilData[]` parameter
   - Replace `OILS_DATABASE` with `availableOils`
   - Update all callers

3. ✅ **Update CalculatorContext**
   - Accept availableOils in provider
   - Pass to `getRecommendedOils(availableOils, ...)`
   - Pass to `getIncompatibleOils(availableOils, ...)`

### Phase 2: Clean Architecture (2-3 hours)

1. ✅ **Create OilsProvider** (separate context)
   ```typescript
   // contexts/OilsContext.tsx
   export function OilsProvider({ children }) {
     const [oils, setOils] = useState<OilData[]>([]);
     
     useEffect(() => {
       getAllAvailableOils().then(setOils);
     }, []);
     
     return (
       <OilsContext.Provider value={{ oils }}>
         {children}
       </OilsContext.Provider>
     );
   }
   ```

2. ✅ **Use OilsContext everywhere**
   - OilSelector uses it
   - CalculatorContext uses it
   - Always same data

3. ✅ **Deprecate hardcoded database**
   - Keep for fallback only
   - Add comment: "// Legacy - use OilsContext instead"

### Phase 3: Database Cleanup (1 hour)

1. ✅ **Audit Supabase oils table**
   - Find duplicates
   - Check for variant oils (fractionated, etc.)
   - Decide: keep variants or remove?

2. ✅ **Clean data**
   - Remove unintended duplicates
   - Ensure consistent naming
   - Add proper categories

## Files That Need Changes

### Must Change:
1. ✅ `lib/recommendations.ts` - Add availableOils parameter to all functions
2. ✅ `contexts/CalculatorContext.tsx` - Fetch and pass oils
3. ✅ `components/calculator/OilSelector.tsx` - Pass oils to context

### Should Change (Phase 2):
4. ✅ `contexts/OilsContext.tsx` - NEW FILE - Centralized oils management
5. ✅ `app/layout.tsx` or `app/page.tsx` - Wrap with OilsProvider

### Maybe Change:
6. ⚠️ `lib/oilData.ts` - Deprecate or remove entirely

## Testing Checklist

After refactoring:
- [ ] No duplicate oils appear in UI
- [ ] Recommendations match displayed oils
- [ ] Alternatives are from available oils only
- [ ] Custom oils (if any) show in recommendations
- [ ] Fractionated/variant oils handled correctly
- [ ] Search finds all oils (Supabase data)
- [ ] No references to missing oils

## Current Workaround (Quick Fix)

**If you want to quickly remove duplicates:**

1. Check Supabase database for duplicate IDs
2. Delete the "fractionated" entry (or merge data)
3. Ensure seeded data matches hardcoded database exactly

But this doesn't solve the architectural issue.

## Impact Assessment

**Users Currently Experience:**
- ❌ Confusing duplicates
- ❌ Inconsistent data (different fatty acid profiles)
- ❌ Recommendations for oils not in their list
- ❌ Missing recommendations for custom oils they added

**After Fix:**
- ✅ Single source of truth
- ✅ No duplicates
- ✅ Consistent data everywhere
- ✅ Recommendations work with custom oils
- ✅ Better UX

## Estimated Effort

- **Phase 1 (Quick Fix):** 1-2 hours coding + testing
- **Phase 2 (Clean Architecture):** 2-3 hours coding + testing
- **Phase 3 (Database Cleanup):** 1 hour
- **Total:** 4-6 hours for complete solution

## Status

🔴 **BLOCKING ISSUE** - Affects data integrity and user experience

**Recommended Action:** Implement Phase 1 immediately to fix duplicate issue, then schedule Phase 2 for architectural improvement.

---

**Next Steps:**
1. Decide: Keep variants (fractionated oils) or remove?
2. Implement Phase 1 refactoring
3. Clean database
4. Test thoroughly
5. Deploy fix

Would you like me to implement the Phase 1 fix now?
