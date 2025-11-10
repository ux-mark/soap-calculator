# Database Entity Relationship Diagram
## Soap Calculator - Visual Database Schema

**Last Updated:** November 9, 2025

---

## 📊 Complete ERD (Text Format)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SOAP CALCULATOR DATABASE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   auth.users         │  (Supabase Auth - managed)
│──────────────────────│
│ • id (UUID) PK       │
│   email              │
│   encrypted_password │
│   created_at         │
└──────────────────────┘
          │
          │ 1:1 (on signup trigger)
          ↓
┌──────────────────────┐
│   profiles           │  User Profiles & Preferences
│──────────────────────│
│ • id (UUID) PK       │  ← References auth.users.id
│   email              │
│   username           │
│   full_name          │
│   avatar_url         │
│   bio                │
│   website            │
│                      │
│   Preferences:       │
│   default_unit       │  'g' | 'oz' | 'lb'
│   default_soap_type  │  'hard' | 'liquid'
│   default_superfat   │  0-20
│                      │
│   profile_public     │
│   show_email         │
│   created_at         │
│   updated_at         │
└──────────────────────┘
          │
          ├──────────────────────────────────────────────────────────┐
          │                                                           │
          │ 1:Many                                                    │ 1:Many
          ↓                                                           ↓
┌──────────────────────┐                                   ┌──────────────────────┐
│   recipes            │  Soap Formulations                │   custom_oils        │
│──────────────────────│                                   │──────────────────────│
│ • id (UUID) PK       │                                   │ • id (UUID) PK       │
│   user_id FK ────────┼───────────────────────────────────┤   user_id FK         │
│                      │                                   │                      │
│   name               │                                   │   oil_id             │
│   description        │                                   │   name               │
│   notes              │                                   │                      │
│                      │                                   │   sap_naoh           │
│   inputs (JSONB)     │  Recipe settings                  │   sap_koh            │
│   selected_oils      │  Array of oils                    │   fatty_acids (JSON) │
│   calculated_results │  Cached calcs                     │   iodine             │
│                      │                                   │   ins                │
│   tags []            │                                   │   category           │
│   category           │                                   │   source             │
│   difficulty_level   │                                   │   notes              │
│                      │                                   │                      │
│   is_public          │                                   │   is_public          │
│   is_featured        │                                   │   is_verified        │
│   allow_comments     │                                   │   verified_by FK     │
│                      │                                   │   verified_at        │
│   version            │                                   │                      │
│   parent_recipe_id   │  Self-reference for versions      │   created_at         │
│   is_latest_version  │                                   │   updated_at         │
│                      │                                   └──────────────────────┘
│   view_count         │
│   save_count         │
│   rating_avg         │  Auto-calculated
│   rating_count       │  Auto-calculated
│                      │
│   created_at         │
│   updated_at         │
│   published_at       │
│   deleted_at         │  Soft delete
└──────────────────────┘
          │
          ├─────────────────────────────────────────────────────────────┐
          │                                                              │
          │ 1:Many                                                       │ 1:Many
          ↓                                                              ↓
┌──────────────────────┐                                      ┌──────────────────────┐
│   recipe_oils        │  Normalized Oil Selections           │   recipe_ratings     │
│──────────────────────│  (Alternative to JSONB)              │──────────────────────│
│ • id (UUID) PK       │                                      │ • id (UUID) PK       │
│   recipe_id FK       │                                      │   recipe_id FK       │
│   oil_id             │  References oil database             │   user_id FK         │
│                      │                                      │                      │
│   oil_name           │  Snapshot at creation                │   rating (1-5)       │
│   percentage         │                                      │   review             │
│   weight             │                                      │   helpful_count      │
│                      │                                      │                      │
│   fatty_acids (JSON) │  Snapshot                            │   created_at         │
│   sap_naoh           │  Snapshot                            │   updated_at         │
│   sap_koh            │  Snapshot                            │                      │
│                      │                                      │ UNIQUE (user, recipe)│
│   created_at         │                                      └──────────────────────┘
└──────────────────────┘                                                 │
                                                                         │ TRIGGER
                                                                         ↓
                                                               Updates recipe.rating_avg
                                                                         & rating_count

          ┌────────────────────────────────────────────────────────────┐
          │                                                             │
          │ 1:Many                                                      │ 1:Many
          ↓                                                             ↓
