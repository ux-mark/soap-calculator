# Database Migration Strategy
## Moving from Client-Side to Supabase

**Last Updated:** November 9, 2025  
**Status:** Planning Phase

---

## 📋 Overview

### Current State
- ✅ Fully functional client-side calculator
- ✅ Oil data hardcoded in `/lib/oilData.ts`
- ❌ No user accounts
- ❌ No persistence (only localStorage)
- ❌ No sharing capabilities
- ❌ No cloud backup

### Target State
- ✅ Full-stack application
- ✅ User authentication
- ✅ Cloud database
- ✅ Recipe persistence
- ✅ Sharing & discovery
- ✅ Advanced social features

### Migration Goals
1. **Zero Downtime** - Keep existing app working during migration
2. **Data Preservation** - Allow users to migrate local recipes
3. **Backward Compatibility** - Support both modes during transition
4. **Progressive Enhancement** - Add features incrementally

---

## 🎯 Migration Strategy

### Option 1: Big Bang Migration (Not Recommended)
❌ Deploy all changes at once  
❌ High risk of breaking existing users  
❌ Difficult to roll back  

### Option 2: Gradual Migration (Recommended) ✅
✅ Deploy database features alongside existing functionality  
✅ Feature flags to enable/disable  
✅ Users opt-in to new features  
✅ Easy rollback path  

---

## 🔄 Phased Rollout Plan

### Phase 1: Infrastructure Setup (Users Unaffected)
**Duration:** 2-3 days  
**User Impact:** None

**Tasks:**
- [ ] Create Supabase project
- [ ] Set up database tables
- [ ] Configure RLS policies
- [ ] Seed system data
- [ ] Deploy to staging environment

**Code Changes:**
- Add Supabase dependencies
- Create database utilities (unused initially)
- No changes to existing components

**Deployment:**
```bash
# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Environment variables (not used yet)
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Deploy (no functional changes)
npm run build
vercel deploy
```

---

### Phase 2: Authentication Layer (Optional Feature)
**Duration:** 3-4 days  
**User Impact:** New optional feature

**Tasks:**
- [ ] Add login/signup pages
- [ ] Implement auth flow
- [ ] Create user profiles
- [ ] Add "Sign Up" banner to app

**Code Changes:**
```typescript
// Keep existing calculator working
// Add new auth components (separate routes)

// app/page.tsx (calculator - unchanged)
export default function CalculatorPage() {
  return <CalculatorApp /> // existing app
}

// app/login/page.tsx (NEW)
export default function LoginPage() {
  return <LoginForm />
}
```

**User Experience:**
- Existing users: No change, calculator works as before
- New users: See banner "Sign up to save recipes!"
- Opt-in: Users can create account if desired

**Deployment:**
```bash
# Deploy with new auth pages
# Existing functionality unchanged
npm run build
vercel deploy
```

---

### Phase 3: Recipe Saving (Parallel to localStorage)
**Duration:** 4-5 days  
**User Impact:** Optional enhancement

**Strategy:** Dual-mode storage

**Code Changes:**
```typescript
// contexts/CalculatorContext.tsx

interface StorageMode {
  type: 'local' | 'cloud'
  syncEnabled: boolean
}

// Save to BOTH localStorage AND database (if logged in)
const saveRecipe = async (name: string) => {
  const recipe = {
    name,
    inputs,
    selectedOils,
    results,
  }
  
  // Always save to localStorage (existing behavior)
  localStorage.setItem(`recipe_${Date.now()}`, JSON.stringify(recipe))
  
  // Additionally save to cloud if user is logged in
  if (user) {
    try {
      await supabase.from('recipes').insert({
        user_id: user.id,
        ...recipe
      })
      toast.success('Recipe saved to cloud!')
    } catch (error) {
      toast.error('Cloud save failed, saved locally only')
    }
  }
  
  return recipe
}
```

**User Experience:**
- Not logged in: Works exactly as before (localStorage)
- Logged in: Saves to BOTH localStorage + cloud
- If cloud fails: Falls back to localStorage gracefully

**Benefits:**
- Zero risk of data loss
- Gradual user migration
- Easy rollback

---

