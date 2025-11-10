# Supabase Database Schema Documentation
## Soap Calculator Database Design

**Last Updated:** November 9, 2025  
**Status:** Design Phase  
**Database:** PostgreSQL (via Supabase)

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Database Tables](#database-tables)
3. [Seed Data](#seed-data---initial-database-population)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Row Level Security (RLS)](#row-level-security)
7. [Functions & Triggers](#functions--triggers)
8. [Storage Buckets](#storage-buckets)

---

## Overview

### Purpose
This database will support the Soap Calculator application with the following capabilities:
- **Base oil database** with 157 pre-defined oils (from [`OIL_DATABASE.md`](./OIL_DATABASE.md))
- User authentication and profiles
- Recipe creation, storage, and management
- Recipe sharing and collaboration
- Custom oil database entries
- Recipe collections/folders
- Activity tracking and analytics

### Database Provider
**Supabase** - Built on PostgreSQL with real-time subscriptions, authentication, and storage

### Database Structure
- **13 core tables** (including base oils table)
- **157 pre-seeded oils** from [`OIL_DATABASE.md`](./OIL_DATABASE.md)
- Row Level Security (RLS) on all tables
- Real-time subscriptions enabled
- 2 storage buckets for media

### Key Features Required
- Multi-user support
- Complete oil database (157 oils)
- Recipe versioning
- Public/private recipes
- Recipe ratings and comments
- Custom oil management
- Export/import functionality

---

## Database Tables

### Critical: Base Oil Database

**Before creating any other tables**, the oils table must be populated with the complete database of 157 pre-defined oils.

**Data Source:** All oil data comes from [`OIL_DATABASE.md`](./OIL_DATABASE.md)

This is **reference data** that will be seeded during initial database setup. See Section 2.5 for seeding instructions.

---

### 1. `oils` - Base Oil Database
**Purpose:** Store the complete database of 157 pre-defined oils with SAP values and fatty acid profiles.

**Data Source:** [`OIL_DATABASE.md`](./OIL_DATABASE.md) - Complete oil database with all 157 oils

**Important:** This table contains **reference data** and should be populated during initial database setup.

```sql
CREATE TABLE oils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Oil identification
  name TEXT NOT NULL UNIQUE,
  
  -- Chemical properties
  sap NUMERIC(6,4) NOT NULL, -- Saponification value (NaOH)
  iodine INTEGER NOT NULL,   -- Iodine value
  ins INTEGER NOT NULL,      -- INS value
  
  -- Fatty acid profile (percentages)
  lauric INTEGER NOT NULL DEFAULT 0,
  myristic INTEGER NOT NULL DEFAULT 0,
  palmitic INTEGER NOT NULL DEFAULT 0,
  stearic INTEGER NOT NULL DEFAULT 0,
  ricinoleic INTEGER NOT NULL DEFAULT 0,
  oleic INTEGER NOT NULL DEFAULT 0,
  linoleic INTEGER NOT NULL DEFAULT 0,
  linolenic INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_sap CHECK (sap > 0 AND sap <= 1),
  CONSTRAINT valid_iodine CHECK (iodine >= 0),
  CONSTRAINT valid_ins CHECK (ins >= -10 AND ins <= 350),
  CONSTRAINT valid_fatty_acids CHECK (
    lauric >= 0 AND lauric <= 100 AND
    myristic >= 0 AND myristic <= 100 AND
    palmitic >= 0 AND palmitic <= 100 AND
    stearic >= 0 AND stearic <= 100 AND
    ricinoleic >= 0 AND ricinoleic <= 100 AND
    oleic >= 0 AND oleic <= 100 AND
    linoleic >= 0 AND linoleic <= 100 AND
    linolenic >= 0 AND linolenic <= 100
  )
);
```

**Indexes:**
- `idx_oils_name` on `name` (B-tree)
- `idx_oils_sap` on `sap` (B-tree)
- `idx_oils_ins` on `ins` (B-tree)
- `idx_oils_active` on `is_active WHERE is_active = true` (Partial)

**RLS Policies:**
```sql
-- Enable RLS
ALTER TABLE oils ENABLE ROW LEVEL SECURITY;

-- Anyone can read oils (public reference data)
CREATE POLICY "anyone_can_read_oils" ON oils
  FOR SELECT USING (true);

-- Only service role can modify (admin only)
CREATE POLICY "service_role_can_modify_oils" ON oils
  FOR ALL USING (auth.role() = 'service_role');
```

**Usage Examples:**
```typescript
// Fetch all active oils
const { data: oils } = await supabase
  .from('oils')
  .select('*')
  .eq('is_active', true)
  .order('name');

// Search oils by name
const { data: filtered } = await supabase
  .from('oils')
  .select('*')
  .ilike('name', '%coconut%');

// Get high-cleansing oils (lauric + myristic > 40)
const { data: cleansing } = await supabase
  .from('oils')
  .select('*')
  .gt('lauric + myristic', 40);
```

**Data Seeding:**
See Section 2.5 below for complete seeding instructions from [`OIL_DATABASE.md`](./OIL_DATABASE.md).

---

### 2. `profiles` - User Profiles
Stores user account information and preferences.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  
  -- Preferences
  default_unit TEXT DEFAULT 'g' CHECK (default_unit IN ('g', 'oz', 'lb')),
  default_soap_type TEXT DEFAULT 'hard' CHECK (default_soap_type IN ('hard', 'liquid')),
  default_superfat NUMERIC DEFAULT 5 CHECK (default_superfat >= 0 AND default_superfat <= 20),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Privacy settings
  profile_public BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false
);
```

**Indexes:**
- `idx_profiles_username` on `username`
- `idx_profiles_email` on `email`

**RLS Policies:**
- Users can read their own profile
- Users can update their own profile
- Public profiles viewable by anyone

---

### 3. `recipes` - Soap Recipes
Stores complete soap formulation recipes.

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  
  -- Recipe Inputs (stored as JSONB for flexibility)
  inputs JSONB NOT NULL DEFAULT '{
    "totalOilWeight": 500,
    "unit": "g",
    "soapType": "hard",
    "lyeType": "NaOH",
    "superfatPercentage": 5,
    "waterMethod": "water_as_percent_of_oils",
    "waterValue": 38,
    "fragranceWeight": 0
  }',
  
  -- Selected Oils (array of oil objects with percentages)
  selected_oils JSONB NOT NULL DEFAULT '[]',
  
  -- Calculated Results (cached for performance)
  calculated_results JSONB,
  
  -- Categorization
  tags TEXT[] DEFAULT '{}',
  category TEXT, -- e.g., "Face", "Body", "Shampoo", "Liquid"
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Sharing & Visibility
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  
  -- Version Control
  version INTEGER DEFAULT 1,
  parent_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  is_latest_version BOOLEAN DEFAULT true,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2),
  rating_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Soft Delete
  deleted_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_recipes_user_id` on `user_id`
- `idx_recipes_is_public` on `is_public WHERE deleted_at IS NULL`
- `idx_recipes_tags` on `tags USING GIN`
- `idx_recipes_created_at` on `created_at DESC`
- `idx_recipes_rating` on `rating_avg DESC WHERE is_public = true`
- `idx_recipes_parent` on `parent_recipe_id`

**RLS Policies:**
- Users can CRUD their own recipes
- Anyone can read public recipes
- Only admins can set `is_featured`

---

### 4. `recipe_oils` - Normalized Oil Selection
Alternative/complementary to storing oils in JSONB - provides better querying.

```sql
CREATE TABLE recipe_oils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  oil_id UUID REFERENCES oils(id) NOT NULL, -- References base oils table
  
  -- Oil details at time of recipe creation (snapshot)
  oil_name TEXT NOT NULL,
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  weight NUMERIC(10,2),
  
  -- Fatty acid snapshot (at time of creation)
  fatty_acids JSONB,
  sap_naoh NUMERIC(6,4),
  sap_koh NUMERIC(6,4),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_recipe_oils_recipe_id` on `recipe_id`
- `idx_recipe_oils_oil_id` on `oil_id`

**RLS Policies:**
- Inherits from parent recipe

---

### 5. `custom_oils` - User Custom Oils
Allows users to add their own oil data.

```sql
CREATE TABLE custom_oils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Oil Properties
  oil_id TEXT UNIQUE NOT NULL, -- e.g., "custom-my-special-oil-123"
  name TEXT NOT NULL,
  
  -- SAP Values
  sap_naoh NUMERIC(6,4) NOT NULL,
  sap_koh NUMERIC(6,4) NOT NULL,
  
  -- Fatty Acid Profile
  fatty_acids JSONB NOT NULL DEFAULT '{
    "lauric": 0,
    "myristic": 0,
    "palmitic": 0,
    "stearic": 0,
    "ricinoleic": 0,
    "oleic": 0,
    "linoleic": 0,
    "linolenic": 0
  }',
  
  -- Additional Properties
  iodine NUMERIC(5,2) NOT NULL,
  ins NUMERIC(5,2) NOT NULL,
  category TEXT,
  
  -- Source & Notes
  source TEXT, -- Where data came from
  notes TEXT,
  
  -- Visibility
  is_public BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validation
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_custom_oils_user_id` on `user_id`
- `idx_custom_oils_oil_id` on `oil_id`
- `idx_custom_oils_public` on `is_public WHERE is_verified = true`

**RLS Policies:**
- Users can CRUD their own custom oils
- Anyone can read public verified custom oils

---

### 6. `collections` - Recipe Collections/Folders
Organize recipes into collections.

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for UI
  icon TEXT, -- Icon name/emoji
  
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_collection_name UNIQUE (user_id, name)
);
```

**Indexes:**
- `idx_collections_user_id` on `user_id`

---

### 7. `collection_recipes` - Many-to-Many Junction
Links recipes to collections.

```sql
CREATE TABLE collection_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  
  position INTEGER, -- For manual ordering
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_collection_recipe UNIQUE (collection_id, recipe_id)
);
```

**Indexes:**
- `idx_collection_recipes_collection` on `collection_id`
- `idx_collection_recipes_recipe` on `recipe_id`

---

### 8. `saved_recipes` - User Saved/Bookmarked Recipes
Users can save others' public recipes.

```sql
CREATE TABLE saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  
  notes TEXT, -- Personal notes about the recipe
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_saved_recipe UNIQUE (user_id, recipe_id)
);
```

**Indexes:**
- `idx_saved_recipes_user` on `user_id`
- `idx_saved_recipes_recipe` on `recipe_id`

---

### 8. `recipe_ratings` - Recipe Ratings & Reviews
Users can rate and review public recipes.

```sql
CREATE TABLE recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  -- Helpfulness voting
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_recipe_rating UNIQUE (user_id, recipe_id)
);
```

**Indexes:**
- `idx_recipe_ratings_recipe` on `recipe_id`
- `idx_recipe_ratings_user` on `user_id`
- `idx_recipe_ratings_rating` on `rating DESC`

---

### 10. `recipe_comments` - Recipe Comments & Discussion
Threaded comments on public recipes.

```sql
CREATE TABLE recipe_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  parent_comment_id UUID REFERENCES recipe_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  -- Moderation
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_recipe_comments_recipe` on `recipe_id`
- `idx_recipe_comments_user` on `user_id`
- `idx_recipe_comments_parent` on `parent_comment_id`

---

### 11. `recipe_forks` - Track Recipe Forks/Remixes
Tracks when users fork/remix existing recipes.

```sql
CREATE TABLE recipe_forks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL NOT NULL,
  forked_recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  changes_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_fork UNIQUE (forked_recipe_id)
);
```

**Indexes:**
- `idx_recipe_forks_original` on `original_recipe_id`
- `idx_recipe_forks_forked` on `forked_recipe_id`

---

### 12. `activity_log` - User Activity Tracking
Tracks user actions for analytics.

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  activity_type TEXT NOT NULL, -- 'recipe_created', 'recipe_published', 'recipe_saved', etc.
  entity_type TEXT NOT NULL, -- 'recipe', 'collection', 'comment', etc.
  entity_id UUID,
  
  metadata JSONB, -- Additional context
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_activity_log_user` on `user_id`
- `idx_activity_log_created` on `created_at DESC`
- `idx_activity_log_type` on `activity_type`

