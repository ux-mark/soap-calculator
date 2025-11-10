# Intelligent Recommendation System - User Guide

## How It Works

### Phase 1: Starting Your Recipe (0-50%)

When you begin selecting oils, the recommendation system analyzes your choices and helps guide you toward a balanced recipe.

#### What You'll See:
1. **Recommended Oils Section** at the top
   - Green badge: "Highly Recommended" (score ≥ 70)
   - Blue badge: "Good Match" (score 50-69)

2. **Oil Tiles with Information**
   - **Recommendation reason**: "Improves conditioning" or "Provides hardness"
   - **Predicted impact**: "This will bring hardness to 45"
   - **Quick-add button**: "Add 15%" - click to instantly add at optimal percentage

3. **Disabled Oils** (grayed out with lock icon)
   - Tooltip explains: "Cannot achieve ideal ranges with this oil"
   - These oils would push your recipe further from ideal ranges

#### Example Workflow:
```
Step 1: Add Coconut Oil at 25%
→ System recommends:
  ✓ Olive Oil (Highly Recommended) - "Improves conditioning"
  ✓ Sweet Almond Oil (Good Match) - "Provides oleic acid"
  ✗ Palm Kernel Oil (Disabled) - "Too similar to coconut"

Step 2: Click "Add 20%" on Olive Oil
→ Now at 45%, system updates recommendations based on new balance
```

### Phase 2: Optimizing Your Recipe (50-100%)

Once you pass 50%, the system shifts focus to help you reach 100% while maintaining ideal ranges.

#### Changes at 50%:
- **All oils become available** (no more disabled oils)
- **Recommendations focus on filling gaps** in your recipe
- **Suggested percentages adjust** to fit remaining space

#### What You'll See:
1. **Adaptive Suggestions**
   - If you need 25% more: "Add 20%" or "Add 15%"
   - If you need 5% more: "Add 5%"

2. **Refined Recommendations**
   - Oils that complement your current selection
   - Priority given to achieving ideal quality ranges
   - Diversity in fatty acid profile

#### Example Workflow:
```
At 50% with Coconut (25%) + Olive (25%):
→ System recommends:
  ✓ Shea Butter (Highly Recommended) - "Add 20% to improve creamy lather"
  ✓ Castor Oil (Good Match) - "Add 8% to boost bubbly lather"
  ✓ Sweet Almond Oil - "Add 15% to balance conditioning"

At 85% with multiple oils:
→ System recommends:
  ✓ Palm Oil - "Add 15% to reach 100% and optimize hardness"
```

## Visual Indicators Guide

### Oil Tile States

#### 1. Highly Recommended (Green)
```
┌─────────────────────────────┐
│ [Highly Recommended]        │ ← Green badge
│                             │
│ **Olive Oil**               │
│ Soft Oil                    │
│                             │
│ Improves conditioning       │ ← Reason
│                             │
│ [📈] This will bring        │ ← Predicted impact
│ conditioning to 76%         │
│                             │
│ [Add 20%]                   │ ← Quick-add button
└─────────────────────────────┘
   ↑ Green border
```

#### 2. Good Match (Blue)
```
┌─────────────────────────────┐
│ [Good Match]                │ ← Blue badge
│                             │
│ **Sweet Almond Oil**        │
│ Soft Oil                    │
│                             │
│ Provides oleic acid         │
│                             │
│ [Add 15%]                   │
└─────────────────────────────┘
   ↑ Blue border
```

#### 3. Available (Default)
```
┌─────────────────────────────┐
│ **Avocado Oil**             │
│ Soft Oil                    │
│                             │
│ SAP: 0.133  INS: 99        │
└─────────────────────────────┘
   ↑ Default border
```

#### 4. Disabled (Red/Gray)
```
┌─────────────────────────────┐
│                        [🔒] │ ← Lock icon
│ **Palm Kernel Oil**         │
│ Hard Oil                    │
│                             │
│ Cannot achieve ideal ranges │ ← Disabled reason
│ with this oil               │
└─────────────────────────────┘
   ↑ Grayed out appearance
```

#### 5. Selected (Primary)
```
┌─────────────────────────────┐
│                        [✓]  │ ← Checkmark
│ **Coconut Oil**             │
│ Hard Oil                    │
│                             │
│ 25% of recipe               │
└─────────────────────────────┘
   ↑ Primary color border
```

## Understanding Recommendations

### Why Is An Oil Recommended?

The system considers multiple factors:

#### 1. Quality Gaps
- Your current recipe is low in hardness → Recommends hard oils
- Your current recipe is low in conditioning → Recommends soft oils
- Your current recipe is low in cleansing → Recommends coconut or babassu

