# Soap Type Detection Fix

**Date:** November 10, 2025  
**Issue:** Hard soap copy showing for liquid soap selections (and vice versa)  
**Status:** ✅ Fixed

## The Problem

When users selected **"Liquid Soap"** in the recipe inputs, they were seeing recommendations and copy appropriate for **hard/bar soap**:

### Example: Goose Fat for Liquid Soap
**What was shown (WRONG):**
```
🔵 Good Match

Adds 27% palmitic + stearic for saturated fats crystallize 
to form solid bar structure • Best at 30% of recipe

Hardness: 0 → 27 ✓

Only 27 hardness contribution (need 29+)
Bars stay soft, deform easily, short shelf life

Try instead:
palm oil - 49% palmitic + stearic for bar structure
```

**What SHOULD be shown (CORRECT):**
```
🟡 Use With Caution (or 🔴 Incompatible)

27% palmitic + stearic may cause thickening in liquid soap •
High saturated fats can crystallize in KOH solutions •
Use sparingly, max 10%

Hardness: 0 → 27 (want 5-15 for liquid soap)

Try instead:
olive oil - 69% oleic stays liquid in KOH soap
sunflower oil - 16% oleic, low saturates
```

## Root Cause

In `components/calculator/OilSelector.tsx`, the soap type was **hardcoded** to `"hard"`:

```typescript
// Line 252 - WRONG
recommendationDetail = getOilRecommendationDetail(oil, context, "hard");
```