---

### 13. `app_settings` - Global Application Settings
Admin-controlled settings.

```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);
```

Example settings:
- `featured_recipes` - List of featured recipe IDs
- `default_quality_ranges` - Hard/Liquid soap ranges
- `announcement` - App-wide announcement message

---

## Seed Data - Initial Database Population

### Critical: Oil Database Seeding

**Before any user data can be added**, the `oils` table MUST be populated with all 157 pre-defined oils from [`OIL_DATABASE.md`](./OIL_DATABASE.md).

### Seed Data File Location

Create file: `/supabase/seed.sql`

**Data Source:** All 157 oils from [`OIL_DATABASE.md`](./OIL_DATABASE.md)

### Seeding Instructions

```bash
# Option 1: Using psql
psql $DATABASE_URL < supabase/seed.sql

# Option 2: Using Supabase CLI
supabase db reset  # Includes seed data automatically

# Option 3: Using Supabase Dashboard
# Go to SQL Editor → New Query → Paste seed.sql contents → Run
```

### Seed File Structure

The complete seed file with all 157 oils can be generated from [`OIL_DATABASE.md`](./OIL_DATABASE.md). Here's the structure:

```sql
-- ============================================================================
-- SEED BASE OIL DATABASE
-- Source: OIL_DATABASE.md - 157 complete oils
-- ============================================================================

BEGIN;

-- Insert all 157 oils from OIL_DATABASE.md
INSERT INTO oils (name, sap, iodine, ins, lauric, myristic, palmitic, stearic, ricinoleic, oleic, linoleic, linolenic)
VALUES
  -- Hard Oils / Cleansing (High Lauric/Myristic)
  ('Coconut Oil, 76 deg', 0.257, 10, 258, 48, 19, 9, 3, 0, 8, 2, 0),
  ('Coconut Oil, 92 deg', 0.257, 3, 258, 48, 19, 9, 3, 0, 8, 2, 0),
  ('Coconut Oil, fractionated', 0.325, 1, 324, 2, 1, 0, 0, 0, 0, 0, 0),
  ('Babassu Oil', 0.245, 15, 230, 50, 20, 11, 4, 0, 10, 0, 0),
  ('Palm Kernel Oil', 0.247, 20, 227, 49, 16, 8, 2, 0, 15, 3, 0),
  
  -- Hard Oils / Conditioning
  ('Palm Oil', 0.199, 53, 145, 0, 1, 44, 5, 0, 39, 10, 0),
  ('Palm Stearin', 0.199, 48, 151, 0, 2, 60, 5, 0, 26, 7, 0),
  
  -- Butters (High Stearic)
  ('Cocoa Butter', 0.194, 37, 157, 0, 0, 28, 33, 0, 35, 3, 0),
  ('Shea Butter', 0.179, 59, 116, 0, 0, 5, 40, 0, 48, 6, 0),
  ('Mango Seed Butter', 0.191, 45, 146, 0, 0, 7, 42, 0, 45, 3, 0),
  ('Cupuacu Butter', 0.192, 39, 153, 0, 0, 8, 35, 0, 42, 2, 0),
  ('Kokum Butter', 0.190, 35, 155, 0, 0, 4, 56, 0, 36, 1, 0),
  ('Illipe Butter', 0.185, 33, 152, 0, 0, 17, 45, 0, 35, 0, 0),
  ('Sal Butter', 0.185, 39, 146, 0, 0, 6, 44, 0, 40, 2, 0),
  ('Murumuru Butter', 0.275, 25, 250, 47, 26, 6, 3, 0, 15, 3, 0),
  ('Tucuma Seed Butter', 0.238, 13, 175, 48, 23, 6, 0, 0, 13, 0, 0),
  
  -- Soft Oils (High Oleic)
  ('Olive Oil', 0.190, 85, 105, 0, 0, 14, 3, 0, 69, 12, 1),
  ('Olive Oil pomace', 0.188, 84, 104, 0, 0, 14, 3, 0, 69, 12, 2),
  ('Avocado Oil', 0.186, 86, 99, 0, 0, 20, 2, 0, 58, 12, 0),
  ('Avocado butter', 0.187, 67, 120, 0, 0, 21, 10, 0, 53, 6, 2),
  ('Castor Oil', 0.180, 86, 95, 0, 0, 0, 0, 90, 4, 4, 0),
  
  -- Liquid Oils / Conditioning (High Linoleic/Linolenic)
  ('Almond Oil, sweet', 0.195, 99, 97, 0, 0, 7, 0, 0, 71, 18, 0),
  ('Apricot Kernel Oil', 0.195, 100, 91, 0, 0, 6, 0, 0, 66, 27, 0),
  ('Sunflower Oil', 0.189, 133, 63, 0, 0, 7, 4, 0, 16, 70, 1),
  ('Sunflower Oil, high oleic', 0.189, 83, 106, 0, 0, 3, 4, 0, 83, 4, 1),
  ('Grapeseed Oil', 0.181, 131, 66, 0, 0, 8, 4, 0, 20, 68, 0),
  ('Rice Bran Oil, refined', 0.187, 100, 87, 0, 1, 22, 3, 0, 38, 34, 2),
  ('Hemp Oil', 0.193, 165, 39, 0, 0, 6, 2, 0, 12, 57, 21),
  ('Jojoba Oil (a Liquid Wax Ester)', 0.092, 83, 11, 0, 0, 0, 0, 0, 12, 0, 0),
  ('Hazelnut Oil', 0.195, 97, 94, 0, 0, 5, 3, 0, 75, 10, 0),
  ('Macadamia Nut Oil', 0.195, 76, 119, 0, 0, 9, 5, 0, 59, 2, 0),
  ('Argan Oil', 0.191, 95, 95, 0, 1, 14, 0, 0, 46, 34, 1),
  
  -- Additional Oils (Alphabetically) - Remaining 127 oils from OIL_DATABASE.md
  ('Abyssinian Oil', 0.168, 98, 70, 0, 0, 3, 2, 0, 18, 11, 4),
  ('Almond Butter', 0.188, 70, 118, 0, 1, 9, 15, 0, 58, 16, 0),
  ('Aloe Butter', 0.240, 9, 241, 45, 18, 8, 3, 0, 7, 2, 0),
  ('Andiroba Oil, karaba, crabwood', 0.188, 68, 120, 0, 0, 28, 8, 0, 51, 9, 0),
  ('Baobab Oil', 0.200, 75, 125, 0, 1, 24, 4, 0, 37, 28, 2),
  ('Beeswax', 0.094, 10, 84, 0, 0, 0, 0, 0, 0, 0, 0),
  ('Black Cumin Seed Oil, nigella sativa', 0.195, 133, 62, 0, 0, 13, 3, 0, 22, 60, 1),
  ('Black Currant Seed Oil', 0.190, 178, 12, 0, 0, 6, 2, 0, 13, 46, 29),
  ('Borage Oil', 0.190, 135, 55, 0, 0, 10, 4, 0, 20, 43, 5),
  ('Brazil Nut Oil', 0.190, 100, 90, 0, 0, 13, 11, 0, 39, 36, 0),
  ('Broccoli Seed Oil, Brassica Oleracea', 0.172, 105, 67, 0, 0, 3, 1, 0, 14, 11, 9),
  ('Buriti Oil', 0.223, 70, 153, 0, 0, 17, 2, 0, 71, 7, 1),
  ('Camelina Seed Oil', 0.188, 144, 44, 0, 0, 6, 2, 0, 24, 19, 45),
  ('Camellia Oil, Tea Seed', 0.193, 78, 115, 0, 0, 9, 2, 0, 77, 8, 0),
  ('Candelilla Wax', 0.044, 32, 12, 0, 0, 0, 0, 0, 0, 0, 0),
  ('Canola Oil', 0.186, 110, 56, 0, 0, 4, 2, 0, 61, 21, 9),
  ('Canola Oil, high oleic', 0.186, 96, 90, 0, 0, 4, 2, 0, 74, 12, 4),
  ('Carrot Seed Oil, cold pressed', 0.144, 56, 0, 0, 0, 4, 0, 0, 80, 13, 0),
  ('Cherry Kernel Oil, p. avium', 0.190, 128, 62, 0, 0, 8, 3, 0, 31, 45, 11),
  ('Cherry Kernel Oil, p. cerasus', 0.192, 118, 74, 0, 0, 6, 3, 0, 50, 40, 0),
  ('Chicken Fat', 0.195, 69, 130, 0, 1, 25, 7, 0, 38, 21, 0),
  ('Coffee Bean Oil, green', 0.185, 85, 100, 0, 0, 38, 8, 0, 9, 39, 2),
  ('Coffee Bean Oil, roasted', 0.180, 87, 93, 0, 0, 40, 0, 0, 8, 38, 2),
  ('Cohune Oil', 0.205, 30, 175, 51, 13, 8, 3, 0, 18, 3, 0),
  ('Corn Oil', 0.192, 117, 69, 0, 0, 12, 2, 0, 32, 51, 1),
  ('Cottonseed Oil', 0.194, 108, 89, 0, 0, 13, 13, 0, 18, 52, 1),
  ('Cranberry Seed Oil', 0.190, 150, 40, 0, 0, 6, 2, 0, 23, 37, 32),
  ('Crisco, new w/palm', 0.193, 111, 82, 0, 0, 20, 5, 0, 28, 40, 6),
  ('Crisco, old', 0.192, 93, 115, 0, 0, 13, 13, 0, 18, 52, 0),
  ('Duck Fat, flesh and skin', 0.194, 72, 122, 0, 1, 26, 9, 0, 44, 13, 1),
  ('Emu Oil', 0.190, 60, 128, 0, 0, 23, 9, 0, 47, 8, 0),
  ('Evening Primrose Oil', 0.190, 160, 30, 0, 0, 0, 0, 0, 0, 80, 9),
  ('Flax Oil, linseed', 0.190, 180, -6, 0, 0, 6, 3, 0, 27, 13, 50),
  ('Ghee, any bovine', 0.227, 30, 191, 4, 11, 28, 12, 0, 19, 2, 1),
  ('Goose Fat', 0.192, 65, 130, 0, 0, 21, 6, 0, 54, 10, 0),
  ('Horse Oil', 0.196, 79, 117, 0, 3, 26, 5, 0, 10, 20, 19),
  ('Japan Wax', 0.215, 11, 204, 0, 1, 80, 7, 0, 4, 0, 0),
  ('Jatropha Oil, soapnut seed oil', 0.193, 102, 91, 0, 0, 9, 7, 0, 44, 34, 0),
  ('Karanja Oil', 0.183, 85, 98, 0, 0, 6, 6, 0, 58, 15, 0),
  ('Kpangnan Butter', 0.191, 42, 149, 0, 0, 6, 44, 0, 49, 1, 0),
  ('Kukui nut Oil', 0.189, 168, 24, 0, 0, 6, 2, 0, 20, 42, 29),
  ('Lanolin liquid Wax', 0.106, 27, 83, 0, 0, 0, 0, 0, 0, 0, 0),
  ('Lard, Pig Tallow (Manteca)', 0.198, 57, 139, 0, 1, 28, 13, 0, 46, 6, 0),
  ('Laurel Fruit Oil', 0.198, 74, 124, 25, 1, 15, 1, 0, 31, 26, 1),
  ('Lauric Acid', 0.280, 0, 280, 99, 1, 0, 0, 0, 0, 0, 0),
  ('Linseed Oil, flax', 0.190, 180, -6, 0, 0, 6, 3, 0, 27, 13, 50),
  ('Loofa Seed Oil, Luffa cylinderica', 0.187, 108, 79, 0, 0, 9, 18, 0, 30, 47, 0),
  ('Macadamia Nut Butter', 0.188, 70, 118, 0, 1, 6, 12, 0, 56, 3, 1),
  ('Mafura Butter, Trichilia emetica', 0.198, 66, 132, 0, 1, 37, 3, 0, 49, 11, 1),
  ('Mango Seed Oil', 0.190, 60, 130, 0, 0, 8, 27, 0, 52, 8, 1),
  ('Marula Oil', 0.192, 73, 119, 0, 0, 11, 7, 0, 75, 4, 0),
  ('Meadowfoam Oil', 0.169, 92, 77, 0, 0, 0, 0, 0, 0, 0, 0),
  ('Milk Fat, any bovine', 0.227, 30, 191, 4, 11, 28, 12, 0, 19, 2, 1),
  ('Milk Thistle Oil', 0.196, 115, 81, 0, 0, 7, 2, 0, 26, 64, 0),
  ('Mink Oil', 0.196, 55, 141, 0, 0, 0, 0, 0, 0, 0, 0),
  ('Monoi de Tahiti Oil', 0.255, 9, 246, 44, 16, 10, 3, 0, 0, 2, 0),
  ('Moringa Oil', 0.192, 68, 124, 0, 0, 7, 7, 0, 71, 2, 0),
  ('Mowrah Butter', 0.194, 62, 132, 0, 0, 24, 22, 0, 36, 15, 0),
  ('Mustard Oil, kachi ghani', 0.173, 101, 72, 0, 0, 2, 2, 0, 18, 14, 9),
  ('Myristic Acid', 0.247, 1, 246, 0, 99, 0, 0, 0, 0, 0, 0),
  ('Neatsfoot Oil', 0.180, 90, 90, 0, 0, 0, 0, 0, 0, 0, 0),
  ('Neem Seed Oil', 0.193, 72, 121, 0, 2, 21, 16, 0, 46, 12, 0),
  ('Nutmeg Butter', 0.1624, 46, 116, 3, 83, 4, 0, 0, 5, 0, 0),
  ('Oat Oil', 0.190, 104, 86, 0, 0, 15, 2, 0, 40, 39, 0),
  ('Oleic Acid', 0.202, 92, 110, 0, 0, 0, 0, 0, 99, 0, 0),
  ('Ostrich Oil', 0.1946, 97, 128, 3, 1, 26, 6, 0, 37, 17, 3),
  ('Palm Kernel Oil Flakes, hydrogenated', 0.247, 20, 227, 49, 17, 8, 16, 0, 4, 0, 0),
  ('Palmitic Acid', 0.215, 2, 213, 0, 0, 98, 0, 0, 0, 0, 0),
  ('Palmolein', 0.200, 58, 142, 0, 1, 40, 5, 0, 43, 11, 0),
  ('Papaya seed oil, Carica papaya', 0.158, 67, 91, 0, 0, 13, 5, 0, 76, 3, 0),
  ('Passion Fruit Seed Oil', 0.183, 136, 47, 0, 0, 10, 3, 0, 15, 70, 1),
  ('Pataua (Patawa) Oil', 0.200, 77, 123, 0, 0, 13, 4, 0, 78, 3, 1),
  ('Peach Kernel Oil', 0.191, 108, 87, 0, 0, 6, 2, 0, 65, 25, 1),
  ('Peanut Oil', 0.192, 92, 99, 0, 0, 8, 3, 0, 56, 26, 0),
  ('Pecan Oil', 0.190, 113, 77, 0, 0, 7, 2, 0, 50, 39, 2),
  ('Perilla Seed Oil', 0.190, 196, -6, 0, 0, 6, 2, 0, 15, 16, 56),
  ('Pine Tar, lye calc only no FA', 0.060, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  ('Pistachio Oil', 0.186, 95, 92, 0, 0, 11, 1, 0, 63, 25, 0),
  ('Plum Kernel Oil', 0.194, 98, 96, 0, 0, 3, 0, 0, 68, 23, 0),
  ('Pomegranate Seed Oil', 0.190, 22, 168, 0, 0, 3, 3, 0, 7, 7, 78),
  ('Poppy Seed Oil', 0.194, 140, 54, 0, 0, 10, 2, 0, 17, 69, 2),
  ('Pracaxi (Pracachy) Seed Oil - hair conditioner', 0.175, 68, 107, 1, 1, 2, 2, 0, 44, 2, 2),
  ('Pumpkin Seed Oil virgin', 0.195, 128, 67, 0, 0, 11, 8, 0, 33, 50, 0),
  ('Rabbit Fat', 0.201, 85, 116, 0, 3, 30, 6, 0, 30, 20, 5),
  ('Rapeseed Oil, unrefined canola', 0.175, 106, 69, 0, 0, 4, 1, 0, 17, 13, 9),
  ('Raspberry Seed Oil', 0.187, 163, 24, 0, 0, 3, 0, 0, 13, 55, 26),
  ('Red Palm Butter', 0.199, 53, 145, 0, 1, 44, 5, 0, 39, 10, 0),
  ('Rosehip Oil', 0.187, 188, 10, 0, 0, 4, 2, 0, 12, 46, 31),
  ('Sacha Inchi, Plukenetia volubilis', 0.188, 141, 47, 0, 0, 4, 3, 0, 10, 35, 48),
  ('Safflower Oil', 0.192, 145, 47, 0, 0, 7, 0, 0, 15, 75, 0),
  ('Safflower Oil, high oleic', 0.190, 93, 97, 0, 0, 5, 2, 0, 77, 15, 0),
  ('Salmon Oil', 0.185, 169, 16, 0, 5, 19, 2, 0, 23, 2, 1),
  ('Saw Palmetto Extract', 0.230, 45, 185, 29, 11, 8, 2, 0, 35, 4, 1),
  ('Saw Palmetto Oil', 0.220, 44, 176, 29, 13, 9, 2, 0, 31, 4, 1),
  ('Sea Buckthorn Oil, seed', 0.195, 165, 30, 0, 0, 7, 3, 0, 14, 36, 38),
  ('Sea Buckthorn Oil, seed and berry', 0.183, 86, 97, 0, 0, 30, 1, 0, 28, 10, 0),
  ('Sesame Oil', 0.188, 110, 81, 0, 0, 10, 5, 0, 40, 43, 0),
  ('Shea Oil, fractionated', 0.185, 83, 102, 0, 0, 6, 10, 0, 73, 11, 0),
  ('SoapQuick, conventional', 0.212, 59, 153, 13, 6, 17, 3, 5, 42, 8, 1),
  ('SoapQuick, organic', 0.213, 56, 156, 13, 5, 20, 3, 0, 45, 10, 0),
  ('Soybean Oil', 0.191, 131, 61, 0, 0, 11, 5, 0, 24, 50, 8),
  ('Soybean, 27.5% hydrogenated', 0.191, 78, 113, 0, 0, 9, 15, 0, 41, 7, 1),
  ('Soybean, fully hydrogenated (soy wax)', 0.192, 1, 191, 0, 0, 11, 87, 0, 0, 0, 0),
  ('Stearic Acid', 0.198, 2, 196, 0, 0, 0, 99, 0, 0, 0, 0),
  ('Tallow Bear', 0.1946, 92, 100, 0, 2, 7, 3, 0, 70, 9, 0),
  ('Tallow Beef', 0.200, 45, 147, 2, 6, 28, 22, 0, 36, 3, 1),
  ('Tallow Deer', 0.193, 31, 166, 0, 1, 20, 24, 0, 30, 15, 3),
  ('Tallow Goat', 0.192, 40, 152, 5, 11, 23, 30, 0, 29, 2, 0),
  ('Tallow Sheep', 0.194, 54, 156, 4, 10, 24, 13, 0, 26, 5, 0),
  ('Tamanu Oil, kamani', 0.208, 111, 82, 0, 0, 12, 13, 0, 34, 38, 1),
  ('Ucuuba Butter', 0.205, 38, 167, 0, 0, 0, 31, 0, 44, 5, 0),
  ('Walmart GV Shortening, tallow, palm', 0.198, 49, 151, 1, 4, 35, 14, 0, 37, 6, 1),
  ('Walnut Oil', 0.189, 145, 45, 0, 0, 7, 2, 0, 18, 60, 0),
  ('Watermelon Seed Oil', 0.190, 119, 71, 0, 0, 11, 10, 0, 18, 60, 1),
  ('Wheat Germ Oil', 0.183, 128, 58, 0, 0, 17, 2, 0, 17, 58, 0),
  ('Yangu, cape chestnut', 0.192, 95, 97, 0, 0, 18, 5, 0, 45, 30, 1),
  ('Zapote seed oil, (Aceite de Sapuyul or Mamey)', 0.188, 72, 116, 0, 0, 9, 21, 0, 52, 13, 0);

COMMIT;

-- ============================================================================
-- VERIFY OIL DATA
-- ============================================================================

-- Check count (should be 157)
SELECT COUNT(*) as total_oils FROM oils;

-- Check sample oils
SELECT name, sap, ins FROM oils 
WHERE name IN ('Coconut Oil, 76 deg', 'Olive Oil', 'Palm Oil', 'Shea Butter');

-- Verify fatty acids sum to ≤ 100
SELECT name, (lauric + myristic + palmitic + stearic + ricinoleic + oleic + linoleic + linolenic) as total_fa
FROM oils
WHERE (lauric + myristic + palmitic + stearic + ricinoleic + oleic + linoleic + linolenic) > 100;
-- Should return 0 rows

```

