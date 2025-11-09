# Testing Liquid Soap Functionality

## Manual Test Checklist

### 1. Soap Type Toggle
- [ ] Navigate to http://localhost:3000
- [ ] Locate the "Soap Type" dropdown in Recipe Inputs
- [ ] Default should be "Hard Soap (Bar Soap)"
- [ ] Change to "Liquid Soap"
- [ ] Verify lye type automatically changes from NaOH to KOH

### 2. Quality Range Switching
**Test with Hard Soap:**
- [ ] Select "Hard Soap (Bar Soap)"
- [ ] Add Coconut Oil (60%)
- [ ] Add Olive Oil (40%)
- [ ] Check quality display shows:
  - Hardness target: 29-54 (should be in range)
  - INS target: 136-165
  - Badge shows "Hard Soap"

**Test with Liquid Soap:**
- [ ] Switch to "Liquid Soap"
- [ ] Same oils (Coconut 60%, Olive 40%)
- [ ] Check quality display shows:
  - Hardness target: 5-15 (coconut will be out of range - too hard)
  - INS target: 70-90
  - Badge shows "Liquid Soap"
  - Description says "Lower is better for liquid soap"

### 3. Recommendation Engine
**For Hard Soap:**
- [ ] Select "Hard Soap"
- [ ] Add only Olive Oil (30%)
- [ ] Check recommendations - should suggest:
  - Palm Oil (adds hardness)
  - Coconut Oil (adds hardness + cleansing)
  - Cocoa Butter (adds hardness)
  - Shea Butter (adds hardness)

**For Liquid Soap:**
- [ ] Switch to "Liquid Soap"
- [ ] Keep only Olive Oil (30%)
- [ ] Check recommendations - should NOT suggest:
  - Palm Oil
  - Cocoa Butter
  - Tallow
- [ ] Should suggest soft oils like:
  - Sunflower Oil
  - Almond Oil
  - Castor Oil
  - Avocado Oil

### 4. Quality Descriptions
- [ ] With "Hard Soap" selected, hover/read hardness description
  - Should say something about "bar firmness"
- [ ] With "Liquid Soap" selected, hover/read hardness description
  - Should say "Lower is better for liquid soap"

### 5. Lye Auto-Adjustment
- [ ] Select "Hard Soap" → Lye should be NaOH
- [ ] Switch to "Liquid Soap" → Lye should automatically change to KOH
- [ ] Switch back to "Hard Soap" → Lye should revert to NaOH

### 6. Complete Liquid Soap Recipe
Create a proper liquid soap recipe:
- [ ] Select "Liquid Soap"
- [ ] Add:
  - Coconut Oil: 25%
  - Olive Oil: 45%
  - Sunflower Oil: 20%
  - Castor Oil: 10%
- [ ] Verify:
  - Hardness is low (5-15 range)
  - Conditioning is high (65-80 range)
  - INS is 70-90
  - No warnings about incompatible oils

### 7. Complete Hard Soap Recipe
Create a proper hard soap recipe:
- [ ] Select "Hard Soap"
- [ ] Add:
  - Coconut Oil: 30%
  - Palm Oil: 30%
  - Olive Oil: 30%
  - Castor Oil: 10%
- [ ] Verify:
  - Hardness is good (29-54 range)
  - Conditioning is balanced (44-69 range)
  - INS is 136-165
  - All qualities in acceptable ranges

## Expected Behavior

### Key Differences Between Soap Types

| Aspect | Hard Soap | Liquid Soap |
|--------|-----------|-------------|
| Lye Type | NaOH (Sodium Hydroxide) | KOH (Potassium Hydroxide) |
| Hardness Target | 29-54 (HIGH) | 5-15 (LOW) |
| Conditioning Target | 44-69 | 65-80 (HIGHER) |
| INS Target | 136-165 | 70-90 (LOWER) |
| Recommended Oils | Palm, Coconut, Cocoa Butter | Olive, Sunflower, Almond |
| Avoid | Too soft oils (pure olive) | Hardening oils (palm, cocoa) |

## Automated Test Ideas (Future)

```typescript
// Example test cases
describe('Liquid Soap Support', () => {
  it('should auto-switch lye type when changing soap type', () => {
    // Test lye auto-adjustment
  });

  it('should use correct quality ranges for liquid soap', () => {
    const ranges = getQualityRanges('liquid');
    expect(ranges.hardness).toEqual({ min: 5, max: 15, optimal: 10 });
  });

  it('should not recommend palm oil for liquid soap', () => {
    const context = {
      currentOils: [{ id: 'olive', percentage: 30 }],
      // ... rest of context
    };
    const recommendations = getRecommendedOils(context, 'liquid', 5);
    const palmOil = recommendations.find(r => r.oil.id === 'palm');
    expect(palmOil).toBeUndefined();
  });

  it('should recommend palm oil for hard soap with low hardness', () => {
    const context = {
      currentOils: [{ id: 'olive', percentage: 100 }],
      // ... rest of context with low hardness
    };
    const recommendations = getRecommendedOils(context, 'hard', 5);
    const palmOil = recommendations.find(r => r.oil.id === 'palm');
    expect(palmOil).toBeDefined();
    expect(palmOil.score).toBeGreaterThan(50);
  });
});
```

## Known Issues
- None identified yet
- OilTile import warning in IDE (false positive - file exists)
- Tailwind CSS linter warnings (normal for @tailwind directives)

## Success Criteria
✅ Soap type toggle works smoothly
✅ Lye type auto-adjusts correctly
✅ Quality ranges switch dynamically
✅ Recommendations differ by soap type
✅ UI descriptions are context-aware
✅ No TypeScript compilation errors
✅ Application runs without crashes