This meant:
- ✅ Top recommendations section worked (uses context's soap type)
- ❌ Main oil grid used hardcoded "hard" for all detail generation
- ❌ Liquid soap users saw bar soap copy
- ❌ Hard soap users would see liquid soap copy if we ever reversed the default

## The Fix

### 1. Added `inputs` to OilSelector Context

```typescript
export function OilSelector() {
  const {
    selectedOils,
    addOil,
    recommendations,
    incompatibleOilIds,
    totalPercentage,
    results,
    inputs,  // ← ADDED THIS
  } = useCalculator();
```

### 2. Used Actual Soap Type from Inputs

```typescript
// Use the actual soap type from recipe inputs
const soapType = inputs.soapType === "liquid" ? "liquid" : "hard";
recommendationDetail = getOilRecommendationDetail(oil, context, soapType);
```

## What This Changes

### For LIQUID SOAP (KOH)

**High Saturated Fat Oils (Palm, Tallow, Goose Fat, etc.):**
- ✅ Will show as 🟡 Yellow or 🟠 Orange (caution/limited)
- ✅ Copy warns about crystallization and thickening
- ✅ Suggests high-oleic alternatives (olive, sunflower, safflower)
- ✅ Quality ranges: Hardness 5-15 (not 29-54)

**High Oleic Oils (Olive, Sunflower, Safflower):**
- ✅ Will show as 🟢 Green or 🔵 Blue (highly recommended/good)
- ✅ Copy explains how they stay liquid
- ✅ Emphasizes conditioning and fluidity
- ✅ No warnings about being "too soft"

### For HARD SOAP (NaOH)

**High Saturated Fat Oils (Palm, Tallow, Cocoa Butter):**
- ✅ Will show as 🟢 Green or 🔵 Blue (highly recommended/good)
- ✅ Copy explains bar structure and hardness
- ✅ Mentions unmolding time and bar longevity
- ✅ Quality ranges: Hardness 29-54

**High Oleic/Soft Oils (Too Much Olive, Sunflower):**
- ✅ Will show caution if they make bars too soft
- ✅ Copy warns about slow curing and mushiness
- ✅ Suggests adding hardening oils
- ✅ Warns about short shelf life for soft bars

## Expected Behavior Examples

### Scenario 1: Liquid Soap Recipe

**User selects:** Liquid Soap + KOH

**Goose Fat (27% saturated):**
```
🟡 Use With Caution

27% palmitic + stearic may thicken liquid soap • 
Use sparingly if needed for specific properties • 
Max 10-15% of recipe

Hardness: 0 → 27
(Liquid soap wants 5-15, this pushes higher)

💡 For liquid soap, prefer high-oleic oils (olive, sunflower)
```

**Olive Oil (69% oleic):**
```
🟢 Highly Recommended

69% oleic acid stays perfectly liquid in KOH soap • 
Provides excellent conditioning • 
Ideal for liquid soap base

Hardness: 0 → 12 ✓
Conditioning: 0 → 82 ✓

💡 Excellent as main oil for liquid soap at 40-70%
```

### Scenario 2: Hard Soap Recipe

**User selects:** Hard Soap + NaOH

**Goose Fat (27% saturated):**
```
🔵 Good Match

27% palmitic + stearic provides some bar structure • 
Balances hardness with conditioning • 
Best at 20-30% of recipe

Hardness: 0 → 27
(Need 29+ for firm bars - add more hardening oils)

💡 Combine with palm or cocoa butter for better hardness
```

**Palm Oil (49% saturated):**
```
🟢 Highly Recommended

49% palmitic + stearic creates firm bar structure • 
Bars unmold in 24-48hrs and last 3-4 weeks • 
Perfect hardening oil for soap bars

Hardness: 0 → 58 ✓

💡 Use as base oil at 25-40% for bar structure
```

## Quality Range Differences

The system uses different quality ranges for each soap type:

### Hard Soap Ranges
```typescript
{
  hardness: { min: 29, max: 54, ideal: { min: 29, max: 54 } },
  cleansing: { min: 12, max: 22, ideal: { min: 12, max: 22 } },
  conditioning: { min: 44, max: 69, ideal: { min: 44, max: 69 } },
  // ...
}
```

### Liquid Soap Ranges
```typescript
{
  hardness: { min: 5, max: 15, ideal: { min: 8, max: 12 } },
  cleansing: { min: 10, max: 20, ideal: { min: 12, max: 16 } },
  conditioning: { min: 65, max: 80, ideal: { min: 72, max: 77 } },
  // ...
}
```

## Files Modified

1. ✅ `components/calculator/OilSelector.tsx`
   - Added `inputs` to context destructuring
   - Changed hardcoded `"hard"` to `inputs.soapType`

## Verification

### Before Fix
```typescript
// Always used "hard" regardless of user selection
recommendationDetail = getOilRecommendationDetail(oil, context, "hard");
```

### After Fix
```typescript
// Uses actual soap type from recipe inputs
const soapType = inputs.soapType === "liquid" ? "liquid" : "hard";
recommendationDetail = getOilRecommendationDetail(oil, context, soapType);
```

## Build Status

✅ TypeScript compilation successful  
✅ Next.js build successful  
✅ No runtime errors

## Testing Checklist

- ✅ Liquid soap shows high-oleic oils as green (recommended)
- ✅ Liquid soap shows saturated fat oils as yellow/orange (caution)
- ✅ Hard soap shows saturated fat oils as green/blue (recommended)
- ✅ Hard soap shows too-soft oils with warnings
- ✅ Copy matches soap type in all cases
- ✅ Quality ranges appropriate for soap type
- ✅ Switching between soap types updates recommendations

## User Impact

**Before:** Confusing recommendations that didn't match soap type  
**After:** Accurate, context-aware guidance for the specific soap being made

Users making liquid soap will now see:
- ✅ Encouragement to use high-oleic oils
- ✅ Warnings about saturated fats crystallizing
- ✅ Correct hardness targets (low, not high)
- ✅ Appropriate alternatives

Users making bar soap will see:
- ✅ Encouragement to use hardening oils
- ✅ Warnings about soft oils making mushy bars
- ✅ Correct hardness targets (high, not low)
- ✅ Appropriate structure-building recommendations

## Summary

Fixed the hardcoded "hard" soap type in OilSelector to use the actual `inputs.soapType` value. Now all recommendation copy, quality projections, and guidance accurately reflect whether the user is making liquid soap (KOH) or hard soap (NaOH).

The recommendation engine already had full support for both soap types - we just weren't using it correctly in the main oil grid display!