### Verification After Seeding

Run these queries to verify the seed data:

```sql
-- 1. Check total count
SELECT COUNT(*) as total_oils FROM oils;
-- Expected: 157

-- 2. Check for duplicates
SELECT name, COUNT(*) FROM oils GROUP BY name HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 3. Verify popular oils exist
SELECT name FROM oils WHERE name IN (
  'Coconut Oil, 76 deg',
  'Olive Oil',
  'Palm Oil',
  'Shea Butter',
  'Castor Oil',
  'Sunflower Oil'
);
-- Expected: 6 rows

-- 4. Check SAP value ranges
SELECT MIN(sap), MAX(sap) FROM oils;
-- Expected: Min ~0.044 (Candelilla Wax), Max ~0.325 (Coconut fractionated)

-- 5. Check INS value ranges
SELECT MIN(ins), MAX(ins) FROM oils;
-- Expected: Min -6 (Flax), Max 324 (Coconut fractionated)

-- 6. Find high-cleansing oils
SELECT name, (lauric + myristic) as cleansing 
FROM oils 
WHERE (lauric + myristic) > 40 
ORDER BY cleansing DESC;
-- Expected: Several coconut/palm kernel variants

-- 7. Find moisturizing oils (high oleic)
SELECT name, oleic 
FROM oils 
WHERE oleic > 60 
ORDER BY oleic DESC;
-- Expected: Olive, Camellia, Hazelnut, etc.
```

