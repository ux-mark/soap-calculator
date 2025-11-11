# Testing Guide - See Suggested Percentages in Selected Oils Panel

## Quick Test (Step-by-Step)

### Step 1: Open the App
Go to: **http://localhost:3000**

### Step 2: Add Your First Oil
1. Scroll down to the "Select Oils" section
2. **Click on "Coconut Oil, 76 deg"** tile
3. The oil appears in the **"Selected Oils"** panel (top left)

### Step 3: Set a Percentage
1. Look at the "Selected Oils" panel (top left)
2. Find the input box next to Coconut Oil
3. **Type "25"** in the percentage box
4. Press Enter or click away

### Step 4: Check Browser Console
1. Press **F12** (or Cmd+Option+I on Mac)
2. Click the **"Console"** tab
3. Look for:
   ```
   Recommendations in SelectedOilsList: X
   Recommended percentages map: Array [...]
   ```

### What You Should See

#### If Recommendations Are Working:
```
Console Output:
Recommendations in SelectedOilsList: 5
Recommended percentages map: Array [
  ["olive-oil", 25],
  ["sweet-almond-oil", 20],
  ...
]
```

#### In the Selected Oils Panel:
```
┌─────────────────────────────────┐
│ Selected Oils        Total: 25% │
├─────────────────────────────────┤
│ Coconut Oil, 76 deg             │
│ Hard Oil                        │
│ [25] %               [×]        │
└─────────────────────────────────┘
```

**NOTE:** You won't see the badge yet because Coconut Oil itself doesn't have a recommendation (it's already selected).

### Step 5: Add a SECOND Oil Via Recommendation
1. Scroll down to "Recommended for your recipe" section
2. **Click "Add 25%"** on "Olive Oil"
3. Olive Oil appears in Selected Oils panel

### Step 6: NOW Check for the Badge!
Look in the Selected Oils panel. You should now see:
```
┌──────────────────────────────────────┐
│ Selected Oils           Total: 50%   │
├──────────────────────────────────────┤
│ Coconut Oil, 76 deg                  │
│ [25] %                     [×]       │
│                                      │
│ Olive Oil  [💡 25%]                  │
│ [25] %                     [×]       │
│                                      │
│ [Distribute Equally]                 │
└──────────────────────────────────────┘
```

The **[💡 25%]** badge should appear next to Olive Oil!

## Troubleshooting

### "I don't see any recommendations"
**Check:**
1. Did you set a percentage for the first oil? (Must be > 0)
2. Is total percentage < 100%?
3. Check console for "Recommendations in SelectedOilsList: 0"

**Fix:**
- Set Coconut Oil to 25%
- Wait 1 second for calculations
- Refresh the page

### "I see recommendations but no badges in Selected Oils"
**Likely Issue:** The selected oil doesn't have a recommendation for itself

**Test:**
1. Add oil using "Add X%" button from recommendations
2. That oil WILL have a badge because it was recommended

**Example:**
```
Step 1: Click Coconut Oil tile → No badge (not recommended)
Step 2: Set to 25%
Step 3: Click "Add 25%" on Olive Oil → Badge appears! 💡
```

### "Recommendations show 0 in console"
**Check:**
1. Total percentage must be > 0
2. At least one oil must have percentage > 0
3. Total must be < 100%

**Try:**
```
1. Remove all oils
2. Click Coconut Oil
3. Set to 30%
4. Check console again
```

## Expected Behavior

### Selected Oil (Was Recommended):
- ✅ Shows green badge with suggested %
- ✅ "Use" button if current % ≠ suggested %
- ✅ Included in "Use All Suggestions"

### Selected Oil (Not Recommended):
- ❌ No badge (wasn't in recommendations)
- ❌ No "Use" button
- ❌ Not affected by "Use All Suggestions"

## Full Working Example

### Scenario: Building a Recipe

**Action 1:** Click "Coconut Oil, 76 deg"
- Added at 0%
- No badge (not recommended for itself)

**Action 2:** Set Coconut to 25%
- Recommendations calculate
- Console shows: "Recommendations: 5"

**Action 3:** Check recommendations section
- "Olive Oil" shows "Add 25%"
- "Sweet Almond Oil" shows "Add 20%"
- etc.

**Action 4:** Click "Add 25%" on Olive Oil
- Olive Oil added at 25%
- **Badge appears:** Olive Oil [💡 25%]
- Total: 50%

**Action 5:** Click "Add 20%" on Sweet Almond Oil
- Sweet Almond added at 20%
- **Badge appears:** Sweet Almond [💡 20%]
- Total: 70%

**Action 6:** Click "Castor Oil" tile (without using Add button)
- Castor Oil added at 0%
- **Badge appears:** Castor Oil [💡 8%]
- **"Use" button appears**
- Total: 70%

**Action 7:** Click "Use" button next to Castor Oil
- Percentage changes to 8%
- "Use" button disappears
- Total: 78%

**Result:**
```
┌─────────────────────────────────────────────┐
│ Selected Oils                    Total: 78% │
├─────────────────────────────────────────────┤
│ Coconut Oil, 76 deg                         │
│ [25] %                            [×]       │
│                                             │
│ Olive Oil  [💡 25%]                         │
│ [25] %                            [×]       │
│                                             │
│ Sweet Almond Oil  [💡 20%]                  │
│ [20] %                            [×]       │
│                                             │
│ Castor Oil  [💡 8%]                         │
│ [8] %                             [×]       │
│                                             │
│ [Distribute Equally] [💡 Use All Suggestions]│
└─────────────────────────────────────────────┘
```

## Key Points

1. **Badges only show for oils that were recommended**
2. **First oil you manually add won't have a badge**
3. **Oils added via "Add X%" will have badges**
4. **Recommendations update as you change percentages**

## Next Steps

If you see the console logs but no badges:
1. Share the console output
2. Take a screenshot of the Selected Oils panel
3. List which oils you added and how

If you don't see console logs:
1. Make sure browser console is open (F12)
2. Refresh the page
3. Try the steps again
