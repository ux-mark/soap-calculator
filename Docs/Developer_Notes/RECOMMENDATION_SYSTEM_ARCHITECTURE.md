# Recommendation System Architecture

**Version:** 2.0  
**Last Updated:** November 10, 2025

## Overview

The recommendation system provides intelligent, chemistry-based oil suggestions with color-coded visual feedback and detailed explanations.

## Architecture Diagram

```
┌─────────────────────┐
│  CalculatorContext  │
│  (State Manager)    │
└──────────┬──────────┘
           │
           ├─ selectedOils[]
           ├─ currentQualities
           ├─ currentFattyAcids
           │
           v
┌─────────────────────────────┐
│  getRecommendedOils()       │
│  (Recommendation Engine)    │
└──────────┬──────────────────┘
           │
           ├─► calculateCompatibilityScore()
           │   └─► Base scoring (0-100)
           │
           ├─► generateRecommendationDetail()
           │   ├─► getFattyAcidContributions()
           │   ├─► calculateQualityProjections()
           │   ├─► identifyIncompatibilityProblems()
           │   ├─► findBetterAlternatives()
           │   ├─► generateComparativeAnalysis()
           │   └─► generateDisplayCopy()
           │
           v
┌─────────────────────────────┐
│  OilRecommendation[]        │
│  with RecommendationDetail  │
└──────────┬──────────────────┘
           │
           v
┌─────────────────────────────┐
│  OilSelector Component      │
│  (Renders Recommendations)  │
└──────────┬──────────────────┘
           │
           v
┌─────────────────────────────┐
│  OilTile Component          │
│  (Color-Coded Display)      │
└─────────────────────────────┘
```

## Core Data Structures

### RecommendationDetail

The main structure containing all recommendation data:

```typescript
interface RecommendationDetail {
  // Scoring
  score: number;                    // 0-100
  scoreCategory: string;            // highly_recommended, good_match, etc.
  cardColor: string;                // green, blue, yellow, orange, red
  
  // Chemistry
  fattyAcidContributions: FattyAcidContribution[];
  
  // Projections
  qualityProjections: QualityProjection[];
  
  // Analysis
  comparativeAnalysis: ComparativeAnalysis;
  problems?: IncompatibilityProblem[];
  betterAlternatives?: BetterAlternative[];
  
  // Display
  displayCopy: string;
  suggestedPercentage: number;
  usageTip?: string;
}
```

### Score Categories

| Score | Category | Color | Use Case |
|-------|----------|-------|----------|
| 70+ | highly_recommended | green | Fills critical needs, improves qualities |
| 50-69 | good_match | blue | Compatible, some benefits |
| 30-49 | neutral | yellow | Use with caution, limited benefits |
| 25-29 | caution | orange | Marginal compatibility |
| <25 | incompatible | red | Creates problems, better alternatives exist |

## Key Functions

### 1. getFattyAcidContributions()

**Purpose:** Identifies which fatty acids in an oil are helpful and why

**Logic:**
- Checks recipe needs (from `identifyRecipeNeeds()`)
- Matches fatty acids to needs:
  - Palmitic/Stearic → Hardness (bar soap)
  - Oleic → Conditioning or liquid soap fluidity
  - Lauric/Myristic → Cleansing
  - Linoleic → Conditioning
  - Ricinoleic → Bubbles & creaminess
- Returns array of contributions with percentages and explanations

**Example Output:**
```javascript
[{
  acid: "Palmitic + Stearic",
  percentage: 49,
  whyHelpful: "Saturated fats crystallize to form solid bar structure"
}]
```

### 2. calculateQualityProjections()

**Purpose:** Shows numeric impact of adding an oil

**Logic:**
1. Simulates adding oil at suggested percentage
2. Normalizes all percentages to 100%
3. Calculates projected fatty acids & qualities
4. Compares current vs. projected for each quality
5. Determines if movement is toward ideal range

**Example Output:**
```javascript
[{
  quality: "hardness",
  current: 18,
  projected: 42,
  range: { min: 29, max: 54 },
  movesTowardIdeal: true
}]
```

### 3. identifyIncompatibilityProblems()

**Purpose:** Detects specific issues with an oil

**Checks:**
- **Wrong soap type:** Hard oils in liquid soap (saturated fats >30%)
- **Too soft for bars:** Projected hardness below minimum
- **Out of range:** Any quality pushed beyond acceptable range
- **DOS risk:** Linolenic acid >10%
- **Too similar:** >70% fatty acid profile overlap with selected oil