### Important Notes

1. **Data Source:** All 157 oils come from [`OIL_DATABASE.md`](./OIL_DATABASE.md)
2. **SAP Values:** Listed values are for NaOH. KOH values = NaOH × 1.403
3. **Read-Only:** Oils table should only be modified by admins (enforced by RLS)
4. **Complete Dataset:** Application expects all 157 oils to be present
5. **No User Modifications:** Users cannot edit base oils (they can create custom oils in `custom_oils` table)

---

## Relationships

### Entity Relationship Diagram

```
profiles (users)
  ├─── recipes (1:many)
  │     ├─── recipe_oils (1:many)
  │     ├─── recipe_ratings (1:many)
  │     ├─── recipe_comments (1:many)
  │     └─── recipe_forks (1:many)
  ├─── custom_oils (1:many)
  ├─── collections (1:many)
  │     └─── collection_recipes (many:many with recipes)
  ├─── saved_recipes (many:many with recipes)
  └─── activity_log (1:many)
```

---

## Indexes

### Performance-Critical Indexes

```sql
-- Recipe search and filtering
CREATE INDEX idx_recipes_search ON recipes 
  USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Tag-based filtering
CREATE INDEX idx_recipes_tags_gin ON recipes USING GIN(tags);

-- Public recipe discovery
CREATE INDEX idx_recipes_public_featured ON recipes(is_featured, created_at DESC) 
  WHERE is_public = true AND deleted_at IS NULL;

-- User's recipes
CREATE INDEX idx_recipes_user_created ON recipes(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Popular recipes
CREATE INDEX idx_recipes_popular ON recipes(save_count DESC, rating_avg DESC)
  WHERE is_public = true AND deleted_at IS NULL;
```

