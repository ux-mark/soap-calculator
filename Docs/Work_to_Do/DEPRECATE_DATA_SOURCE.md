# Remove Deprecated Oil Data Source - Implementation Plan

**Project:** Soap Calculator  
**Issue:** Duplicate data sources causing inconsistent oil data  
**Goal:** Remove `lib/oilData.ts` and ensure all data flows from Supabase  
**Priority:** HIGH - Architectural integrity issue

---

## Current State Analysis

### Problem Summary
The application has **two separate oil databases**:
1. **Hardcoded**: `lib/oilData.ts` (deprecated, 20+ oils)
2. **Supabase**: `oils` table (149+ oils via `lib/services/oils.ts`)

This causes:
- ❌ Duplicate oils appearing with different fatty acid profiles
- ❌ Recommendations using hardcoded data while UI shows Supabase data
- ❌ Inconsistent behavior across components
- ❌ "Fractionated" or variant oils appearing unexpectedly

### Current Data Flow

```
CURRENT (BROKEN):

lib/oilData.ts (HARDCODED)
    ↓
lib/recommendations.ts ← Uses OILS_DATABASE constant
    ↓
Recommendations show oils that may not exist in UI

---SEPARATE PATH---

Supabase Database
    ↓
lib/services/oils.ts
    ↓
components/calculator/OilSelector.tsx
    ↓
UI displays different oils than recommendations
```

### Files Using Deprecated Data

1. **`lib/recommendations.ts`** - Lines 1105, 801, 1165
   - `getRecommendedOils()` - filters `OILS_DATABASE`
   - `findBetterAlternatives()` - searches `OILS_DATABASE`
   - `getIncompatibleOils()` - iterates `OILS_DATABASE`

2. **`lib/oilData.ts`** - The deprecated file itself
   - Exports `OILS_DATABASE` constant
   - Helper functions: `getOilById()`, `searchOils()`, `getOilsByCategory()`

---

## Implementation Plan

### Step 1: Refactor Recommendation Functions
**Duration:** 2-3 hours  
**Complexity:** Medium  
**Files Modified:** 1

#### 1.1 Update Function Signatures

**File:** `lib/recommendations.ts`

**Current:**
```typescript
export function getRecommendedOils(
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  maxRecommendations: number = 5
): OilRecommendation[]
```

**New:**
```typescript
export function getRecommendedOils(
  availableOils: OilData[],              // ← NEW PARAMETER (first)
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  maxRecommendations: number = 5
): OilRecommendation[]
```

#### 1.2 Replace All OILS_DATABASE References

**Find and replace pattern:**
```typescript
// BEFORE
const recommendations: OilRecommendation[] = OILS_DATABASE.filter(
  (oil) => !selectedOilIds.has(oil.id)
).map((oil) => {
  // ...
});

// AFTER
const recommendations: OilRecommendation[] = availableOils.filter(
  (oil) => !selectedOilIds.has(oil.id)
).map((oil) => {
  // ...
});
```

#### 1.3 Functions to Update

Update these functions to accept `availableOils: OilData[]` as first parameter:

1. ✅ `getRecommendedOils(availableOils, ...)`
2. ✅ `getIncompatibleOils(availableOils, ...)`
3. ✅ `findBetterAlternatives(availableOils, ...)`
4. ✅ `getOilRecommendationDetail(availableOils, ...)`

**Internal helper functions:**
- `generateRecommendationDetail()` - may need oils for alternative lookup

#### 1.4 Remove Import Statement

**Remove:**
```typescript
import { OILS_DATABASE } from './oilData';
```

---

### Step 2: Update CalculatorContext
**Duration:** 1 hour  
**Complexity:** Low  
**Files Modified:** 1

#### 2.1 Accept Oils as Provider Prop

**File:** `contexts/CalculatorContext.tsx`

**Add to CalculatorProviderProps:**
```typescript
interface CalculatorProviderProps {
  children: React.ReactNode;
  availableOils: OilData[];  // ← NEW PROP
}
```

