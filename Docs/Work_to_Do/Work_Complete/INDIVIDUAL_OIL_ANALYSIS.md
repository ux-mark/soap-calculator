# UX Improvement Spec: Individual Oil Analysis in Soap Calculator

## Overview
Add per-oil inspection capability to allow users to understand how each ingredient contributes to the overall soap formulation.

## User Need
Users need to see how individual oils affect soap properties to make informed formulation decisions. Currently, they only see aggregate results.

## Feature: Single-Select Oil Inspection

### Selected Oils List Changes

**Visual Structure:**
- Wrap each oil entry in a clickable tile/card component
- Add visual states:
  - Default: neutral background
  - Hover: subtle highlight (e.g., border or background shade change)
  - Selected: distinct visual treatment (e.g., colored border, background tint)

**Interaction Model:**
- Single selection only (radio button pattern)
- Click any oil to select it
- Click selected oil again to deselect
- Selecting different oil automatically deselects previous
- Initial state: no selection (shows aggregate only)

**Technical Requirements:**
```typescript
// Add to oil state management
interface SelectedOil {
  // ... existing fields
  isInspecting: boolean; // new field for UI state
}

// Single source of truth for inspection
inspectedOilId: string | null;
```

### Soap Qualities Display Changes

**Layout Structure:**
For each quality metric (Hardness, Cleansing, etc.):

**When no oil selected:**
- Show current single bar (aggregate of all oils)
- Existing behavior unchanged

**When oil selected:**
- Show TWO horizontal bars per metric:
  1. **Individual Oil Bar** (new)
     - Label: "{Oil Name} contribution"
     - Color: distinct from aggregate (suggest: lighter/pastel version)
     - Value: that oil's isolated contribution to the metric
     - Visual: thinner or semi-transparent
  
  2. **Total/Aggregate Bar** (existing)
     - Label: "Total formula"
     - Color: current color scheme
     - Value: current calculation (all oils combined)
     - Visual: current appearance

**Visual Hierarchy:**
```
Hardness                                    34
Low hardness promotes fluidity...     5-15

[Oil Name] Contribution
████░░░░░░░░░░░░░░░░░░  8

Total Formula
████████████████░░░░░░  34
⚠ Above Range          Ideal: 8-12
```

### Fatty Acid Profile Display Changes

**Same dual-bar pattern:**

**When no oil selected:**
- Current single bar per fatty acid

**When oil selected:**
- Two bars per fatty acid:
  1. Individual oil's fatty acid percentage
  2. Total formula's fatty acid percentage

**Example:**
```
Oleic Acid                              36%
Conditioning, moisturizing

[Oil Name]: 15%
████████████░░░░░░░░░░░

Total: 36%
████████████████████████░░░
```

## Implementation Notes

### Data Calculation
```typescript
// Pseudocode for individual oil metrics
function calculateIndividualOilContribution(oil: SelectedOil) {
  // Calculate as if this oil was 100% of formula
  const oilAsWhole = calculateSoapQualities([oil]);
  
  // Scale by actual percentage in formula
  const weightedContribution = scaleByPercentage(
    oilAsWhole, 
    oil.percentage
  );
  
  return weightedContribution;
}
```

### Accessibility
- Keyboard navigation: Tab through oils, Enter/Space to select
- ARIA labels: "Select to inspect [Oil Name]", "Currently inspecting [Oil Name]"
- Screen reader announcement when selection changes
- Focus management: maintain focus on selected item

### Visual Design Principles
- Maintain existing color semantic (red/yellow/green for ranges)
- Use visual weight to show hierarchy (total > individual)
- Ensure sufficient contrast between individual and total bars
- Consider colorblind-safe palette differentiation

### Edge Cases
1. User deletes inspected oil → clear inspection state
2. User changes percentage of inspected oil → recalculate both bars in real-time
3. Single oil in formula → individual = total (still show both bars for consistency)

## Success Metrics
- User understands which oils contribute most to problem areas (e.g., high hardness)
- Enables experimentation: "What if I reduce this oil?"
- Educational: users learn oil properties through direct comparison

## Out of Scope
- Multi-select comparison (future enhancement)
- Historical comparison of formulas
- Suggested replacements based on selected oil