### Phase 4: Recipe Loading (Hybrid Mode)
**Duration:** 2-3 days  
**User Impact:** Enhanced functionality

**Strategy:** Load from both sources

```typescript
const loadRecipes = async () => {
  const localRecipes = getRecipesFromLocalStorage()
  
  if (user) {
    const { data: cloudRecipes } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
    
    // Merge both sources
    return {
      local: localRecipes,
      cloud: cloudRecipes,
      merged: deduplicateRecipes([...localRecipes, ...cloudRecipes])
    }
  }
  
  return {
    local: localRecipes,
    cloud: [],
    merged: localRecipes
  }
}
```

**User Experience:**
- See recipes from BOTH sources
- Clear indication of source (cloud icon vs local icon)
- Migration prompt: "Upload local recipes to cloud?"

---

### Phase 5: Migration Tool (One-Time Import)
**Duration:** 2-3 days  
**User Impact:** Optional data migration

**Create `/app/migrate/page.tsx`:**
```typescript
export default function MigratePage() {
  const [localRecipes, setLocalRecipes] = useState([])
  const [migrationStatus, setMigrationStatus] = useState({})
  
  const migrateRecipe = async (recipe: LocalRecipe) => {
    try {
      await supabase.from('recipes').insert({
        user_id: user.id,
        name: recipe.name,
        inputs: recipe.inputs,
        selected_oils: recipe.selectedOils,
        // ... map fields
      })
      
      setMigrationStatus(prev => ({
        ...prev,
        [recipe.id]: 'success'
      }))
    } catch (error) {
      setMigrationStatus(prev => ({
        ...prev,
        [recipe.id]: 'failed'
      }))
    }
  }
  
  return (
    <div>
      <h1>Migrate Your Recipes to Cloud</h1>
      <p>Found {localRecipes.length} local recipes</p>
      
      {localRecipes.map(recipe => (
        <RecipeMigrationCard
          key={recipe.id}
          recipe={recipe}
          status={migrationStatus[recipe.id]}
          onMigrate={() => migrateRecipe(recipe)}
        />
      ))}
      
      <Button onClick={migrateAll}>Migrate All</Button>
    </div>
  )
}
```

**User Experience:**
1. User logs in first time
2. Banner shows: "You have 5 local recipes. Migrate to cloud?"
3. Click "Migrate" → Taken to migration page
4. Select recipes to upload
5. Click "Migrate All"
6. Progress indicator shows upload status
7. Success message + option to delete local copies

**Safety:**
- Never auto-delete local recipes
- Allow re-migration if needed
- Keep local copy as backup

---

### Phase 6: Public Features (Pure Addition)
**Duration:** 5-7 days  
**User Impact:** New features only

**Add new pages without affecting existing functionality:**
- `/discover` - Browse public recipes
- `/recipes/[id]` - View recipe details
- `/collections` - Organize recipes
- `/profile` - User profile

**No changes to calculator page!**

---

### Phase 7: Gradual Feature Deprecation
**Duration:** Ongoing  
**User Impact:** Gentle nudges toward cloud

**Stage 1: Encourage (Months 1-3)**
- Banner: "Sign up to unlock cloud features!"
- Feature comparison table
- Testimonials from other users

**Stage 2: Soft Deprecation (Months 3-6)**
- Warning: "localStorage has limits (max 10MB)"
- Message: "Browser clear will delete local recipes"
- Emphasize backup benefits

**Stage 3: Hard Deprecation (Month 6+)**
- localStorage becomes cache only
- Must be logged in to save permanently
- Migration mandatory for new saves
- Still allow reading old local recipes

**Stage 4: Sunset (Month 12+)**
- Remove localStorage save functionality
- Keep read-only for old recipes
- Final migration reminder

---

## 🔧 Technical Implementation

### Feature Flag System

Create `/lib/features.ts`:
```typescript
export const FEATURES = {
  AUTH_ENABLED: process.env.NEXT_PUBLIC_FEATURE_AUTH === 'true',
  CLOUD_SAVE: process.env.NEXT_PUBLIC_FEATURE_CLOUD_SAVE === 'true',
  PUBLIC_RECIPES: process.env.NEXT_PUBLIC_FEATURE_PUBLIC === 'true',
  SOCIAL_FEATURES: process.env.NEXT_PUBLIC_FEATURE_SOCIAL === 'true',
}

export function useFeature(feature: keyof typeof FEATURES) {
  return FEATURES[feature]
}
```