**Update provider function:**
```typescript
export function CalculatorProvider({ 
  children, 
  availableOils    // ← NEW PARAMETER
}: CalculatorProviderProps) {
  // ... existing state ...

  // Update all recommendation calls to pass availableOils
  const updateRecommendations = useCallback(() => {
    if (!results) return;

    const context = {
      currentOils: selectedOils,
      currentPercentage: totalPercentage,
      currentQualities: results.qualities,
      currentFattyAcids: results.fattyAcids,
    };

    // Pass availableOils as first parameter
    const recs = getRecommendedOils(
      availableOils,  // ← NEW
      context,
      "hard",
      5
    );
    setRecommendations(recs);

    const incomp = getIncompatibleOils(
      availableOils,  // ← NEW
      context,
      "hard"
    );
    setIncompatibleOils(incomp);
  }, [selectedOils, results, availableOils]);  // ← Add to dependencies
}
```

#### 2.2 Update All Recommendation Calls

Search for these patterns and add `availableOils` as first argument:
- `getRecommendedOils(` → `getRecommendedOils(availableOils,`
- `getIncompatibleOils(` → `getIncompatibleOils(availableOils,`
- `getOilRecommendationDetail(` → `getOilRecommendationDetail(availableOils,`

---

### Step 3: Update OilSelector Component
**Duration:** 1 hour  
**Complexity:** Low  
**Files Modified:** 1

#### 3.1 Pass Oils to Context

**File:** `components/calculator/OilSelector.tsx`

**Current state management:**
```typescript
const [oils, setOils] = useState<OilData[]>([]);

useEffect(() => {
  async function fetchData() {
    const [oilsData, categoriesData] = await Promise.all([
      getAllAvailableOils(),
      getOilCategories(),
    ]);
    setOils(oilsData);
    setCategories(['all', ...categoriesData]);
  }
  fetchData();
}, []);
```

**This is already correct!** The oils are fetched from Supabase.

#### 3.2 Ensure Oils Reach Context

The parent component that wraps `<CalculatorProvider>` must pass the oils:

**Find the calculator page component** (likely `app/calculator/page.tsx` or similar)

**Add:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { getAllAvailableOils } from '@/lib/services/oils';
import { OilData } from '@/lib/types';

export default function CalculatorPage() {
  const [oils, setOils] = useState<OilData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllAvailableOils()
      .then(setOils)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <CalculatorProvider availableOils={oils}>
      <OilSelector />
      {/* other components */}
    </CalculatorProvider>
  );
}
```

---

### Step 4: Create OilsProvider (Optional - Better Architecture)
**Duration:** 2 hours  
**Complexity:** Medium  
**Files Modified:** 3 (1 new)

#### 4.1 Create Centralized Oils Context

**File:** `contexts/OilsContext.tsx` (NEW FILE)

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OilData } from '@/lib/types';
import { getAllAvailableOils } from '@/lib/services/oils';

interface OilsContextType {
  oils: OilData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const OilsContext = createContext<OilsContextType | undefined>(undefined);

export function OilsProvider({ children }: { children: React.ReactNode }) {
  const [oils, setOils] = useState<OilData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOils = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllAvailableOils();
      setOils(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load oils');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOils();
  }, []);

  return (
    <OilsContext.Provider value={{ oils, isLoading, error, refetch: fetchOils }}>
      {children}
    </OilsContext.Provider>
  );
}

export function useOils() {
  const context = useContext(OilsContext);
  if (context === undefined) {
    throw new Error('useOils must be used within an OilsProvider');
  }
  return context;
}
```

#### 4.2 Wrap App with OilsProvider

**File:** `app/layout.tsx` or calculator-specific layout

```typescript
import { OilsProvider } from '@/contexts/OilsContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OilsProvider>
      {children}
    </OilsProvider>
  );
}
```

#### 4.3 Update Components to Use OilsContext

**In `CalculatorContext.tsx`:**
```typescript
import { useOils } from './OilsContext';

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const { oils: availableOils } = useOils();
  
  // Rest of implementation uses availableOils
}
```

**In `OilSelector.tsx`:**
```typescript
import { useOils } from '@/contexts/OilsContext';

export function OilSelector() {
  const { oils, isLoading, error } = useOils();
  
  // Use oils directly, no need for local state
}
```

