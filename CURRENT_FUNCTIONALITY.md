# Current Functionality Documentation
## Soap Calculator - Client-Side Implementation

**Last Updated:** November 9, 2025  
**Status:** ✅ Fully Functional - Client-Side Only  
**Next Phase:** Database Integration (Supabase)

---

## 📋 Executive Summary

The current Soap Calculator is a **fully functional, client-side web application** built with Next.js 15 that provides intelligent soap formulation with real-time calculations and AI-powered oil recommendations. All data is stored in browser memory (React Context) with no database persistence.

### What It Does
- ✅ Real-time soap recipe calculations
- ✅ Intelligent oil recommendations based on AI scoring
- ✅ 20+ oils with complete fatty acid profiles
- ✅ 7 soap quality metrics with visual indicators
- ✅ Multiple unit support (g, oz, lb)
- ✅ Recipe export as JSON
- ✅ Print-friendly recipe cards
- ✅ Responsive design for all devices

### What It Doesn't Do (Yet)
- ❌ User authentication
- ❌ Recipe persistence (database storage)
- ❌ Recipe sharing/discovery
- ❌ User profiles
- ❌ Custom oils creation
- ❌ Recipe collections/folders
- ❌ Social features (ratings, comments, forking)

---

## 🏗️ Technical Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | React framework with SSR support |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS 4.1 | Utility-first CSS framework |
| **UI Components** | Shadcn UI + Radix UI | Accessible component library |
| **State Management** | React Context API | Global state without external libraries |
| **Icons** | Lucide React | Icon library |
| **Runtime** | Node.js 18+ | JavaScript runtime |

### State Management Architecture

```
┌─────────────────────────────────────────┐
│      CalculatorProvider (Context)       │
│  - selectedOils: SelectedOil[]          │
│  - inputs: RecipeInputs                 │
│  - results: CalculationResults | null   │
│  - recommendations: OilRecommendation[] │
│  - incompatibleOilIds: Set<string>      │
└─────────────────┬───────────────────────┘
                  │
                  │ Provides State & Actions
                  ▼
┌─────────────────────────────────────────┐
│         useCalculator() Hook            │
│  Used by all calculator components      │
└─────────────────────────────────────────┘
```

**Data Flow:**
1. User interacts with UI components
2. Components call context actions (addOil, updateInputs, etc.)
3. Context updates state
4. Auto-recalculation triggered via useEffect
5. All calculations run in pure functions (lib/calculations.ts)
6. Recommendations engine scores all oils (lib/recommendations.ts)
7. Results propagate to all subscribed components
8. UI re-renders with new data

---

## 🔧 Core Features & Implementation

### 1. Oil Database (lib/oilData.ts)

**Static Data Source:** 20+ oils with complete profiles

```typescript
interface OilData {
  id: string;                    // "coconut-oil-76"
  name: string;                  // "Coconut Oil, 76 deg"
  sap_naoh: number;             // 0.183 (NaOH saponification value)
  sap_koh: number;              // 0.257 (KOH saponification value)
  fatty_acids: FattyAcidProfile; // 8 fatty acids
  iodine: number;               // Iodine value
  ins: number;                  // INS value
  category: string;             // "Hard Oil", "Soft Oil", etc.
}
```

**Helper Functions:**
- `getOilById(id)` - Lookup by ID
- `searchOils(query)` - Search by name
- `getOilsByCategory(category)` - Filter by category

**Categories:**
- Hard Oil (coconut, palm, babassu)
- Soft Oil (olive, canola, rice bran)
- Liquid Oil (sweet almond, avocado, grapeseed)
- Butter (cocoa, shea, mango)

---

### 2. Recipe Calculator (lib/calculations.ts)

**Main Calculation Engine:**

```typescript
calculateRecipe(inputs, selectedOils) → CalculationResults
```

**Sub-Calculations:**
1. **Fatty Acid Profile** - Weighted average of all fatty acids
2. **Soap Qualities** - 7 metrics derived from fatty acids:
   - Hardness (palmitic + stearic)
   - Cleansing (lauric + myristic)
   - Conditioning (oleic + linoleic + linolenic + ricinoleic)
   - Bubbly (lauric + myristic + ricinoleic)
   - Creamy (palmitic + stearic + ricinoleic)
   - Iodine (weighted average)
   - INS (weighted average)
