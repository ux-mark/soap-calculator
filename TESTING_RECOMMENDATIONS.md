# Testing the Intelligent Recommendation System

## Quick Test Steps

### Test 1: Basic Recommendations (Should work NOW)

1. **Open the app** at http://localhost:3000
2. **Click on any oil** (e.g., "Coconut Oil, 76 deg")
3. **Set a percentage** in the Selected Oils panel (e.g., 25%)
4. **Look for "Recommended for your recipe" section** - Should appear immediately!

### Test 2: Quick-Add Feature

1. After step 3 above, you should see recommended oils with:
   - Green badge: "Highly Recommended"
   - Blue badge: "Good Match"
   - Predicted impact text
   - **"Add X%" button**

2. **Click the "Add X%" button** on a recommended oil
3. The oil should be added instantly with the suggested percentage

### Test 3: 50% Threshold (Disabled Oils)

1. Add oils until you reach < 50% total
2. Some oils should show as **grayed out with a lock icon**
3. Hover over disabled oils to see tooltip: "Cannot achieve ideal range with this oil"

### Test 4: Full Recipe Flow

**Start Fresh:**
1. Click "Coconut Oil, 76 deg"
2. Set to 25% in Selected Oils panel
3. **Watch for recommendations** - should show immediately

**Expected Recommendations:**
- Olive Oil (Highly Recommended) - "Improves conditioning"
- Sweet Almond Oil (Good Match)
- Possibly others depending on calculation

**Continue:**
4. Click "Add 25%" on Olive Oil recommendation
5. Now at 50% total
6. New recommendations should update
7. Previously disabled oils should become available

**Complete:**
8. Continue adding oils via quick-add buttons
9. When you reach 100%, recommendations section should disappear

## What You Should See

### Recommended Oils Section
```
┌────────────────────────────────────────┐
│ ✨ Recommended for your recipe         │
│                                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Highly   │ │ Good     │ │ Good     ││
│ │Recommended│ │ Match    │ │ Match    ││
│ │          │ │          │ │          ││
│ │Olive Oil │ │Sweet     │ │Avocado   ││
│ │          │ │Almond    │ │Oil       ││
│ │          │ │          │ │          ││
│ │Improves  │ │Provides  │ │Balances  ││
│ │condition │ │oleic     │ │recipe    ││
│ │          │ │acid      │ │          ││
│ │📈 This   │ │📈 Will   │ │          ││
│ │will bring│ │increase  │ │          ││
│ │condition │ │condition │ │          ││
│ │to 76%    │ │          │ │          ││
│ │          │ │          │ │          ││
│ │[Add 25%] │ │[Add 20%] │ │[Add 15%] ││
│ └──────────┘ └──────────┘ └──────────┘│
└────────────────────────────────────────┘
```

### Disabled Oil Example (< 50%)
```
┌──────────────────┐
│ 🔒              │ ← Lock icon
│ Palm Kernel Oil  │
│ Hard Oil         │
│                  │
│ Cannot achieve   │ ← Disabled reason
│ ideal ranges with│
│ this oil         │
└──────────────────┘
   ↑ Grayed out
```

## Troubleshooting

### "I don't see recommendations"

**Check:**
1. ✅ Have you added at least one oil?
2. ✅ Have you set a percentage > 0 for that oil?
3. ✅ Is your total < 100%?

**If still not working:**
- Open browser console (F12)
- Look for errors
- Refresh the page

### "Quick-add buttons don't work"

**Check:**
- Are you clicking the "Add X%" button (not the tile itself)?
- Is the oil already selected?
- Check the Selected Oils panel to see if it was added

### "All oils are disabled"

This shouldn't happen, but if it does:
- Try removing one oil
- Add a different base oil (coconut, olive, palm)
- Recommendations should recalculate

## Expected Behavior Summary

| Condition | Recommendations | Disabled Oils | Quick-Add |
|-----------|----------------|---------------|-----------|
| 0% total | ❌ None | ❌ None | ❌ No |
| 1-49% total | ✅ Top 5 | ✅ Incompatible | ✅ Yes |
| 50-99% total | ✅ Top 5 | ❌ All available | ✅ Yes |
| 100% total | ❌ None | ✅ All disabled | ❌ No |

## Success Criteria

✅ **Recommendations appear** when oils are added  
✅ **Green/Blue badges** show on recommended oils  
✅ **Predicted impact** text is visible  
✅ **"Add X%" buttons** work and add oils instantly  
✅ **Disabled oils** (< 50%) show lock icon and tooltip  
✅ **Recommendations update** as recipe changes  

## Next Steps After Testing

If everything works:
1. Try creating a complete recipe using only recommendations
2. Experiment with different oil combinations
3. Test on mobile/tablet screen sizes
4. Share feedback on recommendation quality

If something doesn't work:
1. Note the specific issue
2. Check browser console for errors
3. Report with steps to reproduce