---

### Step 5: Deprecate lib/oilData.ts
**Duration:** 30 minutes  
**Complexity:** Low  
**Files Modified:** 1

#### 5.1: Complete Removal (After Testing)

Once all references are updated and tested:

```bash
git rm lib/oilData.ts
```

**Important:** Keep the file in git history as reference for:
- Original oil data structure
- Fatty acid profiles
- SAP values

---


### Step 6: Testing & Validation
**Duration:** 2-3 hours  
**Complexity:** High  
**Critical:** Do not skip this step

#### 6.1 Automated Tests

Create test file: `__tests__/oil-data-integration.test.ts`

```typescript
import { getAllAvailableOils } from '@/lib/services/oils';
import { getRecommendedOils, getIncompatibleOils } from '@/lib/recommendations';

describe('Oil Data Integration', () => {
  let oils: OilData[];

  beforeAll(async () => {
    oils = await getAllAvailableOils();
  });

  test('getAllAvailableOils returns data from Supabase', async () => {
    expect(oils.length).toBeGreaterThan(100);
    expect(oils.every(oil => oil.id && oil.name)).toBe(true);
  });

  test('getRecommendedOils uses provided oils array', () => {
    const context = {
      currentOils: [oils[0]],
      currentPercentage: 30,
      currentQualities: { /* mock */ },
      currentFattyAcids: { /* mock */ },
    };

    const recommendations = getRecommendedOils(oils, context, "hard", 5);
    
    // All recommended oils should be from provided array
    expect(recommendations.every(rec => 
      oils.some(oil => oil.id === rec.oil.id)
    )).toBe(true);
  });

  test('no OILS_DATABASE references exist', async () => {
    const recommendationsFile = await import('@/lib/recommendations');
    
    // Should not have OILS_DATABASE in module scope
    expect('OILS_DATABASE' in recommendationsFile).toBe(false);
  });
});
```

#### 6.2 Manual Testing Checklist

**Test Scenario 1: Fresh Calculator**
- [ ] Open calculator with no oils selected
- [ ] Verify all oils displayed are from Supabase
- [ ] Check: No duplicate oils appear
- [ ] Check: "fractionated" variants only appear if intentional

**Test Scenario 2: Recommendations Match Display**
- [ ] Add coconut oil at 30%
- [ ] Verify recommendations section shows valid oils
- [ ] Check: All recommended oils exist in main grid
- [ ] Check: No "oil not found" errors

**Test Scenario 3: Alternatives**
- [ ] Select palm oil for liquid soap
- [ ] Verify "Better Alternatives" shown
- [ ] Check: All alternatives exist in main grid
- [ ] Click alternative → Should add successfully

**Test Scenario 4: Incompatible Oils**
- [ ] Add coconut oil at 30% (< 50% threshold)
- [ ] Verify some oils are disabled
- [ ] Check: Disabled oils are from same list as displayed oils
- [ ] Hover disabled oil → Tooltip explains why

**Test Scenario 5: Search & Filter**
- [ ] Search for "coconut"
- [ ] Verify results are from Supabase
- [ ] Filter by "Hard Oil" category
- [ ] Check: Category filter matches database categories

#### 6.3 Error Scenarios

**Test Scenario 6: Database Unavailable**
- [ ] Disconnect network
- [ ] Check: Error message displays
- [ ] Check: App doesn't crash
- [ ] Reconnect → Verify reload works

**Test Scenario 7: Empty Database**
- [ ] Temporarily delete all system oils (in test DB)
- [ ] Check: "No oils available" message
- [ ] Check: No infinite loops or crashes

---

## Success Criteria

### Must Have ✅
1. ✅ Zero references to `OILS_DATABASE` in `lib/recommendations.ts`
2. ✅ All recommendation functions accept `availableOils` parameter
3. ✅ `CalculatorContext` receives oils from Supabase
4. ✅ No duplicate oils in UI
5. ✅ Recommendations use same data as display
6. ✅ All tests pass