3. **Lye Weight** - Based on SAP values and superfat
4. **Water Weight** - Three calculation methods:
   - Water as % of oils
   - Lye concentration %
   - Water to lye ratio
5. **Oil Weights** - Individual oil weights from percentages

**Quality Ranges:**

| Quality | Hard Soap Range | Ideal Range | Unit |
|---------|----------------|-------------|------|
| Hardness | 29-54 | 35-45 | - |
| Cleansing | 12-22 | 12-18 | - |
| Conditioning | 44-69 | 50-65 | - |
| Bubbly | 14-46 | 20-35 | - |
| Creamy | 16-48 | 20-35 | - |
| Iodine | 41-70 | 50-65 | - |
| INS | 136-165 | 145-160 | - |

**Liquid Soap** has different ranges stored separately.

**Validation:**
- Oil percentages must sum to 100% (±0.01% tolerance)
- No results displayed until validation passes

---

### 3. Recommendation System (lib/recommendations.ts)

**Intelligent AI Engine:**

```typescript
getRecommendedOils(context, soapType, maxRecommendations) → OilRecommendation[]
```

**Scoring Algorithm (0-100 points):**

| Factor | Points | Condition |
|--------|--------|-----------|
| **Base Score** | 50 | All oils start here |
| **Base Oil Bonus** | +20-25 | First oil selection (hard/soft oils) |
| **Quality Improvement** | +15 | Brings out-of-range quality into range |
| **Quality Optimization** | +5 | Moves quality closer to ideal |
| **Fatty Acid Diversity** | +10 | Complements current profile |
| **Fills Recipe Needs** | +10 | Per need addressed |
| **Similarity Penalty** | -0 to -20 | Based on similarity to selected oils |

**Need Identification:**
- Analyzes current qualities vs. ideal ranges
- Identifies gaps (hardness, cleansing, conditioning, etc.)
- Matches oils to needs via fatty acid profiles

**Dynamic Filtering (< 50% selected):**
- Oils with score < 25 are disabled (locked 🔒)
- Shows specific incompatibility reasons
- Opens up all oils once 50%+ selected

**Predicted Impact:**
- Simulates adding the oil at suggested percentage
- Calculates projected quality changes
- Shows improvement text ("This will bring hardness to 42")

**Suggested Percentages:**
```
- Castor Oil: 5-8%
- Coconut Oil (cleansing): 15-25%
- Hard Base Oils: 15-30%
- Conditioning Oils: 10-20%
- Specialty Oils: 5-10%
- Dynamic based on remaining percentage
```

---

### 4. User Interface Components

#### Input Section (components/calculator/InputSection.tsx)
**Controls:**
- Total Oil Weight (number input)
- Unit (g / oz / lb)
- Soap Type (hard / liquid)
- Lye Type (NaOH / KOH)
- Superfat (0-20% slider)
- Water Calculation Method (3 options)
- Water Value (dynamic based on method)
- Fragrance Weight (optional)

#### Oil Selector (components/calculator/OilSelector.tsx)
**Features:**
- Search bar (real-time filtering)
- Category dropdown filter
- Visual badges:
  - ✨ Recommended (top 5 scored oils)
  - 🔒 Incompatible (when < 50% selected)
  - ✓ Selected
- Oil tiles with properties
- Click to add/remove oils

#### Selected Oils List (components/calculator/SelectedOilsList.tsx)
**Features:**
- Total percentage tracker (must = 100%)
- Individual oil percentage inputs
- Remove oil buttons (❌)
- "Distribute Equally" button
- Visual validation (red border if not 100%)
- Real-time weight calculations

#### Quality Display (components/calculator/QualityDisplay.tsx)
**Features:**
- 7 quality metrics with:
  - Current value
  - Color-coded progress bars
  - Status badges (Ideal / In Range / Below / Above)
  - Ideal range overlay