┌──────────────────────┐                                      ┌──────────────────────┐
│   recipe_comments    │  Discussion Threads                  │   recipe_forks       │
│──────────────────────│                                      │──────────────────────│
│ • id (UUID) PK       │                                      │ • id (UUID) PK       │
│   recipe_id FK       │                                      │   original_recipe FK │
│   user_id FK         │                                      │   forked_recipe FK   │
│   parent_comment_id  │  Self-reference for threading        │   user_id FK         │
│                      │                                      │                      │
│   content            │                                      │   changes_desc       │
│   is_edited          │                                      │   created_at         │
│   is_deleted         │                                      │                      │
│                      │                                      │ UNIQUE (forked_id)   │
│   created_at         │                                      └──────────────────────┘
│   updated_at         │
└──────────────────────┘


┌──────────────────────┐                    ┌──────────────────────┐
│   collections        │  Recipe Folders    │   saved_recipes      │  User Bookmarks
│──────────────────────│                    │──────────────────────│
│ • id (UUID) PK       │                    │ • id (UUID) PK       │
│   user_id FK ────────┼─────────┐          │   user_id FK ────────┼─────────┐
│                      │         │          │   recipe_id FK       │         │
│   name               │         │          │                      │         │
│   description        │         │          │   notes              │  Personal notes
│   color              │         │          │   created_at         │         │
│   icon               │         │          │                      │         │
│   is_public          │         │          │ UNIQUE (user,recipe) │         │
│                      │         │          └──────────────────────┘         │
│   created_at         │         │                    ↑                      │
│   updated_at         │         │                    │ Many:Many            │
│                      │         │                    │                      │
│ UNIQUE (user, name)  │         │          ┌─────────┴──────────┐           │
└──────────────────────┘         │          │                    │           │
          │                      │          │    Back to         │           │
          │ Many:Many            │          │    profiles        │           │
          ↓                      │          │                    │           │
┌──────────────────────┐         │          └────────────────────┘           │
│ collection_recipes   │  Junction Table                                     │
│──────────────────────│         │                                           │
│ • id (UUID) PK       │         │                                           │
│   collection_id FK   │         │                                           │
│   recipe_id FK       │         │                                           │
│   position           │  For ordering                                       │
│   added_at           │         │                                           │
│                      │         │                                           │
│ UNIQUE (coll, recipe)│         │                                           │
└──────────────────────┘         │                                           │
                                 │                                           │
                                 ↓                                           ↓
                      ┌──────────────────────┐                  All reference
                      │   activity_log       │  User Actions    back to profiles
                      │──────────────────────│
                      │ • id (UUID) PK       │
                      │   user_id FK         │
                      │                      │
                      │   activity_type      │  'recipe_created', etc.
                      │   entity_type        │  'recipe', 'comment', etc.
                      │   entity_id          │  UUID of entity
                      │   metadata (JSONB)   │  Additional context
                      │                      │
                      │   created_at         │
                      └──────────────────────┘


┌──────────────────────┐
│   app_settings       │  Global Configuration
│──────────────────────│
│ • key (TEXT) PK      │  e.g., 'featured_recipes'
│   value (JSONB)      │  Flexible JSON storage
│   description        │
│   updated_at         │
│   updated_by FK      │  References profiles.id
└──────────────────────┘
```

---

## 🔑 Key Relationship Summary

### User-Centric View
```
USER (profiles)
  │
  ├─ CREATES ──→ Recipes (1:Many)
  │                │
  │                ├─ CONTAINS ──→ Recipe Oils (1:Many)
  │                ├─ RECEIVES ──→ Ratings (1:Many)
  │                ├─ RECEIVES ──→ Comments (1:Many)
  │                └─ CAN BE ──→ Forked (1:Many)
  │
  ├─ CREATES ──→ Custom Oils (1:Many)
  │
  ├─ CREATES ──→ Collections (1:Many)
  │                │
  │                └─ CONTAINS ──→ Recipes (Many:Many via junction)
  │
  ├─ SAVES ──→ Recipes (Many:Many via saved_recipes)
  │
  ├─ RATES ──→ Recipes (Many:Many via recipe_ratings)
  │
  ├─ COMMENTS ON ──→ Recipes (1:Many via recipe_comments)
  │
  └─ GENERATES ──→ Activity Log (1:Many)
