# Supabase Database - Quick Reference
## Soap Calculator Database Tables Summary

**Last Updated:** November 9, 2025

---

## 📊 Tables Overview

### Core Tables (12 total)

| # | Table Name | Purpose | Records Expected |
|---|------------|---------|------------------|
| 1 | `profiles` | User accounts & preferences | 1 per user |
| 2 | `recipes` | Soap formulation recipes | Many per user |
| 3 | `recipe_oils` | Normalized oil selections | 3-8 per recipe |
| 4 | `custom_oils` | User-created oils | 0-20 per user |
| 5 | `collections` | Recipe organization | 0-10 per user |
| 6 | `collection_recipes` | Many-to-many junction | Many |
| 7 | `saved_recipes` | Bookmarked recipes | Many per user |
| 8 | `recipe_ratings` | Ratings & reviews | 1 per user per recipe |
| 9 | `recipe_comments` | Discussion threads | Many |
| 10 | `recipe_forks` | Fork tracking | 1 per fork |
| 11 | `activity_log` | User activity tracking | Many |
| 12 | `app_settings` | Global settings | ~10 settings |

---

## 🔑 Key Relationships

```
User (profiles)
  ↓
  ├─ Creates → Recipes
  │             ↓
  │             ├─ Contains → Recipe Oils
  │             ├─ Receives → Ratings
  │             ├─ Receives → Comments
  │             └─ Can be → Forked
  │
  ├─ Creates → Custom Oils
  ├─ Creates → Collections
  │             ↓
  │             └─ Contains → Recipes (via junction)
  │
  └─ Saves → Recipes (bookmarks)
```

---

## 📋 Table Details

### 1️⃣ profiles
**Purpose:** User accounts and preferences  
**Key Fields:**
- `id` (UUID) - Matches auth.users.id
- `email`, `username`, `full_name`
- `default_unit`, `default_soap_type`, `default_superfat`
- `profile_public`, `show_email`

**Relationships:**
- 1:Many with recipes
- 1:Many with custom_oils
- 1:Many with collections

---

### 2️⃣ recipes
**Purpose:** Complete soap formulations  
**Key Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Recipe owner
- `name`, `description`, `notes`
- `inputs` (JSONB) - Recipe settings
- `selected_oils` (JSONB) - Oil selections
- `calculated_results` (JSONB) - Cached calculations
- `is_public`, `is_featured`
- `rating_avg`, `rating_count`, `save_count`, `view_count`

**JSONB Structures:**
```typescript
// inputs
{
  totalOilWeight: 500,
  unit: "g",
  soapType: "hard",
  lyeType: "NaOH",
  superfatPercentage: 5,
  waterMethod: "water_as_percent_of_oils",
  waterValue: 38,
  fragranceWeight: 0
}

// selected_oils
[
  {
    id: "coconut-oil-76",
    name: "Coconut Oil, 76 deg",
    percentage: 25,
    weight: 125,
    // ... (full oil data)
  }
]

// calculated_results
{
  lyeWeight: 67.5,
  waterWeight: 190,
  qualities: { hardness: 42, ... },
  fattyAcids: { lauric: 12, ... }
}
```

**Indexes:**
- user_id, is_public, tags (GIN), created_at, rating_avg

---

### 3️⃣ recipe_oils
**Purpose:** Normalized oil selections (alternative to JSONB)  
**Key Fields:**
- `recipe_id`, `oil_id`
- `oil_name`, `percentage`, `weight`
- `fatty_acids` (JSONB snapshot)
- `sap_naoh`, `sap_koh`

**Why?** Better for querying "which recipes use coconut oil?"

---

### 4️⃣ custom_oils
**Purpose:** User-defined oils  
**Key Fields:**
- `user_id`, `oil_id`, `name`
- `sap_naoh`, `sap_koh`
- `fatty_acids` (JSONB)
- `iodine`, `ins`, `category`
- `is_public`, `is_verified`

**Note:** System oils seeded here with `is_verified = true`