**Example Output:**
```javascript
[{
  type: "wrong_soap_type",
  details: "49% palmitic + stearic will solidify in KOH liquid soap",
  numericIssue: "Saturated fats crystallize in potassium hydroxide solutions",
  visualResult: "Creates waxy chunks or thick paste requiring heat to remain fluid"
}]
```

### 4. findBetterAlternatives()

**Purpose:** Suggests concrete alternatives for incompatible oils

**Logic:**
- Analyzes each problem
- Searches database for oils that solve the problem:
  - Wrong soap type (liquid) → High oleic, low saturated oils
  - Wrong soap type (hard) → High palmitic/stearic oils
  - Too similar → Different fatty acid profile oils
- Returns up to 3 alternatives with specific advantages

**Example Output:**
```javascript
[{
  oilId: "olive-oil",
  whyBetter: "69% oleic acid stays liquid in KOH soap",
  specificAdvantage: "No crystallization or thickening issues"
}]
```

### 5. generateDisplayCopy()

**Purpose:** Creates factual, chemistry-based copy

**Templates by Score:**

**70+ (Highly Recommended):**
```
{main_benefit} • {fatty_acid_detail} • {practical_benefit}
```

**50-69 (Good Match):**
```
{what_it_adds} • {caveat} • {usage_tip}
```

**30-49 (Neutral):**
```
{provides} • {but_warning} • {use_sparingly}
```

**<30 (Incompatible):**
```
⚠️ {problem} • {visual_result} • {try_instead}
```

## Display Logic (OilTile Component)

### Color Coding

```typescript
const getCardClassName = () => {
  switch (cardColor) {
    case "green":  return "ring-2 ring-green-500 border-green-500 bg-green-50/50";
    case "blue":   return "ring-2 ring-blue-500 border-blue-500 bg-blue-50/50";
    case "yellow": return "ring-2 ring-yellow-500 border-yellow-500 bg-yellow-50/50";
    case "orange": return "ring-2 ring-orange-500 border-orange-500 bg-orange-50/50";
    case "red":    return "ring-2 ring-red-500 border-red-500 bg-red-50/50";
  }
};
```

### Content Sections

1. **Badge** - Score category with icon
2. **Oil Name & Category**
3. **SAP & INS Values**
4. **Top Fatty Acids**
5. **Display Copy** (main message, color-coded background)
6. **Quality Projections** (current → projected with ✓)
7. **Fatty Acid Contributions** (key acids with %)
8. **Usage Tip** (blue info box)
9. **Action Button** ("Add X%", color-coded)
10. **Problems** (red warning box) - if incompatible
11. **Better Alternatives** (blue suggestion box) - if incompatible

## Usage Examples

### Hard Soap - Need Hardness

**Palm Oil (Score: 85 - Green)**

```typescript
{
  score: 85,
  scoreCategory: "highly_recommended",
  cardColor: "green",
  fattyAcidContributions: [{
    acid: "Palmitic + Stearic",
    percentage: 49,
    whyHelpful: "Saturated fats crystallize to form solid bar structure"
  }],
  qualityProjections: [{
    quality: "hardness",
    current: 18,
    projected: 42,
    range: { min: 29, max: 54 },
    movesTowardIdeal: true
  }],
  displayCopy: "Brings hardness to 42 (ideal range) • 49% palmitic + stearic • ...",
  suggestedPercentage: 25,
  usageTip: "Use as base oil at 25-40% for bar structure"
}
```

### Liquid Soap - Already Have Oleic

**Palm Oil (Score: 15 - Red)**

```typescript
{
  score: 15,
  scoreCategory: "incompatible",
  cardColor: "red",
  problems: [{
    type: "wrong_soap_type",
    details: "49% palmitic + stearic will solidify in KOH liquid soap",
    numericIssue: "Saturated fats crystallize in potassium hydroxide solutions",
    visualResult: "Creates waxy chunks or thick paste..."
  }],
  betterAlternatives: [{
    oilId: "olive-oil",
    whyBetter: "69% oleic acid stays liquid in KOH soap",
    specificAdvantage: "No crystallization or thickening issues"
  }],
  displayCopy: "⚠️ 49% palmitic + stearic will solidify in KOH liquid soap • ...",
  suggestedPercentage: 0
}
```

## Performance Considerations

### Optimization Strategies

1. **Memoization**
   - Recommendations calculated once per context change
   - Cached in Calculator Context
   - Re-use across multiple renders