- Fatty acid breakdown (8 acids)
- Responsive layout

#### Calculation Results (components/calculator/CalculationResults.tsx)
**Features:**
- Recipe summary (oils, lye, water, fragrance)
- Settings display (superfat, total batch weight)
- Complete oil breakdown table
- Step-by-step soap making instructions
- Safety warning
- Print button (printer-friendly CSS)
- Export button (downloads JSON)

---

## 📊 Data Models (TypeScript Interfaces)

### Core Types (lib/types.ts)

```typescript
// Oil selection with percentage
interface SelectedOil extends OilData {
  percentage: number;
  weight?: number;
}

// Recipe input parameters
interface RecipeInputs {
  totalOilWeight: number;
  unit: "g" | "oz" | "lb";
  soapType: "hard" | "liquid";
  lyeType: "NaOH" | "KOH";
  superfatPercentage: number;
  waterMethod: "water_as_percent_of_oils" | "lye_concentration" | "water_to_lye_ratio";
  waterValue: number;
  fragranceWeight: number;
}

// Complete calculation output
interface CalculationResults {
  selectedOils: SelectedOil[];
  totalOilWeight: number;
  lyeWeight: number;
  waterWeight: number;
  fragranceWeight: number;
  totalBatchWeight: number;
  qualities: SoapQualities;
  fattyAcids: FattyAcidProfile;
}

// AI recommendation
interface OilRecommendation {
  oil: OilData;
  score: number;                    // 0-100
  reason: string;                   // "Improves hardness"
  suggestedPercentage: number;      // 15
  predictedImpact: string;          // "This will bring hardness to 42"
  compatibilityFactors: {
    complementsFattyAcids: boolean;
    improvesQuality: string[];
    fillsNeeds: string[];
  };
}
```

---

## 🎯 User Workflows

### Workflow 1: Create a Recipe

1. **Set Parameters** → Input total oil weight, units, soap type
2. **Select Oils** → Browse or search, click to add
3. **Adjust Percentages** → Enter percentages (or use "Distribute Equally")
4. **Review Qualities** → Check if qualities are in ideal ranges
5. **Follow Recommendations** → Add suggested oils to improve recipe
6. **View Results** → See final ingredient amounts and instructions
7. **Export/Print** → Save as JSON or print recipe card

### Workflow 2: Refine with Recommendations

1. Select 1-2 base oils (coconut + olive)
2. View top 5 recommendations (✨ sparkle badge)
3. Click recommended oil to add
4. System suggests ideal percentage
5. Incompatible oils are locked 🔒
6. Continue until percentages = 100%
7. Fine-tune based on quality metrics

### Workflow 3: Expert Mode

1. Select all desired oils manually
2. Enter custom percentages
3. Ignore recommendations
4. Review quality metrics
5. Adjust percentages to hit ideal ranges
6. Export final recipe

---

## 💾 Current Data Storage

### What's Stored

| Data Type | Storage Location | Persistence |
|-----------|-----------------|-------------|
| Selected oils | React Context (RAM) | ❌ Session only |
| Recipe inputs | React Context (RAM) | ❌ Session only |
| Calculation results | React Context (RAM) | ❌ Recalculated live |
| Oil database | Static JS file | ✅ Bundled with app |
| Quality ranges | Static JS constants | ✅ Bundled with app |

### What Happens on Refresh
- ❌ All state is lost
- ❌ User must start over
- ❌ No recipe history
- ✅ Can re-import exported JSON manually

### Export Format (JSON)
```json
{
  "inputs": { /* RecipeInputs */ },
  "oils": [ /* SelectedOil[] */ ],
  "results": { /* CalculationResults */ },
  "createdAt": "2025-11-09T12:00:00.000Z"
}
```

**Note:** Exported JSON can be manually imported by editing code, but there's no UI for import yet.

---

## 🚫 Missing Features (Require Database)

### Critical for Production
1. **User Authentication**
   - Login/signup
   - Password reset
   - Email verification
   - Social auth (optional)