---

## Row Level Security (RLS)

### Enable RLS on All Tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_oils ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_oils ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_forks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
```

### Key RLS Policies

#### Profiles
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can read public profiles
CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT USING (profile_public = true);
```

#### Recipes
```sql
-- Users can CRUD their own recipes
CREATE POLICY "Users manage own recipes" ON recipes
  FOR ALL USING (auth.uid() = user_id);

-- Anyone can read public recipes
CREATE POLICY "Public recipes are readable" ON recipes
  FOR SELECT USING (is_public = true AND deleted_at IS NULL);
```

#### Saved Recipes
```sql
-- Users can manage their own saved recipes
CREATE POLICY "Users manage own saved recipes" ON saved_recipes
  FOR ALL USING (auth.uid() = user_id);
```

#### Comments
```sql
-- Anyone can read comments on public recipes
CREATE POLICY "Public recipe comments readable" ON recipe_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_comments.recipe_id 
        AND recipes.is_public = true
    )
  );

-- Users can create comments on public recipes
CREATE POLICY "Users can comment on public recipes" ON recipe_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_comments.recipe_id 
        AND recipes.is_public = true
        AND recipes.allow_comments = true
    )
  );

-- Users can update/delete their own comments
CREATE POLICY "Users manage own comments" ON recipe_comments
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## Functions & Triggers

### 1. Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to all relevant tables)
```

