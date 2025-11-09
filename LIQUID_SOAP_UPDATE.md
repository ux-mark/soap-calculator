# Liquid Soap Support Update

## Overview
The Soap Calculator now fully supports both **hard (bar) soap** and **liquid soap** formulations with distinct quality ranges and intelligent recommendations.

## Key Changes

### 1. Quality Ranges (`lib/calculations.ts`)
Added separate quality target ranges for each soap type:

#### Hard Soap Quality Ranges
- **Hardness**: 29-54 (needs to be firm)
- **Cleansing**: 12-22
- **Conditioning**: 44-69
- **Bubbly Lather**: 14-46
- **Stable Lather**: 29-54
- **Iodine**: 41-70
- **INS**: 136-165

#### Liquid Soap Quality Ranges
- **Hardness**: 5-15 (needs to be soft/liquid)
- **Cleansing**: 12-22
- **Conditioning**: 65-80 (higher than hard soap)
- **Bubbly Lather**: 14-46
- **Stable Lather**: 5-15 (much lower)
- **Iodine**: 41-70
- **INS**: 70-90 (significantly lower)

**Function**: `getQualityRanges(soapType: "hard" | "liquid")`
- Dynamically returns appropriate quality ranges based on soap type

### 2. User Interface Updates

#### Soap Type Selector (`components/calculator/InputSection.tsx`)
- Added toggle between "Hard Soap (Bar Soap)" and "Liquid Soap"
- **Auto-adjusts lye type**:
  - Hard Soap → NaOH (Sodium Hydroxide)
  - Liquid Soap → KOH (Potassium Hydroxide)
- Shows contextual help text explaining the difference

#### Quality Display (`components/calculator/QualityDisplay.tsx`)
- Badge shows current soap type
- Context-aware descriptions for each quality metric:
  - Example: Hardness shows "Contributes to bar firmness" for hard soap vs "Lower is better for liquid soap" for liquid soap
- Progress bars use appropriate quality ranges for each soap type

### 3. Recommendation Engine (`lib/recommendations.ts`)

#### Updated Functions
All recommendation functions now accept `soapType` parameter:

1. **`calculateCompatibilityScore()`**
   - Uses dynamic quality ranges via `getQualityRanges(soapType)`
   - Adjusts scoring based on soap type

2. **`identifyRecipeNeeds()`**
   - Identifies deficiencies using correct quality ranges
   - Properly recognizes when hardness is too high (liquid soap) or too low (hard soap)

3. **`oilFulfillsNeed()`**
   - **Critical liquid soap logic**: Does NOT recommend hardening oils (palm, tallow, cocoa butter) for liquid soap
   - Only suggests hardness-boosting oils for hard soap formulations

4. **`getRecommendedOils()`**
   - Returns top 5 compatible oils for current soap type
   - Liquid soap formulations avoid hard fats

5. **`isOilCompatible()` & `getIncompatibleOils()`**
   - Evaluate oil compatibility based on soap type
   - Liquid soap mode marks hardening oils as incompatible

### 4. Context Integration (`contexts/CalculatorContext.tsx`)
- Passes `inputs.soapType` to all recommendation functions
- Recalculates recommendations when soap type changes
- Default soap type is "hard"

## Usage

### Creating Hard Soap (Bar Soap)
1. Select "Hard Soap (Bar Soap)" from soap type dropdown
2. Lye automatically switches to NaOH
3. Add oils - system will recommend hardening oils like:
   - Palm Oil
   - Coconut Oil
   - Cocoa Butter
4. Target hardness: 29-54
5. Target INS: 136-165

### Creating Liquid Soap
1. Select "Liquid Soap" from soap type dropdown
2. Lye automatically switches to KOH
3. Add oils - system will avoid hardening oils and recommend:
   - Olive Oil
   - Sunflower Oil
   - Castor Oil
   - Almond Oil
4. Target hardness: 5-15 (LOW)
5. Target INS: 70-90
6. Higher conditioning: 65-80

## Technical Details

### Type Definitions (`lib/types.ts`)
```typescript
export interface RecipeInputs {
  totalOilWeight: number;
  unit: "g" | "oz";
  soapType: "hard" | "liquid"; // NEW
  lyeType: "NaOH" | "KOH";
  superfatPercentage: number;
  waterMethod: "water_as_percent_of_oils" | "lye_concentration" | "water_to_lye_ratio";
  waterValue: number;
  fragranceWeight: number;
}
```

### Calculation Flow
1. User selects soap type
2. Lye type auto-adjusts
3. User adds oils
4. Quality calculations use `getQualityRanges(inputs.soapType)`
5. Recommendation engine evaluates oils using soap-type-specific logic
6. UI displays results with context-aware descriptions

## Validation
- Quality ranges are scientifically accurate for each soap type
- Hardness is inverted between types (high for hard soap, low for liquid soap)
- Conditioning is higher for liquid soap (more gentle)
- INS values appropriate for each formulation style

## Future Enhancements
Potential additions:
- Educational tooltips explaining why certain oils work better for each type
- Sample recipes for each soap type
- Warnings when formulation is far from ideal ranges
- Export recipes with soap type notation
- Conversion calculator between hard/liquid formulations

## Files Modified
1. `lib/types.ts` - Added soapType to RecipeInputs
2. `lib/calculations.ts` - Added dual quality ranges + getQualityRanges()
3. `lib/recommendations.ts` - Updated all functions to accept soapType
4. `contexts/CalculatorContext.tsx` - Pass soapType to recommendations
5. `components/calculator/InputSection.tsx` - Added soap type selector
6. `components/calculator/QualityDisplay.tsx` - Context-aware UI

## Testing
To test liquid soap support:
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000
3. Toggle between Hard Soap and Liquid Soap
4. Add oils and observe:
   - Quality ranges change dynamically
   - Recommendations differ by soap type
   - Descriptions update contextually
   - Lye type switches automatically