```

---

## 📐 Cardinality Diagram

```
┌─────────────┐
│  profiles   │
└──────┬──────┘
       │
       ├─── 1:Many ───→ recipes
       ├─── 1:Many ───→ custom_oils
       ├─── 1:Many ───→ collections
       ├─── 1:Many ───→ saved_recipes
       ├─── 1:Many ───→ recipe_ratings
       ├─── 1:Many ───→ recipe_comments
       ├─── 1:Many ───→ recipe_forks
       └─── 1:Many ───→ activity_log

┌─────────────┐
│   recipes   │
└──────┬──────┘
       │
       ├─── 1:Many ───→ recipe_oils
       ├─── 1:Many ───→ recipe_ratings
       ├─── 1:Many ───→ recipe_comments
       ├─── 1:Many ───→ recipe_forks (as original)
       ├─── 1:1    ───→ recipe_forks (as forked)
       ├─── 1:Many ───→ saved_recipes
       ├─── Many:Many → collections (via collection_recipes)
       └─── 1:1    ───→ recipes (self, parent_recipe_id for versions)
```

---

## 🎨 Data Flow Diagram

### Recipe Creation Flow
```
1. User logs in
   └→ profiles table

2. User selects oils in calculator
   └→ Client-side state (CalculatorContext)

3. User clicks "Save Recipe"
   ├→ INSERT into recipes table
   │   ├─ inputs (JSONB)
   │   ├─ selected_oils (JSONB)
   │   └─ calculated_results (JSONB)
   │
   └→ OPTIONAL: INSERT into recipe_oils (normalized)
       └─ One row per oil

4. Trigger fires
   └→ INSERT into activity_log
       └─ activity_type: 'recipe_created'

5. User publishes recipe
   ├→ UPDATE recipes SET is_public = true
   │
   └→ Trigger fires
       └→ INSERT into activity_log
           └─ activity_type: 'recipe_published'
```

### Recipe Discovery Flow
```
1. User visits /discover
   └→ SELECT from recipes WHERE is_public = true

2. User clicks recipe
   └→ SELECT recipe with JOIN to profiles
       ├─ Recipe data
       ├─ Author info
       ├─ Rating average
       └─ Comment count

3. User rates recipe
   ├→ INSERT into recipe_ratings
   │
   └→ Trigger fires
       ├→ UPDATE recipes.rating_avg (recalculated)
       ├→ UPDATE recipes.rating_count (incremented)
       └→ INSERT into activity_log

4. User saves recipe to collection
   ├→ INSERT into saved_recipes
   │   └→ Trigger: INCREMENT recipes.save_count
   │
   └→ INSERT into collection_recipes
       └─ Links recipe to collection

5. User forks recipe
   ├→ INSERT into recipes (new recipe)
   │   └─ Copies inputs, oils from original
   │
   └→ INSERT into recipe_forks
       ├─ original_recipe_id
       └─ forked_recipe_id