#### 2. Fatty Acid Diversity
- Missing lauric acid → Recommends coconut oil
- Missing oleic acid → Recommends olive or sweet almond
- Missing ricinoleic acid → Recommends castor oil

#### 3. Compatibility
- Won't recommend oils too similar to what you have
- Prioritizes oils that complement your selection
- Avoids oils that would push qualities out of range

### Why Is An Oil Disabled?

An oil gets disabled (< 50% threshold) when:

1. **Too Similar**: Almost identical to an oil you've already selected
   - Example: Palm Kernel Oil when you have Coconut Oil

2. **Wrong Direction**: Would push qualities further from ideal
   - Example: More coconut when you already have high cleansing

3. **Cannot Help**: Mathematically cannot improve any out-of-range quality
   - Example: A luxury butter when you need more cleansing power

## Tips for Best Results

### 1. Start with Base Oils
- Begin with 25-30% of a hard oil (coconut, palm, babassu)
- Add 25-30% of a soft oil (olive, sweet almond, sunflower)
- Let the system recommend complementary oils

### 2. Use Quick-Add Buttons
- The suggested percentages are calculated for optimal results
- You can always adjust manually after adding

### 3. Watch the Predicted Impact
- Green text shows expected improvements
- Helps you understand what each oil contributes

### 4. Pay Attention to Total Percentage
- Keep track of how much room you have left
- Recommendations adjust as you approach 100%

### 5. Don't Fear Disabled Oils
- They become available after 50%
- Disabling helps prevent early mistakes
- Focus on recommended oils first

## Example Recipe Creation

### Goal: Balanced Bar Soap

**Step 1**: Add Coconut Oil at 25%
```
Current: 25%
Recommendations:
  ✓ Olive Oil - "Add 25%" - Highly Recommended
  ✓ Sweet Almond Oil - "Add 20%" - Good Match
  ✗ Palm Kernel Oil - Disabled (too similar)
```

**Step 2**: Click "Add 25%" on Olive Oil
```
Current: 50%
Recommendations:
  ✓ Shea Butter - "Add 20%" - Highly Recommended
  ✓ Castor Oil - "Add 8%" - Good Match
  All oils now available (50% threshold passed)
```

**Step 3**: Add Shea Butter at 20%
```
Current: 70%
Recommendations:
  ✓ Castor Oil - "Add 8%" - Highly Recommended
  ✓ Avocado Oil - "Add 15%" - Good Match
```

**Step 4**: Add Castor Oil at 8%
```
Current: 78%
Recommendations:
  ✓ Sweet Almond Oil - "Add 22%" - Highly Recommended
  ✓ Palm Oil - "Add 22%" - Good Match
```

**Step 5**: Click "Add 22%" on Sweet Almond Oil
```
Current: 100% ✓
Recipe Complete!

Final Recipe:
- Coconut Oil: 25%
- Olive Oil: 25%
- Shea Butter: 20%
- Sweet Almond Oil: 22%
- Castor Oil: 8%

All qualities in ideal range ✓
```

## Troubleshooting

### "I don't see any recommendations"
- Make sure you have at least one oil selected
- Check that your total percentage is less than 100%

### "All my oils are disabled"
- This is rare but can happen with unusual combinations
- Try removing one oil and adding a different base oil
- The system will recalculate recommendations

### "The suggested percentage doesn't fit"
- If you've manually adjusted percentages, there may not be enough room
- Remove some percentage from other oils
- Or ignore the quick-add and add manually with a smaller amount

### "I want to use a disabled oil anyway"
- Wait until you reach 50% total percentage
- All oils become available after the 50% threshold
- You can then add it manually

## Advanced Features

### Compatibility Score Breakdown
- **70-100**: Highly Recommended - These oils are perfect for your recipe
- **50-69**: Good Match - These oils work well and won't hurt
- **30-49**: Available - Neutral, won't help much but won't hurt
- **0-29**: Disabled (< 50%) - Would push recipe away from ideal

### Predicted Impact Details
The system simulates:
1. Adding the oil at suggested percentage
2. Recalculating all soap qualities
3. Comparing to ideal ranges
4. Showing which qualities improve most

This helps you make informed decisions about which oils to add!

## Support

For questions or issues with the recommendation system, please refer to:
- README-Soapcalc.md - Full project specification
- RECOMMENDATION_SYSTEM_IMPLEMENTATION.md - Technical details
- GitHub Issues - Report bugs or suggest improvements

Happy soap making! 🧼✨