---

### 5️⃣ collections
**Purpose:** Organize recipes into folders  
**Key Fields:**
- `user_id`, `name`, `description`
- `color`, `icon`
- `is_public`

**Example:** "Summer Soaps", "Gift Ideas", "Face Bars"

---

### 6️⃣ collection_recipes
**Purpose:** Many-to-many junction  
**Key Fields:**
- `collection_id`, `recipe_id`
- `position` (for ordering)

---

### 7️⃣ saved_recipes
**Purpose:** User bookmarks  
**Key Fields:**
- `user_id`, `recipe_id`
- `notes` (personal notes about the recipe)

---

### 8️⃣ recipe_ratings
**Purpose:** Ratings and reviews  
**Key Fields:**
- `recipe_id`, `user_id`
- `rating` (1-5 stars)
- `review` (text)
- `helpful_count`

**Trigger:** Updates recipe.rating_avg automatically

---

### 9️⃣ recipe_comments
**Purpose:** Threaded discussions  
**Key Fields:**
- `recipe_id`, `user_id`
- `parent_comment_id` (for threading)
- `content`
- `is_edited`, `is_deleted`

---

### 🔟 recipe_forks
**Purpose:** Track when users copy/modify recipes  
**Key Fields:**
- `original_recipe_id`, `forked_recipe_id`
- `user_id`, `changes_description`

---

### 1️⃣1️⃣ activity_log
**Purpose:** Track user actions  
**Key Fields:**
- `user_id`, `activity_type`, `entity_type`, `entity_id`
- `metadata` (JSONB)

**Activity Types:**
- recipe_created, recipe_published, recipe_saved
- recipe_rated, comment_posted, recipe_forked

---

### 1️⃣2️⃣ app_settings
**Purpose:** Global application settings  
**Key Fields:**
- `key` (PRIMARY KEY), `value` (JSONB)
- `description`, `updated_by`

**Example Settings:**
```sql
INSERT INTO app_settings VALUES
  ('featured_recipes', '["uuid1", "uuid2"]', 'Featured recipe IDs'),
  ('hard_soap_quality_ranges', '{...}', 'Quality ranges for bar soap'),
  ('liquid_soap_quality_ranges', '{...}', 'Quality ranges for liquid soap');
```

---

## 🔒 Security (RLS Policies)

### profiles
- ✅ Users read/update own profile
- ✅ Anyone reads public profiles

### recipes
- ✅ Users CRUD own recipes
- ✅ Anyone reads public recipes

### custom_oils
- ✅ Users CRUD own custom oils
- ✅ Anyone reads public verified oils

### collections
- ✅ Users CRUD own collections
- ✅ Anyone reads public collections

### saved_recipes, ratings, comments
- ✅ Users manage own entries
- ✅ Public read access where appropriate

---

## ⚡ Performance Optimizations

### Indexes Created
```sql
-- Recipe search
CREATE INDEX idx_recipes_search ON recipes 
  USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Tag filtering
CREATE INDEX idx_recipes_tags_gin ON recipes USING GIN(tags);

-- Public recipes
CREATE INDEX idx_recipes_public_featured ON recipes(is_featured, created_at DESC) 
  WHERE is_public = true AND deleted_at IS NULL;

-- User recipes
CREATE INDEX idx_recipes_user_created ON recipes(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Popular recipes
CREATE INDEX idx_recipes_popular ON recipes(save_count DESC, rating_avg DESC)
  WHERE is_public = true AND deleted_at IS NULL;
```

### Triggers
- `update_updated_at` - Auto-update timestamps
- `update_recipe_rating_avg` - Recalculate averages
- `increment_save_count` - Track saves
- `log_recipe_activity` - Activity logging
- `handle_new_user` - Create profile on signup

---

## 📦 Storage Buckets

| Bucket | Purpose | Access | Size Limit |
|--------|---------|--------|------------|
| `avatars` | User profile pictures | Public read | 2 MB |
| `recipe-images` | Recipe photos | Public/Private | 5 MB |