Usage:
```typescript
function SaveButton() {
  const cloudSaveEnabled = useFeature('CLOUD_SAVE')
  
  if (cloudSaveEnabled && user) {
    return <CloudSaveButton />
  }
  
  return <LocalSaveButton />
}
```

Environment variables:
```bash
# .env.local

# Rollout stages
NEXT_PUBLIC_FEATURE_AUTH=true           # Phase 2
NEXT_PUBLIC_FEATURE_CLOUD_SAVE=true     # Phase 3
NEXT_PUBLIC_FEATURE_PUBLIC=true         # Phase 6
NEXT_PUBLIC_FEATURE_SOCIAL=true         # Phase 6
```

---

### Dual Storage Manager

Create `/lib/storage/dualStorage.ts`:
```typescript
interface Recipe {
  id: string
  name: string
  source: 'local' | 'cloud'
  // ... other fields
}

export class DualStorageManager {
  async saveRecipe(recipe: Recipe): Promise<void> {
    // Save to localStorage
    this.saveToLocal(recipe)
    
    // Try to save to cloud if user is authenticated
    if (this.isAuthenticated()) {
      try {
        await this.saveToCloud(recipe)
      } catch (error) {
        console.warn('Cloud save failed, local copy preserved', error)
        // Don't throw - local save succeeded
      }
    }
  }
  
  async loadRecipes(): Promise<Recipe[]> {
    const local = this.loadFromLocal()
    
    if (this.isAuthenticated()) {
      const cloud = await this.loadFromCloud()
      return this.mergeRecipes(local, cloud)
    }
    
    return local
  }
  
  private mergeRecipes(local: Recipe[], cloud: Recipe[]): Recipe[] {
    // Deduplicate by ID
    // Prefer cloud version if exists in both
    const recipeMap = new Map<string, Recipe>()
    
    local.forEach(r => recipeMap.set(r.id, { ...r, source: 'local' }))
    cloud.forEach(r => recipeMap.set(r.id, { ...r, source: 'cloud' }))
    
    return Array.from(recipeMap.values())
  }
}
```

---

### Migration Conflict Resolution

**Scenario:** User has recipe "Coconut Dream" in both local and cloud

**Strategy 1: Cloud Wins (Simple)**
```typescript
// Always prefer cloud version
const merged = cloudRecipes.concat(
  localRecipes.filter(lr => 
    !cloudRecipes.some(cr => cr.name === lr.name)
  )
)
```

**Strategy 2: User Chooses (Recommended)**
```typescript
// Detect conflicts
const conflicts = localRecipes.filter(lr =>
  cloudRecipes.some(cr => 
    cr.name === lr.name && 
    cr.updated_at < lr.updated_at // local is newer
  )
)

if (conflicts.length > 0) {
  // Show conflict resolution UI
  return <ConflictResolverDialog conflicts={conflicts} />
}
```

**Strategy 3: Merge (Advanced)**
```typescript
// Combine both, rename duplicates
const merged = []
const nameCount = new Map<string, number>()

for (const recipe of [...cloudRecipes, ...localRecipes]) {
  let name = recipe.name
  const count = nameCount.get(name) || 0
  
  if (count > 0) {
    name = `${recipe.name} (${count})`
  }
  
  nameCount.set(recipe.name, count + 1)
  merged.push({ ...recipe, name })
}
```

---

## 📊 Data Mapping

### localStorage Format (Current)
```typescript
// Stored in: localStorage.getItem('soapcalc_recipes')
interface LocalStorageRecipe {
  id: string
  name: string
  oils: Array<{
    id: string
    percentage: number
  }>
  settings: {
    totalWeight: number
    unit: string
    superfat: number
    waterPercent: number
  }
  createdAt: string
  updatedAt: string
}
```