### Should Have 🎯
1. ✅ `OilsProvider` centralizes oil management
2. ✅ Loading states during oil fetch
3. ✅ Error handling for database failures
4. ✅ Graceful degradation if Supabase unavailable

### Nice to Have 💫
1. ⭕ Caching layer for oil data (React Query)
2. ⭕ Offline mode with local storage fallback
3. ⭕ Oil data versioning
4. ⭕ Migration guide for custom oils

---

## Rollback Plan

If issues occur after deployment:

### Immediate Rollback
```bash
# Revert the changes
git revert <commit-hash>

# Or restore previous version
git checkout <previous-commit>
```

### Temporary Fix
```typescript
// In lib/recommendations.ts - emergency patch
import { getAllAvailableOils } from '@/lib/services/oils';

let CACHED_OILS: OilData[] | null = null;

async function getOils(): Promise<OilData[]> {
  if (!CACHED_OILS) {
    CACHED_OILS = await getAllAvailableOils();
  }
  return CACHED_OILS;
}

// Update functions to use async
export async function getRecommendedOils(/* ... */) {
  const oils = await getOils();
  // ... rest of logic
}
```

---

## Files Checklist

### Files to Modify
- [ ] `lib/recommendations.ts` - Add availableOils parameter
- [ ] `contexts/CalculatorContext.tsx` - Accept and pass oils
- [ ] `components/calculator/OilSelector.tsx` - Verify Supabase usage
- [ ] `app/calculator/page.tsx` - Fetch oils, pass to context

### Files to Create (Optional)
- [ ] `contexts/OilsContext.tsx` - Centralized oil management
- [ ] `__tests__/oil-data-integration.test.ts` - Integration tests

### Files to Deprecate
- [ ] `lib/oilData.ts` - Mark as deprecated or delete

### Files to Update
- [ ] `README.md` - Update architecture documentation
- [ ] `Docs/Developer_Notes/FRONTEND_DATABASE_INTEGRATION.md` - Note deprecation
- [ ] `Docs/Work_to_Do/DUPLICATE_DATA_SOURCE_ISSUE.md` - Close issue

---

## AI Agent Execution Instructions

Execute steps in order. Do not skip testing phases.

```bash
# Step 1: Refactor recommendations.ts
# - Add availableOils parameter to all functions
# - Replace OILS_DATABASE with availableOils
# - Remove import statement

# Step 2: Update CalculatorContext.tsx
# - Add availableOils prop to provider
# - Pass to all recommendation function calls
# - Add to dependency arrays

# Step 3: Update parent component
# - Fetch oils from getAllAvailableOils()
# - Pass to CalculatorProvider

# Step 4: (Optional) Create OilsProvider
# - Implement centralized context
# - Wrap app layout
# - Update components to use context

# Step 5: Deprecate lib/oilData.ts
# - Remove OILS_DATABASE export
# - Add deprecation warnings
# - Or delete file entirely

# Step 6: Testing
# - Run automated tests
# - Complete manual test scenarios
# - Verify no regressions

# Step 7: Deploy
# - Commit changes
# - Deploy to staging
# - Monitor for issues
# - Deploy to production
```

---

## Success Metrics

### Before Implementation
- ❌ 2 separate oil data sources
- ❌ Duplicate oils appearing
- ❌ Inconsistent recommendations
- ❌ Hardcoded data out of sync with Supabase

### After Implementation
- ✅ 1 single source of truth (Supabase)
- ✅ No duplicate oils
- ✅ Consistent recommendations matching UI
- ✅ All 149+ oils accessible
- ✅ Future-ready for custom oils
- ✅ Cleaner architecture

---

## Contact & Support

**Issues during implementation:**
- Check `Docs/Work_to_Do/DUPLICATE_DATA_SOURCE_ISSUE.md`
- Review `Docs/Developer_Notes/FRONTEND_DATABASE_INTEGRATION.md`
- Verify Supabase connection in `.env.local`

**Questions:**
- Oil data structure: See `lib/types.ts`
- Recommendation algorithm: See `lib/recommendations.ts`
- Database schema: See Supabase SQL Editor

---

**End of Implementation Plan**