```

---

## 🔐 Security Layers

### Row Level Security (RLS) Flow

```
┌─────────────────────────────────────────────┐
│  User Request (with JWT)                    │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Supabase Middleware                        │
│  - Validates JWT                            │
│  - Sets auth.uid()                          │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  PostgreSQL with RLS                        │
│                                             │
│  Example: SELECT * FROM recipes             │
│           WHERE id = $1                     │
│                                             │
│  RLS Policy Applied:                        │
│  - IF recipe.user_id = auth.uid()           │
│    THEN allow (user's own recipe)           │
│  - ELSE IF recipe.is_public = true          │
│    THEN allow (public recipe)               │
│  - ELSE deny                                │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Return Filtered Results                    │
│  (Only recipes user can access)             │
└─────────────────────────────────────────────┘
```

---

## 📦 Storage Architecture

```
┌─────────────────────────────────────────────┐
│           Supabase Storage                  │
├─────────────────────────────────────────────┤
│                                             │
│  avatars/                                   │
│  ├─ {user_id}/                              │
│  │   └─ avatar.jpg (max 2MB)                │
│  │                                          │
│  └─ [RLS: Public read, User write]          │
│                                             │
│  recipe-images/                             │
│  ├─ {recipe_id}/                            │
│  │   ├─ main.jpg                            │
│  │   ├─ step1.jpg                           │
│  │   └─ step2.jpg (max 5MB each)            │
│  │                                          │
│  └─ [RLS: Public if recipe public]          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔄 Trigger Cascade

### Example: User Rates a Recipe

```
1. INSERT into recipe_ratings
   └─ rating = 5, review = "Great recipe!"

2. TRIGGER: update_recipe_rating_avg()
   ├─ Calculates: AVG(rating) for this recipe
   ├─ Calculates: COUNT(*) for this recipe
   └─ UPDATES recipes table
       ├─ rating_avg = 4.7
       └─ rating_count = 23

3. TRIGGER: log_recipe_activity()
   └─ INSERTS into activity_log
       ├─ user_id = rater
       ├─ activity_type = 'recipe_rated'
       ├─ entity_id = recipe_id
       └─ metadata = {"rating": 5}

4. Client receives success response
   └─ UI updates in real-time (if using subscriptions)
```

---

## 📊 Index Strategy Visualization

### Recipe Search Performance

```
Without Index:
┌──────────────────────────────────┐
│ recipes table (100,000 rows)     │
│ Sequential Scan                  │
│ → Read ALL rows                  │
│ → Filter WHERE is_public = true  │
│ → Time: ~500ms                   │
└──────────────────────────────────┘

With Index:
┌──────────────────────────────────┐
│ idx_recipes_public_featured      │
│ B-tree index                     │
│ → Direct lookup                  │
│ → Only matching rows             │
│ → Time: ~5ms                     │
└──────────────────────────────────┘
```

### Full-Text Search

```
Without GIN Index:
┌──────────────────────────────────┐
│ ILIKE '%coconut%'                │
│ → Sequential scan                │
│ → Pattern matching on each row   │
│ → Time: ~800ms                   │
└──────────────────────────────────┘

With GIN Index:
┌──────────────────────────────────┐
│ idx_recipes_search (GIN)         │
│ → tsvector index                 │
│ → Indexed word lookup            │
│ → Time: ~10ms                    │
└──────────────────────────────────┘
```

---

## 🎯 Query Optimization Patterns

### Anti-Pattern ❌
```typescript
// N+1 Query Problem
const recipes = await supabase.from('recipes').select('*')

for (const recipe of recipes.data) {
  // Separate query for each recipe!
  const { data: author } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', recipe.user_id)
    .single()
}
// Total queries: 1 + N (very slow!)
```

### Optimized ✅
```typescript
// Single query with JOIN
const { data: recipes } = await supabase
  .from('recipes')
  .select(`
    *,
    profiles (
      username,
      avatar_url
    )
  `)
// Total queries: 1 (fast!)
```

---

## 💾 Database Size Estimation

### Per-User Average

```
Profile:              ~1 KB
├─ Basic info:        500 bytes
├─ Preferences:       200 bytes
└─ Metadata:          300 bytes

Recipe (each):        ~5 KB
├─ Basic fields:      1 KB
├─ inputs (JSONB):    1 KB
├─ selected_oils:     2 KB (5-8 oils)
└─ results (JSONB):   1 KB

Collection (each):    ~500 bytes
Comment (each):       ~1 KB
Rating (each):        ~500 bytes
Activity log (each):  ~300 bytes

Custom Oil (each):    ~2 KB
```

### Scaling Projections

```
1,000 Users:
├─ Profiles:          1 MB
├─ Recipes (50 each): 250 MB
├─ Ratings/Comments:  50 MB
└─ TOTAL:            ~300 MB ✅ Free tier

10,000 Users:
├─ Profiles:          10 MB
├─ Recipes:           2.5 GB
├─ Social:            500 MB
└─ TOTAL:            ~3 GB (need Pro tier)

100,000 Users:
├─ Profiles:          100 MB
├─ Recipes:           25 GB
├─ Social:            5 GB
└─ TOTAL:            ~30 GB (need dedicated)
```

---

## 🚀 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Recipe List Load | < 200ms | With pagination |
| Recipe Detail Load | < 150ms | Single recipe |
| Recipe Save | < 300ms | Including calculations |
| Search Results | < 500ms | Full-text search |
| User Profile | < 100ms | Cached frequently |
| Comment Post | < 200ms | With RLS check |

---

## 📚 Related Documentation

- `SUPABASE_DATABASE_SCHEMA.md` - Complete SQL schema
- `SUPABASE_IMPLEMENTATION_PLAN.md` - Step-by-step guide
- `DATABASE_SUMMARY.md` - Quick reference

---

**Status:** ✅ Schema Designed & Visualized  
**Next:** Implement Phase 1 of the plan