### 2. Update Recipe Rating Average

```sql
CREATE OR REPLACE FUNCTION update_recipe_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipes
  SET 
    rating_avg = (SELECT AVG(rating) FROM recipe_ratings WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)),
    rating_count = (SELECT COUNT(*) FROM recipe_ratings WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id))
  WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_rating_on_insert AFTER INSERT ON recipe_ratings
  FOR EACH ROW EXECUTE FUNCTION update_recipe_rating_avg();

CREATE TRIGGER update_recipe_rating_on_update AFTER UPDATE ON recipe_ratings
  FOR EACH ROW EXECUTE FUNCTION update_recipe_rating_avg();

CREATE TRIGGER update_recipe_rating_on_delete AFTER DELETE ON recipe_ratings
  FOR EACH ROW EXECUTE FUNCTION update_recipe_rating_avg();
```

### 3. Increment Save Count

```sql
CREATE OR REPLACE FUNCTION increment_recipe_save_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipes
  SET save_count = save_count + 1
  WHERE id = NEW.recipe_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_save_count AFTER INSERT ON saved_recipes
  FOR EACH ROW EXECUTE FUNCTION increment_recipe_save_count();

CREATE OR REPLACE FUNCTION decrement_recipe_save_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipes
  SET save_count = save_count - 1
  WHERE id = OLD.recipe_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_save_count AFTER DELETE ON saved_recipes
  FOR EACH ROW EXECUTE FUNCTION decrement_recipe_save_count();
```

