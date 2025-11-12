# Specification: Dual Input Mode for Oil Quantities

## Overview
Enhance the soap calculator's "Selected Oils" interface to support both percentage-based and weight-based (grams) input for each oil, with automatic conversion between the two modes.

## Current State
- Users input oil quantities as percentages only
- Total must equal 100%
- Each oil has a single numeric input field

## Required Enhancement
Enable users to input oil quantities in either:
1. **Percentage mode** (current behavior)
2. **Weight mode** (grams) - new capability

## Functional Requirements

### 1. Input Mode Selection
**Per-oil toggle:**
- Each oil row needs an input mode selector (% or g)
- Default: percentage mode
- Mode changes should be independent per oil
- Visual indicator showing active mode

**Alternative approach:**
- Single global toggle affecting all oils simultaneously
- Consider UX: which pattern serves users better?

### 2. Conversion Logic
**When switching from % to g:**
- Requires total batch weight to be defined
- Formula: `grams = (percentage / 100) × total_batch_weight`
- If batch weight undefined, prompt user or disable weight mode

**When switching from g to %:**
- Formula: `percentage = (oil_grams / total_batch_weight) × 100`
- Recalculate all percentages if any weight changes

### 3. Validation Rules
**Percentage mode (unchanged):**
- All oils must sum to 100%
- Show current total
- Warning if ≠ 100%

**Weight mode (new):**
- Individual weights can be any positive number
- Sum of weights = actual total batch weight
- Display: "Total: {sum}g" instead of "Total: {sum}%"
- No constraint that weights must equal a preset total

### 4. Total Batch Weight
**New required field:**
- Input: "Total Batch Weight: [___] g"
- Position: Above oil list or in header
- Required for % ↔ g conversion
- Editable at any time
- Changing this recalculates all values in weight mode

### 5. Persistence & Consistency
**When values change:**
- If in weight mode and weights change: recalculate percentages
- If in weight mode and batch weight changes: recalculate all grams
- If in percentage mode: calculate grams from percentages
- Maintain bidirectional sync

**Edge cases:**
- User inputs 50% coconut oil in % mode
- Switches to weight mode → shows calculated grams
- Edits grams directly → percentage updates
- Switches back to % mode → shows updated percentage

## UI Components to Modify

### Input Field Enhancement
```
Current: [0] [↕] % [Use] [×]
Proposed: [0] [↕] [%▾|g] [Use] [×]
           └─value  └─unit selector
```

### New Top-Level Component
```
Total Batch Weight: [500] g
```

### Updated Validation Message
```
Current: "Oil percentages must total 100%. Currently at 0%. Add 100% more."
Weight mode: "Total oil weight: 0g. Target batch weight: 500g. Add 500g more."
```

## Technical Considerations

### State Management
- Add `inputMode` property per oil: `'percentage' | 'weight'`
- Add `totalBatchWeight` to form state
- Add `calculatedGrams` and `calculatedPercentage` per oil
- Decide: stored value vs. computed value strategy

### Data Model
```typescript
interface Oil {
  name: string;
  inputMode: 'percentage' | 'weight';
  inputValue: number;  // What user actually entered
  percentage: number;  // Always calculated
  grams: number;       // Always calculated
  // ... other properties
}

interface FormState {
  totalBatchWeight: number;
  oils: Oil[];
}
```

### Calculation Timing
- Real-time recalculation on any change
- Debounce if performance issues arise
- Round to appropriate decimal places (suggest: 1 decimal for %, 0 for grams)

## UX Principles to Maintain

1. **Clarity:** Always show what mode each input is in
2. **Feedback:** Immediate validation and total updates
3. **Forgiveness:** Allow incomplete states during editing
4. **Consistency:** % mode behavior unchanged for existing users
5. **Discoverability:** Weight mode obvious but not obtrusive

## Suggested Implementation Order

1. Add total batch weight input field
2. Add mode selector to first oil (test with one)
3. Implement conversion logic for single oil
4. Extend to all oils
5. Update validation logic
6. Add "Use All Suggestions" behavior for weight mode
7. Test edge cases (zero values, mode switching mid-edit, very small/large numbers)

## Open Questions for Agent to Resolve

1. "Distribute Remaining Equally" should work, distribute remainder weight to equate to 100%. 
2. "Use All Suggestions" should apply 100% of the total required weight (typically 500g) across all weights providing the best option mathemathicly for the best soal in category (hard or liquid) and convert this to weights to fill the oil weights to 100%.
3. Superfat is excluded in weight calculations.
4.There sholuld be master toggle for individual oils.
5. Minimum/maximum sensible values for batch weight.