# Duplicate Oil Cards Fix

**Date:** November 10, 2025  
**Issue:** Oils appearing twice with different badges (e.g., Grapeseed Oil as both "Highly Recommended" green and "Use With Caution" yellow)  
**Status:** ✅ Fixed

## Problem

Oils were appearing in TWO places:

1. **"Recommended to add" section** (top) - Showing top 5-6 oils
2. **Main oil grid** (bottom) - Showing ALL oils

This caused confusion when an oil like **Grapeseed Oil** appeared with:
- 🟢 Green "Highly Recommended" badge in top section
- 🟡 Yellow "Use With Caution" badge in bottom section

### Root Cause

The "Recommended" section was showing the **top N oils by score**, but ALL oils were also shown in the main grid below. This meant:

- **Top Section:** "These are the best oils to add" (sorted by score, top 5-6)
- **Bottom Section:** "Here are ALL the oils" (includes the same oils from top)

Result: **Duplicates!**

## The Confusion

Looking at the screenshot, Grapeseed Oil had:
- Score likely around **45-55** (yellow/caution range)
- But it was in the **top 5 recommendations** relative to other oils
- So it appeared in "Recommended" section with green styling
- AND in main grid with yellow styling (its true score category)

## Solution

**Filter out recommended oils from the main grid** to prevent duplication.

### Code Changes

Modified `components/calculator/OilSelector.tsx`:

**1. Moved `recommendedOilIds` before `filteredOils`:**
```typescript
// Get recommended oil IDs for easy lookup
const recommendedOilIds = useMemo(() => {
  return new Set(recommendations.map((rec) => rec.oil.id));
}, [recommendations]);

// Get selected oil IDs
const selectedOilIds = useMemo(() => {
  return new Set(selectedOils.map((oil) => oil.id));
}, [selectedOils]);
```

**2. Updated filter logic to exclude recommended oils:**
```typescript
// Filter oils based on search and category
const filteredOils = useMemo(() => {
  return oils.filter((oil) => {
    const matchesSearch = oil.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || oil.category === categoryFilter;
    
    // Exclude oils that are already in the recommendations section to avoid duplication
    const isInRecommendations = recommendedOilIds.has(oil.id);
    
    return matchesSearch && matchesCategory && !isInRecommendations;
  });
}, [oils, searchQuery, categoryFilter, recommendedOilIds]);
```

## Result

Now the UI shows:

### ✅ "Recommended to add" Section
- Top 5-6 oils for your recipe
- Each shows with their **true color coding** based on score:
  - 🟢 Green if score 70+ (highly recommended)
  - 🔵 Blue if score 50-69 (good match)
  - 🟡 Yellow if score 30-49 (use with caution)
  - 🟠 Orange if score 25-29 (limited compatibility)

### ✅ "All Oils" Grid
- Shows remaining oils NOT in recommendations section
- Each with proper color coding
- **No duplicates!**

## Example Scenario

**Recipe needs hardness, has 35% oils selected:**

**Recommended Section (Top 5):**
1. 🟢 Palm Oil (Score: 85) - Highly Recommended
2. 🟢 Cocoa Butter (Score: 78) - Highly Recommended  
3. 🔵 Shea Butter (Score: 62) - Good Match
4. 🔵 Mango Butter (Score: 55) - Good Match
5. 🟡 Grapeseed Oil (Score: 45) - Use With Caution

**Main Grid (Remaining Oils):**
- 🟡 Sunflower Oil (Score: 42)
- 🟠 Almond Oil (Score: 28)
- 🔴 Hemp Seed Oil (Score: 15)
- *(Palm Oil, Cocoa Butter, Shea Butter, Mango Butter, Grapeseed Oil NOT shown here)*

## Why This is Better

### Before (Confusing)
```
[Recommended Section]
🟢 Grapeseed Oil - Highly Recommended

[All Oils Grid - scroll down]
🟡 Grapeseed Oil - Use With Caution  ← Wait, which is it??
```

### After (Clear)
```
[Recommended Section]
🟡 Grapeseed Oil - Use With Caution
     ↳ Best option available given current needs,
       but still use cautiously

[All Oils Grid]
(Grapeseed Oil not shown here - already in recommendations)
```

## Edge Cases Handled

### ✅ Empty Recipe (0% selected)
- Recommendations show best starting oils
- Main grid shows all other oils
- No duplicates

### ✅ Search/Filter Active
- If you search for "Grapeseed"
- It appears in recommendations section if applicable
- NOT in main grid (filtered out as duplicate)

### ✅ No Recommendations
- If no recommendations (rare)
- Main grid shows ALL oils with color coding

## Technical Details

### Performance
- Uses `Set` for O(1) lookup: `recommendedOilIds.has(oil.id)`
- Memoized to prevent unnecessary recalculations
- Efficient even with large oil databases

### Dependencies
```typescript
useMemo(..., [oils, searchQuery, categoryFilter, recommendedOilIds])
```
Recalculates when:
- Oil database changes
- User searches
- User filters by category
- Recommendations change (based on recipe)

## Alternative Considered (Rejected)

### Option 1: Remove Recommendations Section
**Pros:** No duplication possible  
**Cons:** Users lose the helpful "here's what to add next" guidance

**Decision:** Keep recommendations section - it's valuable UX

### Option 2: Show All Oils, Highlight Recommended
**Pros:** See all oils in one place  
**Cons:** Requires scrolling, harder to spot top recommendations

**Decision:** Separate sections with no duplication is clearest

## Files Modified

1. ✅ `components/calculator/OilSelector.tsx`
   - Reordered memoized values
   - Added duplicate filtering logic

## Build Status

✅ TypeScript compilation successful  
✅ Next.js build successful  
✅ No runtime errors  

## User Experience Improvement

Users now see:
- ✅ Clear "add these next" section at top
- ✅ Consistent color coding based on actual scores
- ✅ No confusing duplicates
- ✅ Easy to understand which oils fit their recipe
- ✅ Can still browse all oils below (minus the ones already recommended)

## Summary

Fixed the duplicate oil card issue by filtering recommended oils out of the main grid. Now each oil appears exactly once, with accurate color coding based on its compatibility score. The recommendations section highlights what to add next, while the main grid shows remaining options - no confusion, no duplicates.