### 4. Create User Profile on Signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Log Activity

```sql
CREATE OR REPLACE FUNCTION log_recipe_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (user_id, activity_type, entity_type, entity_id)
  VALUES (
    NEW.user_id,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'recipe_created'
      WHEN NEW.is_public != OLD.is_public AND NEW.is_public = true THEN 'recipe_published'
      ELSE 'recipe_updated'
    END,
    'recipe',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_recipe_changes AFTER INSERT OR UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION log_recipe_activity();
```

---

## Storage Buckets

### 1. `avatars` - User Profile Pictures
- Public read access
- User upload with size limits (max 2MB)
- Image format validation (jpg, png, webp)

### 2. `recipe-images` - Recipe Photos
- Public read for public recipes
- Private read for private recipes
- User upload with size limits (max 5MB)
- Multiple images per recipe

---

## Data Migration Notes

### Existing Data
The current app uses hardcoded oil data in `lib/oilData.ts`. This needs to be:
1. Seeded into the database as "system oils" (read-only)
2. Kept in sync with any custom user oils

### Migration Strategy
1. Create a `system_oils` table (read-only, pre-populated)
2. Custom oils reference but don't duplicate system oils
3. Recipes snapshot oil data at creation time (in case oils change)

---

## Performance Considerations

### Query Optimization
- Use materialized views for popular recipes
- Cache calculated results in recipes table
- Implement pagination (limit/offset)
- Use connection pooling