2. **Lazy Evaluation**
   - Detail generation only for visible recommendations
   - Skip detail for disabled/hidden oils

3. **Efficient Searches**
   - Use Sets for selected oil lookups
   - Filter database once, reuse results

4. **Minimal Re-renders**
   - Pure components where possible
   - React.memo for OilTile
   - useMemo for filtered lists

### Bottlenecks to Watch

- ❌ Generating details for ALL oils in database (20+)
- ❌ Re-calculating on every keystroke in search
- ❌ Deep object comparisons in render

- ✅ Generate details only for top 5 recommendations
- ✅ Debounce search input
- ✅ Shallow comparisons with IDs

## Testing Strategy

### Unit Tests (Recommended)

```typescript
describe('generateRecommendationDetail', () => {
  it('assigns green color for scores >= 70', () => {
    // Test color assignment
  });
  
  it('identifies hardness needs for bar soap', () => {
    // Test fatty acid contribution logic
  });
  
  it('detects saturated fats in liquid soap as problem', () => {
    // Test incompatibility detection
  });
  
  it('suggests high-oleic alternatives for liquid soap', () => {
    // Test alternative suggestions
  });
});
```

### Integration Tests

```typescript
describe('Full Recommendation Flow', () => {
  it('recommends palm oil for low-hardness bar soap', () => {
    const context = { /* low hardness state */ };
    const recs = getRecommendedOils(context, "hard");
    expect(recs.find(r => r.oil.id === "palm-oil")).toBeDefined();
    expect(recs[0].detail.scoreCategory).toBe("highly_recommended");
  });
});
```

### Visual Regression Tests

- Screenshot tests for each color category
- Verify badge placement
- Check copy wrapping/truncation
- Mobile responsive layouts

## Troubleshooting

### Common Issues

**Issue:** All recommendations show low scores

**Cause:** Recipe already well-balanced or context missing

**Fix:** Verify context includes currentQualities and currentFattyAcids

---

**Issue:** Display copy is empty or generic

**Cause:** No fatty acid contributions or projections found

**Fix:** Check `identifyRecipeNeeds()` is finding needs correctly

---

**Issue:** Better alternatives not showing

**Cause:** No incompatibility problems detected

**Fix:** Alternatives only show when score < 30 and problems exist

---

**Issue:** Colors not displaying

**Cause:** Tailwind classes not in safelist or cardColor undefined

**Fix:** Add dynamic color classes to tailwind.config.ts safelist

## Future Enhancements

### Planned Features

1. **Machine Learning Integration**
   - Learn from successful recipes
   - Personalized recommendations

2. **Cost Optimization**
   - Factor in oil prices
   - Suggest cost-effective alternatives

3. **Sustainability Scoring**
   - Highlight ethical/sustainable oils
   - Environmental impact data

4. **Allergen Warnings**
   - Flag nut oils
   - Cross-contamination risks

5. **Regional Availability**
   - Adjust for local markets
   - Import/export considerations

6. **Advanced Comparison**
   - Side-by-side oil comparison
   - Interactive radar charts

## References

- [Fatty Acid Properties](../Database_Plans/DATABASE_SUMMARY.md)
- [Quality Ranges](../../lib/calculations.ts#L10-L27)
- [Original Requirements](../Work_to_Do/RECOMMENDATION_DETAILS.md)
- [Implementation Summary](../Work_to_Do/Work_Complete/RECOMMENDATION_ENGINE_ENHANCEMENT.md)

## API Reference

### getRecommendedOils()

```typescript
function getRecommendedOils(
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  maxRecommendations: number = 5
): OilRecommendation[]
```

**Parameters:**
- `context` - Current recipe state
- `soapType` - Type of soap being made
- `maxRecommendations` - Max number to return

**Returns:** Array of recommendations sorted by score (highest first)

### generateRecommendationDetail()

```typescript
function generateRecommendationDetail(
  oil: OilData,
  context: RecommendationContext,
  score: number,
  suggestedPercentage: number,
  soapType: "hard" | "liquid" = "hard"
): RecommendationDetail
```

**Parameters:**
- `oil` - Oil to analyze
- `context` - Current recipe state
- `score` - Compatibility score
- `suggestedPercentage` - Recommended usage percentage
- `soapType` - Type of soap

**Returns:** Complete recommendation detail with all analysis

---

**Maintained by:** Development Team  
**Questions?** See [Developer Notes](./RECOMMENDATION_SYSTEM_IMPLEMENTATION.md)