---

## 🚀 Implementation Phases

### Phase 1: Core Setup (Critical)
1. Create Supabase project
2. Set up tables and RLS
3. Implement authentication

### Phase 2: Basic Features (High Priority)
4. User profiles
5. Recipe CRUD
6. Recipe list/detail views

### Phase 3: Social Features (Medium Priority)
7. Public discovery
8. Ratings & reviews
9. Comments
10. Collections

### Phase 4: Advanced (Nice-to-Have)
11. Custom oils
12. Recipe forking
13. Activity feed
14. Analytics

---

## 📈 Estimated Database Size

**Small App (1,000 users):**
- Profiles: ~500 KB
- Recipes: ~50 MB (50 recipes/user avg)
- Comments/Ratings: ~10 MB
- **Total:** ~60 MB ✅ Free tier

**Medium App (10,000 users):**
- Profiles: ~5 MB
- Recipes: ~500 MB
- Comments/Ratings: ~100 MB
- **Total:** ~600 MB (need Pro tier)

**Large App (100,000+ users):**
- Need dedicated resources
- Consider caching, CDN
- Optimize JSONB storage

---

## 🛠️ Common Queries

### Get User's Recipes
```sql
SELECT * FROM recipes
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;
```

### Get Public Recipes
```sql
SELECT r.*, p.username, p.avatar_url
FROM recipes r
JOIN profiles p ON r.user_id = p.id
WHERE r.is_public = true AND r.deleted_at IS NULL
ORDER BY r.created_at DESC
LIMIT 20 OFFSET $1;
```

### Search Recipes
```sql
SELECT * FROM recipes
WHERE is_public = true
  AND deleted_at IS NULL
  AND to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', $1)
ORDER BY rating_avg DESC NULLS LAST;
```

### Get Recipe with Details
```sql
SELECT 
  r.*,
  p.username,
  p.avatar_url,
  COUNT(DISTINCT rr.id) as rating_count,
  AVG(rr.rating) as avg_rating,
  COUNT(DISTINCT rc.id) as comment_count
FROM recipes r
JOIN profiles p ON r.user_id = p.id
LEFT JOIN recipe_ratings rr ON r.id = rr.recipe_id
LEFT JOIN recipe_comments rc ON r.id = rc.recipe_id
WHERE r.id = $1
GROUP BY r.id, p.username, p.avatar_url;
```

### Get Popular Oils
```sql
SELECT oil_id, COUNT(*) as usage_count
FROM recipe_oils
GROUP BY oil_id
ORDER BY usage_count DESC
LIMIT 10;
```

---

## 📝 Migration Checklist

- [ ] Supabase project created
- [ ] Environment variables set
- [ ] All 12 tables created
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Triggers created
- [ ] System oils seeded
- [ ] Default settings seeded
- [ ] TypeScript types generated
- [ ] Client/server utilities created
- [ ] Authentication working
- [ ] First recipe saved successfully

---

## 📚 Documentation Files

1. **SUPABASE_DATABASE_SCHEMA.md** - Complete schema with SQL
2. **SUPABASE_IMPLEMENTATION_PLAN.md** - Step-by-step guide
3. **DATABASE_SUMMARY.md** - This quick reference

---

## 🆘 Troubleshooting

### Common Issues

**RLS blocking queries:**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'recipes';

-- Test as specific user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';
```

**Performance slow:**
- Check missing indexes: `EXPLAIN ANALYZE SELECT ...`
- Review query plans
- Consider materialized views

**Authentication issues:**
- Verify JWT settings
- Check redirect URLs
- Review Supabase logs

---

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **Discord:** Supabase community
- **GitHub Issues:** For bugs
- **Stack Overflow:** Tag `supabase`

---

**Status:** ✅ Schema Designed & Documented  
**Next Step:** Begin Phase 1 of Implementation Plan  
**Estimated Work:** 3-4 weeks for full implementation