### Supabase Format (Target)
```sql
-- recipes table
{
  id: uuid,
  user_id: uuid,
  name: text,
  inputs: jsonb,          -- Maps from settings
  selected_oils: jsonb,   -- Maps from oils
  calculated_results: jsonb,
  created_at: timestamptz, -- Maps from createdAt
  updated_at: timestamptz
}
```

### Migration Mapper
```typescript
function mapLocalToSupabase(local: LocalStorageRecipe) {
  return {
    name: local.name,
    inputs: {
      totalOilWeight: local.settings.totalWeight,
      unit: local.settings.unit,
      soapType: 'hard', // default
      lyeType: 'NaOH',  // default
      superfatPercentage: local.settings.superfat,
      waterMethod: 'water_as_percent_of_oils',
      waterValue: local.settings.waterPercent,
      fragranceWeight: 0,
    },
    selected_oils: local.oils.map(oil => {
      const oilData = OILS_DATABASE.find(o => o.id === oil.id)
      return {
        ...oilData,
        percentage: oil.percentage,
      }
    }),
    calculated_results: null, // Will be recalculated
  }
}
```

---

## 🧪 Testing Strategy

### Test Cases for Each Phase

**Phase 1: Infrastructure**
- [ ] Database tables created
- [ ] RLS policies working
- [ ] No impact on existing app

**Phase 2: Authentication**
- [ ] User can sign up
- [ ] User can log in
- [ ] Calculator works without login
- [ ] Calculator works with login

**Phase 3: Cloud Save**
- [ ] Logged-in user saves to cloud
- [ ] Logged-out user saves to local
- [ ] Cloud save failure falls back to local
- [ ] Both saves succeed

**Phase 4: Hybrid Load**
- [ ] Loads local recipes
- [ ] Loads cloud recipes
- [ ] Merges correctly
- [ ] No duplicates

**Phase 5: Migration**
- [ ] Detects local recipes
- [ ] Migrates successfully
- [ ] Handles duplicates
- [ ] Shows progress
- [ ] Handles errors gracefully

---

## 🚨 Rollback Procedures

### Emergency Rollback (Phase 2-5)

**If cloud features break:**
```bash
# Disable features via environment variables
NEXT_PUBLIC_FEATURE_AUTH=false
NEXT_PUBLIC_FEATURE_CLOUD_SAVE=false

# Redeploy
vercel deploy --prod

# App reverts to localStorage-only mode
# No user data lost
```

**If database is corrupted:**
```bash
# Users can still use local mode
# Fix database offline
# Re-enable when ready
```

### Partial Rollback

**Disable specific features:**
```bash
# Keep auth but disable cloud save
NEXT_PUBLIC_FEATURE_AUTH=true
NEXT_PUBLIC_FEATURE_CLOUD_SAVE=false  # <-- disabled
```

---

## 📅 Recommended Timeline

### Conservative Approach (3 months)

**Month 1:**
- Week 1-2: Phase 1 (Infrastructure)
- Week 3-4: Phase 2 (Authentication)

**Month 2:**
- Week 1-2: Phase 3 (Cloud Save)
- Week 3-4: Phase 4 (Hybrid Load)

**Month 3:**
- Week 1-2: Phase 5 (Migration Tool)
- Week 3-4: Phase 6 (Public Features)

**Month 4+:**
- Phase 7 (Gradual deprecation)

### Aggressive Approach (3 weeks)

**Week 1:**
- Day 1-2: Phase 1
- Day 3-5: Phase 2
- Day 6-7: Phase 3

**Week 2:**
- Day 1-2: Phase 4
- Day 3-5: Phase 5
- Day 6-7: Phase 6

**Week 3:**
- Testing, bug fixes, polish
- Deploy to production

---

## 🎯 Success Metrics

### Phase 2 (Auth) Success Criteria
- ✅ 10% of users create accounts
- ✅ Zero complaints about broken calculator
- ✅ No increase in error rate

### Phase 3 (Cloud Save) Success Criteria
- ✅ 50% of logged-in users save to cloud
- ✅ Cloud save success rate > 99%
- ✅ Fallback to local works 100%

### Phase 5 (Migration) Success Criteria
- ✅ 80% of users migrate successfully
- ✅ Zero data loss incidents
- ✅ < 1% report migration issues

