# Intelligent Soap Formulation Calculator - Project Specification

Build a modern, intelligent soap formulation calculator using Next.js, Tailwind CSS, Shadcn UI, and Supabase. This application guides users to create optimal soap recipes by analyzing their selected oils and recommending complementary ingredients to achieve ideal quality ranges.

## Project Overview

This calculator transforms traditional soap-making from trial-and-error to data-driven formulation. Users select oils they want to use, and the system intelligently recommends additional oils to achieve ideal soap quality ranges based on established fatty acid profiles and soap-making science.

## Technology Stack

1. **Framework: Next.js 15** (App Router with React Server Components)
   • Install Next.js, React, and React DOM
   • Set up app directory structure with layout.tsx and page.tsx
   • Configure for static generation where possible

2. **Styling: Tailwind CSS 4.1**
   • Initialize Tailwind CSS with PostCSS configuration
   • Update globals.css with Tailwind directives
   • Implement custom color scheme using @theme directive
   • Create responsive design system for all device sizes

3. **Component Library: Shadcn UI**
   • Initialize using `npx shadcn@latest init`
   • Install required components: Card, Input, Button, Badge, Select, Dialog, Tabs, Slider, Progress
   • Follow installation guide at https://ui.shadcn.com/docs/installation/next

4. **Backend & Database: Supabase**
   • Set up Supabase project (free tier)
   • Install @supabase/supabase-js
   • Store oil database, user recipes, and formulation history
   • Implement real-time updates for collaborative features (future)

5. **State Management**
   • React Context for global calculator state
   • Custom hooks for oil selection and calculation logic
   • Local storage for saving user preferences and draft recipes

6. **Deployment: Vercel**
   • Configure for Vercel's free tier
   • Set up environment variables for Supabase connection
   • Enable static optimization where possible

## Core Features & User Interface

### 1. User Input Section (Top of Page)

**Layout**: Centered container with clear visual hierarchy

**Required Inputs**:
- **Total Oil Weight**: Number input with unit selector (g/lb/oz) - Always default to metric (g)
  - Default: 500 g (or equivalent in selected unit)
  - Range: 0.1 - 1000 units
  - Live conversion display showing all three units

- **Lye Type**: Radio buttons
  - NaOH (Sodium Hydroxide) - for bar soap [default]
  - KOH (Potassium Hydroxide) - for liquid soap
  - Checkbox for "90% pure KOH" when KOH selected

- **Water Calculation Method**: Radio buttons with info tooltips
  - Water as % of Oils (default: 38%)
  - Lye Concentration (%)
  - Water:Lye Ratio (format: 2:1)

- **Superfat/Lye Discount**: Slider with number input
  - Default: 5%
  - Range: 0-15%
  - Real-time explanation of impact

- **Fragrance**: Optional
  - Ratio input (oz/lb or g/kg based on unit selection)
  - Default: 31 g / kg (3.1%)
  - Calculated amount displayed

### 2. Oil Selection Interface

**Visual Design**: 
- Large, scrollable container with responsive grid layout
- Search box at top with real-time filtering
- Alphabetical organization with letter jump navigation
- Visual indicators for oil properties

**Oil Tiles**:
Each oil displays as a card/tile showing:
- Oil name (prominent)
- Key characteristics (hardness, conditioning, cleansing icons)
- SAP value (small, for reference)
- Selected state indicator

**Tile States**:
1. **Unselected** (default)
   - Light background
   - Clickable/hoverable
   - Shows preview info on hover

2. **Selected & Active**
   - Moved to "Your Recipe" section at top of container
   - Input field for weight/percentage
   - Remove button (X)
   - Shows running percentage of total

3. **Disabled** (after 50% threshold)
   - Grayed out
   - Tooltip explaining why disabled
   - "Cannot achieve ideal range with this oil"

**Selection Interaction**:
- Click tile → opens input modal/inline input
- Enter amount → tile moves to top section
- Top section shows selected oils with:
  - Oil name
  - Amount entered
  - Percentage of total
  - Edit button
  - Remove button
  - Running total percentage