2. **Recipe Persistence**
   - Save recipes to database
   - Load saved recipes
   - Edit saved recipes
   - Delete recipes

3. **Recipe Management**
   - Name and describe recipes
   - Organize into collections
   - Tag recipes
   - Search saved recipes

### Nice-to-Have
4. **Public Recipe Discovery**
   - Browse public recipes
   - Search by oils, qualities
   - Filter by tags
   - Featured recipes

5. **Social Features**
   - Rate recipes (1-5 stars)
   - Write reviews
   - Comment on recipes
   - Fork/copy recipes

6. **Custom Oils**
   - Create custom oil entries
   - Define SAP values
   - Set fatty acid profiles
   - Share custom oils

7. **User Profiles**
   - Public/private profiles
   - Default preferences
   - Avatar
   - Bio

8. **Activity Tracking**
   - Recipe creation history
   - View count
   - Popular recipes
   - User activity feed

---

## 📋 Database Tables Needed for Current Features

Based on current functionality, here are the **minimum required tables** to add database persistence:

### Phase 1: Essential Tables (MVP)

| # | Table | Required For | Priority |
|---|-------|--------------|----------|
| 1 | `profiles` | User accounts | 🔴 Critical |
| 2 | `recipes` | Save/load recipes | 🔴 Critical |

**Total: 2 tables** to make current features persistent.

### What These Enable:
- ✅ Users can create accounts
- ✅ Users can save recipes
- ✅ Users can load their saved recipes
- ✅ Recipes persist across sessions
- ✅ Basic privacy (public/private recipes)

### What's NOT Needed Yet:

| # | Table | Used For | Status |
|---|-------|----------|--------|
| 3 | `recipe_oils` | Normalized oil storage | ⚪ Optional (can use JSONB in recipes) |
| 4 | `custom_oils` | User-created oils | ⚪ Future feature |
| 5 | `collections` | Recipe folders | ⚪ Nice-to-have |
| 6 | `collection_recipes` | Collection membership | ⚪ Nice-to-have |
| 7 | `saved_recipes` | Bookmarking others' recipes | ⚪ Social feature |
| 8 | `recipe_ratings` | Star ratings | ⚪ Social feature |
| 9 | `recipe_comments` | Discussion | ⚪ Social feature |
| 10 | `recipe_forks` | Copy tracking | ⚪ Social feature |
| 11 | `activity_log` | Analytics | ⚪ Analytics feature |
| 12 | `app_settings` | Global config | ⚪ Admin feature |

---

## 🎯 Minimal Database Schema (MVP)

### 1. profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  
  -- User preferences (with defaults)
  default_unit TEXT DEFAULT 'g' CHECK (default_unit IN ('g', 'oz', 'lb')),
  default_soap_type TEXT DEFAULT 'hard' CHECK (default_soap_type IN ('hard', 'liquid')),
  default_superfat INTEGER DEFAULT 5 CHECK (default_superfat BETWEEN 0 AND 20),
  
  -- Privacy
  profile_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_profiles_username ON profiles(username);
```

**What It Stores:**
- User identity (from Supabase Auth)
- Display name and avatar
- Default calculator preferences
- Privacy settings

### 2. recipes

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  
  -- Recipe data (store as JSONB)
  inputs JSONB NOT NULL,              -- RecipeInputs
  selected_oils JSONB NOT NULL,       -- SelectedOil[]
  calculated_results JSONB,           -- CalculationResults (cached)
  
  -- Metadata
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  
  -- Stats (for future)
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_is_public ON recipes(is_public) WHERE deleted_at IS NULL;
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
```

**What It Stores:**
- Recipe name, description, notes
- Complete recipe data as JSONB (inputs, oils, results)
- Public/private visibility
- Tags for organization
- Soft delete support