### Overall Success
- ✅ User satisfaction maintained or improved
- ✅ No downtime during migration
- ✅ Feature adoption > 60%
- ✅ Cloud recipe count > local recipe count

---

## 🔍 Monitoring & Alerts

### Key Metrics to Track

**Error Rates:**
```typescript
// Track in error monitoring (Sentry)
- Database connection failures
- Authentication failures
- Migration failures
- Data corruption incidents
```

**Usage Metrics:**
```typescript
// Track in analytics
- Signup rate
- Login rate
- Cloud save rate
- Migration completion rate
- Feature adoption rate
```

**Performance:**
```typescript
// Track in APM
- Database query time
- Recipe save time
- Recipe load time
- Migration time per recipe
```

### Alert Thresholds
- 🔴 Critical: Error rate > 5%
- 🟡 Warning: Error rate > 1%
- 🟢 Good: Error rate < 0.1%

---

## 💡 User Communication

### In-App Messaging

**Phase 2 Launch:**
```
🎉 New Feature: Sign Up for Cloud Backup!

Create an account to:
- Save your recipes to the cloud
- Access them from any device
- Never lose your data

[Sign Up] [Learn More] [Dismiss]
```

**Phase 5 Migration:**
```
📦 Migrate Your Local Recipes

We found 5 recipes saved in your browser.
Migrate them to the cloud for safekeeping!

[Migrate Now] [Remind Me Later]
```

**Phase 7 Deprecation:**
```
⚠️ Important: Local Storage Ending Soon

Starting next month, recipes must be saved to the cloud.
Migrate your existing recipes now to avoid losing them.

[Migrate Now] [Learn More]
```

### Email Notifications (Optional)
- Welcome email (Phase 2)
- Migration reminder (Phase 5)
- Deprecation warning (Phase 7)

---

## 🎓 User Education

### Help Documentation

**Create `/docs/migration-guide.md`:**
- What's changing and why
- How to migrate recipes
- What happens to local data
- FAQ

**Create video tutorial:**
- 2-minute walkthrough
- Show migration process
- Highlight benefits

**In-app tooltips:**
- First time user sees cloud save
- First time sees migration prompt
- First time uses new features

---

## ✅ Pre-Launch Checklist

### Before Each Phase
- [ ] Code review completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual QA completed
- [ ] Staging environment tested
- [ ] Rollback plan documented
- [ ] Team briefed
- [ ] Monitoring configured
- [ ] User communication ready

### Before Production Deploy
- [ ] Database backup created
- [ ] Feature flags configured
- [ ] Environment variables set
- [ ] SSL certificates valid
- [ ] CDN cache cleared
- [ ] Support team notified
- [ ] Announcement scheduled

---

## 📞 Support Plan

### Expected User Questions

**Q: Will my local recipes be deleted?**
A: No! Local recipes remain in your browser. Migration creates a copy in the cloud.

**Q: Do I have to create an account?**
A: Not immediately. The calculator works without an account, but we recommend it for backup.

**Q: What if I lose my recipes during migration?**
A: We never delete local data automatically. Your recipes stay in your browser until you choose to remove them.

**Q: Can I use the app offline?**
A: Yes! The calculator works offline. Cloud sync happens when you're online.

---

## 🎉 Success Story Template

After successful migration:

```
✅ Migration Complete!

Results:
- 15,000 users migrated
- 45,000 recipes backed up to cloud
- Zero data loss incidents
- 98% user satisfaction
- 2x recipe creation rate

Key Learnings:
- Dual-mode storage was crucial
- Migration tool UX very important
- Feature flags enabled safe rollout
- User communication prevented confusion
```

---

## 📚 Related Documentation

- `SUPABASE_DATABASE_SCHEMA.md` - Database design
- `SUPABASE_IMPLEMENTATION_PLAN.md` - Implementation steps
- `DATABASE_SUMMARY.md` - Quick reference
- `DATABASE_ERD.md` - Visual diagrams

---

**Status:** ✅ Migration Strategy Documented  
**Recommendation:** Start with Phase 1 infrastructure setup  
**Risk Level:** Low (with phased approach)  
**Expected Success:** High (>95% based on dual-mode design)