**Search & Filter**:
- Real-time search by oil name
- Filter by characteristics:
  - High hardness
  - High conditioning
  - High cleansing
  - Luxury oils
  - Common oils
  - Exotic oils
- Sort options:
  - Alphabetical
  - Most commonly used
  - By SAP value
  - By cost (future feature)

### 3. Quality & Fatty Acid Display

**Layout**: Two-column responsive layout below oil selection

#### Left Column: Soap Qualities

Display 7 key qualities in card format:

For each quality show:
- **Quality name** with info icon (tooltip)
- **Ideal range** (from specification table)
  - Visual range indicator bar
- **Current oil** value (selected in oil list)
  - Shown when hovering/selecting single oil
- **Recipe total** value (all selected oils combined)
  - Large, prominent display
  - Color-coded:
    - Green: within ideal range
    - Yellow: approaching limits
    - Red: outside ideal range
- **Visual progress bar** showing position relative to ideal range

**Quality List**:
1. Hardness (29-54, ideal: 45-48)
2. Cleansing (12-22, ideal: 14-16)
3. Conditioning (44-69, ideal: 75-78)
4. Bubbly (14-46, ideal: 10-12)
5. Creamy (16-48, ideal: 65-70)
6. Iodine Value (41-70, ideal: 60-65)
7. INS (136-165, ideal: 100-105)

#### Right Column: Fatty Acids

Display 8 fatty acids in similar card format:

For each fatty acid show:
- **Fatty acid name** with chemical notation
- **Type** (Saturated/Unsaturated)
- **Ideal range** (from specification table)
- **Current oil** value
- **Recipe total** value with color coding
- **Visual indicator**

**Fatty Acid List**:
1. Lauric Acid (5-10%, ideal: 7-8%)
2. Myristic Acid (5-10%, ideal: 7-8%)
3. Palmitic Acid (7-12%, ideal: 9-10%)
4. Stearic Acid (5-12%, ideal: 7-9%)
5. Ricinoleic Acid (0-5%, ideal: 2-3%)
6. Oleic Acid (15-25%, ideal: 18-20%)
7. Linoleic Acid (8-15%, ideal: 10-12%)
8. Linolenic Acid (2-5%, ideal: 3-4%)

**Additional Metrics**:
- Saturated:Unsaturated ratio
  - Display as "40:60" format
  - Visual pie chart representation
  - Color-coded based on ideal range (40-50:50-60)

### 4. Intelligent Recommendation System

**Activation Trigger**: When user's selected oils reach 50% of total weight

**Functionality**:
1. **Calculate remaining needs**:
   - Analyze current quality values
   - Determine deficiencies/excesses
   - Calculate ideal composition for remaining 50%

2. **Disable incompatible oils**:
   - Run calculations for each unselected oil
   - Determine if adding that oil at any percentage can achieve ideal ranges
   - Disable oils that mathematically cannot help reach ideal ranges
   - Show tooltip explaining why disabled

3. **Highlight recommended oils**:
   - Calculate "compatibility score" for each viable oil
   - Highlight top 3-5 recommendations with special styling
   - Show predicted impact: "Adding 15% will improve hardness to ideal range"

4. **Smart suggestions**:
   - Display recommended percentage for each suggested oil
   - Show "one-click add" option with calculated amount
   - Explain the improvement: "This will bring Conditioning to 76%"