**JSONB Structure:**
```json
{
  "inputs": {
    "totalOilWeight": 500,
    "unit": "g",
    "soapType": "hard",
    "lyeType": "NaOH",
    "superfatPercentage": 5,
    "waterMethod": "water_as_percent_of_oils",
    "waterValue": 38,
    "fragranceWeight": 0
  },
  "selected_oils": [
    {
      "id": "coconut-oil-76",
      "name": "Coconut Oil, 76 deg",
      "percentage": 25,
      "weight": 125,
      "sap_naoh": 0.183,
      "fatty_acids": { /* ... */ }
    }
  ],
  "calculated_results": {
    "lyeWeight": 67.5,
    "waterWeight": 190,
    "qualities": { /* ... */ },
    "fattyAcids": { /* ... */ }
  }
}
```

---

## 🔒 Required RLS Policies (Security)

### profiles Table

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Anyone can read public profiles
CREATE POLICY "Anyone can read public profiles"
  ON profiles FOR SELECT
  USING (profile_public = true);
```

### recipes Table

```sql
-- Users can CRUD their own recipes
CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can read public recipes
CREATE POLICY "Anyone can read public recipes"
  ON recipes FOR SELECT
  USING (is_public = true AND deleted_at IS NULL);
```

---

## 📈 Implementation Effort Estimate

### Minimal Database Integration (2 tables)

| Task | Estimated Time | Complexity |
|------|---------------|------------|
| Supabase project setup | 1 hour | ⚪ Easy |
| Create 2 tables + RLS | 2 hours | ⚪ Easy |
| Install Supabase client | 1 hour | ⚪ Easy |
| Add authentication UI | 4 hours | 🟡 Medium |
| Save recipe functionality | 3 hours | 🟡 Medium |
| Load recipes list | 2 hours | ⚪ Easy |
| Edit/delete recipes | 2 hours | ⚪ Easy |
| Testing & debugging | 4 hours | 🟡 Medium |
| **Total** | **~19 hours** | **2-3 days** |

### Full Database (12 tables)

| Phase | Tables | Estimated Time |
|-------|--------|----------------|
| Phase 1 (MVP) | 2 tables | 2-3 days |
| Phase 2 (Collections) | +2 tables | 2 days |
| Phase 3 (Social) | +5 tables | 5 days |
| Phase 4 (Advanced) | +3 tables | 3 days |
| **Total** | **12 tables** | **3-4 weeks** |

---

## 🎯 Recommended Next Steps

### Option A: Minimal Database (Fastest)
1. ✅ Create Supabase project
2. ✅ Add 2 tables (profiles + recipes)
3. ✅ Implement authentication
4. ✅ Add save/load functionality
5. ✅ Deploy

**Result:** Users can save recipes. Social features come later.

### Option B: Full Database (Complete)
1. ✅ Create Supabase project
2. ✅ Add all 12 tables
3. ✅ Implement all features
4. ✅ Social features included
5. ✅ Deploy

**Result:** Full-featured app from day 1.

### Option C: Phased Rollout (Balanced)
1. ✅ Start with 2 tables (MVP)
2. ✅ Launch with save/load only
3. ✅ Add collections (Phase 2)
4. ✅ Add social features (Phase 3)
5. ✅ Add advanced features (Phase 4)

**Result:** Iterative development, faster time to market.

---

## 📞 Key Takeaways

### Current State
- ✅ **Fully functional** calculator with intelligent recommendations
- ✅ **Production-ready** UI and UX
- ✅ **No database** - everything is client-side
- ❌ **No persistence** - refreshing loses data

### To Enable Persistence
- **Minimum:** 2 tables (profiles + recipes)
- **Time:** 2-3 days of development
- **Complexity:** Low to medium

### Future Growth
- **10 additional tables** unlock social features
- **Phased approach** recommended for iterative development
- **Full implementation:** 3-4 weeks total

---

## 📚 Related Documentation

1. **DATABASE_SUMMARY.md** - Complete 12-table schema reference
2. **SUPABASE_DATABASE_SCHEMA.md** - Full SQL schema
3. **SUPABASE_IMPLEMENTATION_PLAN.md** - Step-by-step integration guide
4. **MIGRATION_STRATEGY.md** - Client-to-database migration plan
5. **README.md** - User-facing feature documentation

---

**Status:** ✅ Documentation Complete  
**Ready For:** Database integration decision  
**Recommended:** Start with 2-table MVP