### Caching Strategy
- Cache public recipe lists (Redis/Vercel Edge)
- Cache user profile data
- Invalidate on updates

### Real-time Subscriptions
Use sparingly:
- User's own recipe updates
- Comments on recipes user is viewing
- Avoid on large lists

---

## Security Considerations

### Authentication
- Email/password via Supabase Auth
- OAuth providers (Google, GitHub)
- Magic link login

### Data Validation
- All user inputs validated server-side
- JSONB schemas enforced via constraints
- Type checking on numeric fields

### Rate Limiting
- API rate limits per user
- Comment/rating flood prevention
- Upload size limits

---

## Backup & Recovery

### Automated Backups
- Supabase provides daily backups (Pro plan)
- Point-in-time recovery
- Export functionality for user data

### Data Export
Users should be able to:
- Export all their recipes as JSON
- Export profile data
- Delete account (cascade delete)

---

## Monitoring & Analytics

### Metrics to Track
- Active users
- Recipes created (public vs private)
- Popular recipes (views, saves, ratings)
- Oil usage frequency
- Error rates
- Query performance

### Tools
- Supabase dashboard
- Custom analytics table
- Vercel analytics integration

---

## Next Steps

See `SUPABASE_IMPLEMENTATION_PLAN.md` for the step-by-step implementation guide.