**Visual Indicators**:
- Green badge: "Highly Recommended" (top 3 oils)
- Blue badge: "Good Match" (compatible oils)
- Gray: "Available" (won't hurt but not optimal)
- Red strikethrough: "Cannot achieve ideal range"

### 5. Calculation Display Section

**Layout**: Collapsible section at bottom of page

**Display when calculated**:
- Total oil weight (in all units)
- Required lye amount (NaOH or KOH)
- Required water amount
- Superfat amount
- Fragrance amount (if specified)
- Cure time estimate
- Expected bar hardness description
- Expected lather description

**Recipe Summary Card**:
- List of all oils with percentages
- All calculated values
- Quality assessment (all qualities in range: ✓ or specific issues)
- Overall grade: Excellent/Good/Fair/Needs Adjustment

### 6. Action Buttons

**Primary Actions**:
- **Calculate Recipe**: Large, prominent button
  - Disabled until at least one oil selected
  - Runs all calculations and updates display
  - Enables save/print buttons

- **Save Recipe**: 
  - Opens dialog for recipe naming
  - Saves to Supabase database
  - Local storage backup

- **Print Recipe**:
  - Generates printer-friendly view
  - Includes all values and instructions

- **Reset**:
  - Clear all selections
  - Confirmation dialog
  - Return to default state

**Secondary Actions**:
- **Load Recipe**: Dropdown of saved recipes
- **Export**: Download as PDF or JSON

## Database Schema

### Tables

#### 1. oils
```sql
CREATE TABLE oils (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  sap_naoh DECIMAL(5,3) NOT NULL,
  sap_koh DECIMAL(5,3) NOT NULL,
  iodine INTEGER NOT NULL,
  ins INTEGER NOT NULL,
  lauric INTEGER DEFAULT 0,
  myristic INTEGER DEFAULT 0,
  palmitic INTEGER DEFAULT 0,
  stearic INTEGER DEFAULT 0,
  ricinoleic INTEGER DEFAULT 0,
  oleic INTEGER DEFAULT 0,
  linoleic INTEGER DEFAULT 0,
  linolenic INTEGER DEFAULT 0,
  is_common BOOLEAN DEFAULT false,
  is_luxury BOOLEAN DEFAULT false,
  description TEXT,
  usage_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. recipes
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  total_oil_weight DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL, -- 'lb', 'oz', 'g'
  lye_type TEXT NOT NULL, -- 'NaOH' or 'KOH'
  koh_purity INTEGER DEFAULT 100, -- 90 or 100
  water_method TEXT NOT NULL, -- 'percent', 'concentration', 'ratio'
  water_value DECIMAL(5,2) NOT NULL,
  superfat DECIMAL(4,2) NOT NULL,
  fragrance_ratio DECIMAL(4,2),
  calculated_values JSONB, -- stores all calculated results
  quality_scores JSONB, -- stores quality values
  fatty_acid_scores JSONB, -- stores fatty acid values
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. recipe_oils
```sql
CREATE TABLE recipe_oils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  oil_id INTEGER REFERENCES oils(id),
  amount DECIMAL(10,3) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  sequence INTEGER NOT NULL, -- order in recipe
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. user_preferences
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  default_unit TEXT DEFAULT 'oz',
  default_lye_type TEXT DEFAULT 'NaOH',
  default_water_method TEXT DEFAULT 'percent',
  default_water_value DECIMAL(5,2) DEFAULT 38,
  default_superfat DECIMAL(4,2) DEFAULT 5,
  favorite_oils INTEGER[], -- array of oil IDs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Component Architecture

### Directory Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (main calculator)
│   ├── recipes/
│   │   └── [id]/page.tsx
│   └── api/
│       └── calculate/route.ts
├── components/
│   ├── calculator/
│   │   ├── InputSection.tsx
│   │   ├── OilSelector.tsx
│   │   ├── OilTile.tsx
│   │   ├── SelectedOilsList.tsx
│   │   ├── QualityDisplay.tsx
│   │   ├── FattyAcidDisplay.tsx
│   │   ├── CalculationResults.tsx
│   │   └── RecommendationEngine.tsx
│   ├── ui/ (shadcn components)
│   └── common/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase.ts
│   ├── calculations.ts (port from JS file)
│   ├── oilData.ts (oil array from JS)
│   ├── recommendations.ts
│   └── utils.ts
├── hooks/
│   ├── useCalculator.ts
│   ├── useOilSelection.ts
│   └── useRecipes.ts
├── types/
│   ├── oil.ts
│   ├── recipe.ts
│   └── calculation.ts
└── contexts/
    └── CalculatorContext.tsx
```

### Key Components

#### 1. InputSection Component
**Purpose**: Centralized input controls at top of page

**Props**: None (uses context)

**Features**:
- Total weight input with unit conversion
- Lye type selector
- Water calculation method selector
- Superfat slider
- Fragrance input
- Real-time validation
- Responsive layout

#### 2. OilSelector Component
**Purpose**: Main oil selection interface

**Props**:
```typescript
{
  onOilSelect: (oilId: number, amount: number) => void;
  disabledOils: number[];
  selectedOils: SelectedOil[];
  recommendedOils: RecommendedOil[];
}
```

**Features**:
- Search functionality
- Alphabetical navigation
- Filter options
- Tile grid layout
- Responsive design
- Accessibility support

#### 3. OilTile Component
**Purpose**: Individual oil display and selection

**Props**:
```typescript
{
  oil: Oil;
  isSelected: boolean;
  isDisabled: boolean;
  isRecommended: boolean;
  recommendationScore?: number;
  onSelect: () => void;
}
```

**States**:
- Default (selectable)
- Selected (in recipe)
- Disabled (grayed out)
- Recommended (highlighted)

#### 4. QualityDisplay Component
**Purpose**: Show soap quality metrics

**Props**:
```typescript
{
  qualities: QualityValues;
  currentOilQuality?: QualityValues;
  idealRanges: QualityRanges;
}
```

**Features**:
- Visual progress bars
- Color-coded indicators
- Range display
- Tooltips with explanations
- Responsive cards

#### 5. RecommendationEngine Component
**Purpose**: Intelligent oil recommendations

**Props**:
```typescript
{
  currentRecipe: Recipe;
  threshold: number; // default 50
}
```

**Features**:
- Calculate missing quality values
- Score all unselected oils
- Disable incompatible oils
- Highlight recommendations
- Show predicted improvements
- One-click add suggestions

## Calculation Logic (Port from JavaScript)

### Core Calculation Functions

#### 1. Calculate Properties for Single Oil
```typescript
function calculateOilProperties(oil: Oil, percentage: number): Properties {
  // Port getProperties() function
  // Return object with all quality and fatty acid values
}
```

#### 2. Calculate Recipe Totals
```typescript
function calculateRecipeTotals(selectedOils: SelectedOil[]): RecipeResults {
  // Reset all values
  // Iterate through selected oils
  // Sum all properties
  // Calculate ratios
  // Return complete results
}
```

#### 3. Calculate Lye and Water
```typescript
function calculateLyeAndWater(
  totalOilWeight: number,
  selectedOils: SelectedOil[],
  lyeType: 'NaOH' | 'KOH',
  kohPurity: number,
  waterMethod: WaterMethod,
  superfat: number
): LyeWaterResults {
  // Calculate total SAP
  // Apply superfat discount
  // Calculate water based on method
  // Return lye and water amounts
}
```

#### 4. Recommendation Algorithm
```typescript
function calculateRecommendations(
  currentRecipe: Recipe,
  remainingPercentage: number,
  allOils: Oil[]
): RecommendationResults {
  // Calculate current deficiencies
  // For each unselected oil:
  //   - Test at various percentages (5%, 10%, 15%, etc.)
  //   - Calculate resulting quality values
  //   - Check if ideal ranges achievable
  //   - Calculate compatibility score
  // Sort by score
  // Return top recommendations and disabled oils
}
```

### Validation Functions

```typescript
function validateRecipe(recipe: Recipe): ValidationResult {
  // Check total percentage = 100%
  // Check all values are numbers
  // Check ranges are valid
  // Return errors/warnings
}

function isInIdealRange(value: number, range: Range): boolean {
  return value >= range.min && value <= range.max;
}

function calculateQualityScore(qualities: QualityValues): number {
  // Calculate how many qualities are in ideal range
  // Weight by importance
  // Return score 0-100
}
```

## Data Migration

### Import Oil Database from JavaScript

**Script**: `supabase/seed-oils.ts`

```typescript
// Parse aryAllOils from JavaScript file
// Transform to database format
// Insert into oils table
// Set common/luxury flags based on usage
```

**Oil Data Processing**:
1. Extract all 149 oils from JavaScript array
2. Calculate NaOH SAP (given) and KOH SAP (NaOH * 56.1/40)
3. Add metadata (common, luxury, descriptions)
4. Import into Supabase

### Ideal Ranges Configuration

**Storage**: Store in config file or database table

```typescript
export const IDEAL_RANGES = {
  qualities: {
    hardness: { min: 29, max: 54, ideal: { min: 45, max: 48 } },
    cleansing: { min: 12, max: 22, ideal: { min: 14, max: 16 } },
    conditioning: { min: 44, max: 69, ideal: { min: 75, max: 78 } },
    // ... etc
  },
  fattyAcids: {
    lauric: { min: 5, max: 10, ideal: { min: 7, max: 8 } },
    // ... etc
  }
};
```

## User Experience Enhancements

### 1. Progressive Disclosure
- Start with simple view (just oil selection)
- Expand details as user adds oils
- Show recommendations only when relevant (50% threshold)
- Progressive validation messages

### 2. Visual Feedback
- Smooth animations for tile selection/deselection
- Color transitions for quality ranges
- Loading states for calculations
- Success/error toast notifications
- Pulse animation for recommended oils

### 3. Tooltips & Help
- Info icons for all technical terms
- Hover tooltips with explanations
- Link to fatty acid Wikipedia pages
- "Learn more" expandable sections

### 4. Mobile Optimization
- Touch-friendly tile sizing
- Swipeable oil categories
- Sticky input section header
- Bottom sheet for calculation results
- Optimized for portrait and landscape

### 5. Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators
- Skip navigation links

## Responsive Design Breakpoints

```css
/* Mobile: < 640px */
- Single column layout
- Stacked quality/fatty acid displays
- Simplified oil tiles
- Bottom sheet for results

/* Tablet: 640px - 1024px */
- Two column layout for qualities/fatty acids
- Medium-sized oil tiles
- Side panel for selected oils

/* Desktop: > 1024px */
- Three column layout option
- Larger oil tiles with more info
- Side-by-side comparison views
- Enhanced visualization options
```

## Color Scheme

**Primary Colors** (using Tailwind @theme):
```css
@theme {
  --color-primary: #8b5cf6; /* Purple - soap bubbles */
  --color-secondary: #06b6d4; /* Cyan - water */
  --color-success: #10b981; /* Green - ideal range */
  --color-warning: #f59e0b; /* Amber - approaching limits */
  --color-danger: #ef4444; /* Red - out of range */
  --color-neutral: #6b7280; /* Gray - disabled */
}
```

**Quality Range Colors**:
- Below range: #fca5a5 (red-300)
- In range: #86efac (green-300)
- Above range: #fcd34d (yellow-300)
- Ideal range: #34d399 (emerald-400)

## Performance Optimization

### 1. Calculation Optimization
- Memoize calculation results
- Debounce input changes
- Web Worker for heavy calculations
- Cache oil properties

### 2. Rendering Optimization
- Virtual scrolling for oil list (150+ oils)
- Lazy load oil details
- React.memo for tile components
- UseMemo for filtered/sorted lists

### 3. Data Loading
- Static generation for oil database
- Client-side caching
- Progressive hydration
- Optimistic UI updates

## Testing Strategy

### Unit Tests
- Calculation functions (critical!)
- Recommendation algorithm
- Validation logic
- Utility functions

### Integration Tests
- Oil selection workflow
- Recipe calculation flow
- Save/load functionality
- Recommendation engine

### E2E Tests (Playwright)
- Complete recipe creation
- Load saved recipe
- Print recipe
- Responsive behavior

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js project with Tailwind 4.1
- [ ] Configure Shadcn UI
- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Import oil data
- [ ] Port calculation logic from JavaScript
- [ ] Create basic component structure

### Phase 2: Core Features (Week 3-4)
- [ ] Build InputSection component
- [ ] Build OilSelector with search/filter
- [ ] Create OilTile component with states
- [ ] Implement oil selection logic
- [ ] Build QualityDisplay component
- [ ] Build FattyAcidDisplay component
- [ ] Wire up calculation engine

### Phase 3: Intelligence (Week 5-6)
- [ ] Implement 50% threshold detection
- [ ] Build recommendation algorithm
- [ ] Create RecommendationEngine component
- [ ] Implement oil disabling logic
- [ ] Add visual highlighting for recommendations
- [ ] Build "one-click add" feature

### Phase 4: Results & Actions (Week 7)
- [ ] Build CalculationResults component
- [ ] Implement recipe saving
- [ ] Implement recipe loading
- [ ] Create print view
- [ ] Add export functionality

### Phase 5: Polish (Week 8)
- [ ] Responsive design refinement
- [ ] Accessibility improvements
- [ ] Animation and transitions
- [ ] Tooltips and help content
- [ ] Performance optimization
- [ ] Testing and bug fixes

## Success Metrics

### User Experience
- 95% of recipes achieve ideal ranges with recommendations
- < 5 minutes average time to create recipe
- < 3 clicks to add recommended oil
- Mobile usage > 40%

### Technical
- < 100ms calculation time
- < 2s page load time
- 95+ Lighthouse scores
- Zero accessibility violations

### Business
- 80% recipe save rate
- 60% return user rate
- < 5% error rate

## Future Enhancements (Post-MVP)

### Phase 2 Features
- [ ] User accounts and authentication
- [ ] Print labels with QR codes
- [ ] Cure time tracker
- [ ] Ingredient inventory management
- [ ] Batch scaling calculator
- [ ] Recipe notes and adjustments
- [ ] Cost calculator integration
- [ ] Supplier price comparison

### Advanced Features
- [ ] AI-powered recipe suggestions
- [ ] Video tutorials integration
- [ ] Scent and color recommendations
- [ ] Seasonal recipe suggestions
- [ ] Competition submission helper
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app (React Native)

## Documentation Requirements

### User Documentation (Added later)
- Getting started guide
- How to create your first recipe
- Understanding soap qualities
- Interpreting fatty acid profiles
- Using recommendations
- Saving and managing recipes
- Troubleshooting guide
- FAQ

### Developer Documentation
- API documentation
- Component documentation
- Calculation logic explanation
- Database schema
- Deployment guide
- Contributing guidelines

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance
- [ ] Keyboard navigation for all interactions
- [ ] Screen reader support
- [ ] Color contrast ratios 4.5:1 minimum
- [ ] Focus indicators visible
- [ ] Alt text for all images/icons
- [ ] ARIA labels for dynamic content
- [ ] Skip navigation links
- [ ] Resizable text (up to 200%)
- [ ] No auto-playing content
- [ ] Error identification and suggestions

## Security Considerations

### Data Protection
- Environment variables for API keys
- Row-level security in Supabase
- Input sanitization
- XSS prevention
- CSRF protection (in future authenticated version)

### Privacy
- No tracking without consent
- Clear data retention policy
- GDPR compliance preparation
- Cookie policy (if analytics added)

## Launch Checklist

### Pre-Launch
- [ ] All MVP features complete
- [ ] Calculation accuracy verified
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] SEO optimization done
- [ ] Analytics configured
- [ ] Error monitoring set up

### Launch
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Set up monitoring
- [ ] Create backup strategy
- [ ] Announce to community
- [ ] Gather initial feedback

### Post-Launch
- [ ] Monitor error rates
- [ ] Track user behavior
- [ ] Collect feedback
- [ ] Plan iteration cycles
- [ ] Build feature roadmap

---

## Notes

This specification prioritizes:
1. **Accuracy**: Calculations must be exact per original JavaScript logic
2. **Usability**: Interface must be intuitive and guide users to success
3. **Intelligence**: Recommendations must genuinely help achieve ideal ranges
4. **Performance**: Fast calculations and smooth interactions
5. **Accessibility**: Usable by everyone
6. **Mobile-first**: Great experience on all devices

The recommendation engine is the key differentiator - it transforms this from a calculator into an intelligent assistant that helps users create better soap recipes.

# Attribution requirement
At the bottom of the page, include the following text: This project uses data from SoapCalc (soapcalc.net) under fair use for educational and non-commercial purposes.