-- =====================================================
-- SOAP CALCULATOR - MVP DATABASE SCHEMA
-- =====================================================
-- Version: 1.0 (Minimal - 2 Tables)
-- Created: November 9, 2025
-- Purpose: Add database persistence to client-side app
-- Tables: profiles, recipes
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: profiles
-- =====================================================
-- Purpose: User accounts and preferences
-- References: auth.users (Supabase Auth)
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  
  -- User preferences (with defaults matching current app)
  default_unit TEXT DEFAULT 'g' CHECK (default_unit IN ('g', 'oz', 'lb')),
  default_soap_type TEXT DEFAULT 'hard' CHECK (default_soap_type IN ('hard', 'liquid')),
  default_superfat INTEGER DEFAULT 5 CHECK (default_superfat BETWEEN 0 AND 20),
  
  -- Privacy settings
  profile_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User accounts and calculator preferences';
COMMENT ON COLUMN profiles.id IS 'References auth.users.id from Supabase Auth';
COMMENT ON COLUMN profiles.default_unit IS 'Default unit for calculator (g, oz, lb)';
COMMENT ON COLUMN profiles.default_soap_type IS 'Default soap type (hard, liquid)';
COMMENT ON COLUMN profiles.default_superfat IS 'Default superfat percentage (0-20)';

-- =====================================================
-- TABLE 2: recipes
-- =====================================================
-- Purpose: Store soap formulation recipes
-- Data Storage: JSONB for flexibility (matches current client-side structure)
-- =====================================================

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic recipe information
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  
  -- Recipe data (stored as JSONB to match current client-side structure)
  inputs JSONB NOT NULL,              -- RecipeInputs interface
  selected_oils JSONB NOT NULL,       -- SelectedOil[] array
  calculated_results JSONB,           -- CalculationResults interface (cached)
  
  -- Metadata
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  
  -- Statistics (for future features)
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ              -- Soft delete support
);

-- Indexes for recipes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_is_public ON recipes(is_public) WHERE deleted_at IS NULL;
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipes_user_created ON recipes(user_id, created_at DESC) WHERE deleted_at IS NULL;

-- GIN index for tags array (for future tag filtering)
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);

-- Comments for documentation
COMMENT ON TABLE recipes IS 'Soap formulation recipes with JSONB storage';
COMMENT ON COLUMN recipes.inputs IS 'RecipeInputs: totalOilWeight, unit, soapType, lyeType, superfat, waterMethod, waterValue, fragranceWeight';
COMMENT ON COLUMN recipes.selected_oils IS 'Array of SelectedOil objects with id, name, percentage, weight, sap values, fatty acids';
COMMENT ON COLUMN recipes.calculated_results IS 'Cached CalculationResults: lyeWeight, waterWeight, qualities, fattyAcids, totalBatchWeight';
COMMENT ON COLUMN recipes.deleted_at IS 'Soft delete timestamp - NULL means active';

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Auto-update updated_at timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to recipes table
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Security rules for data access
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Anyone can read public profiles (for future social features)
CREATE POLICY "Anyone can read public profiles"
  ON profiles FOR SELECT
  USING (profile_public = true);

-- =====================================================
-- RECIPES POLICIES
-- =====================================================

-- Users can insert their own recipes
CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own recipes
CREATE POLICY "Users can read own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can update their own recipes
CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own recipes (soft delete)
CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can read public recipes (for future sharing features)
CREATE POLICY "Anyone can read public recipes"
  ON recipes FOR SELECT
  USING (is_public = true AND deleted_at IS NULL);

-- =====================================================
-- AUTOMATIC PROFILE CREATION
-- =====================================================
-- Create profile automatically when user signs up
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1) -- Use email prefix as default username
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================
-- Uncomment to insert sample recipes for development
-- =====================================================

/*
-- Sample recipe 1: Basic Castile Soap
INSERT INTO recipes (user_id, name, description, inputs, selected_oils, is_public) VALUES (
  'REPLACE_WITH_YOUR_USER_ID',
  'Classic Castile Soap',
  'A gentle, conditioning soap made with 100% olive oil',
  '{
    "totalOilWeight": 500,
    "unit": "g",
    "soapType": "hard",
    "lyeType": "NaOH",
    "superfatPercentage": 5,
    "waterMethod": "water_as_percent_of_oils",
    "waterValue": 38,
    "fragranceWeight": 0
  }'::JSONB,
  '[
    {
      "id": "olive-oil",
      "name": "Olive Oil",
      "percentage": 100,
      "weight": 500,
      "sap_naoh": 0.135,
      "sap_koh": 0.190,
      "fatty_acids": {
        "lauric": 0,
        "myristic": 0,
        "palmitic": 11,
        "stearic": 4,
        "ricinoleic": 0,
        "oleic": 72,
        "linoleic": 10,
        "linolenic": 1
      },
      "iodine": 85,
      "ins": 109,
      "category": "Soft Oil"
    }
  ]'::JSONB,
  true
);

-- Sample recipe 2: Balanced Recipe
INSERT INTO recipes (user_id, name, description, inputs, selected_oils, tags, is_public) VALUES (
  'REPLACE_WITH_YOUR_USER_ID',
  'Balanced Bar Soap',
  'A well-balanced recipe with good hardness, cleansing, and conditioning',
  '{
    "totalOilWeight": 1000,
    "unit": "g",
    "soapType": "hard",
    "lyeType": "NaOH",
    "superfatPercentage": 5,
    "waterMethod": "water_as_percent_of_oils",
    "waterValue": 38,
    "fragranceWeight": 30
  }'::JSONB,
  '[
    {
      "id": "coconut-oil-76",
      "name": "Coconut Oil, 76 deg",
      "percentage": 20,
      "weight": 200
    },
    {
      "id": "olive-oil",
      "name": "Olive Oil",
      "percentage": 50,
      "weight": 500
    },
    {
      "id": "palm-oil",
      "name": "Palm Oil",
      "percentage": 25,
      "weight": 250
    },
    {
      "id": "castor-oil",
      "name": "Castor Oil",
      "percentage": 5,
      "weight": 50
    }
  ]'::JSONB,
  ARRAY['beginner-friendly', 'balanced'],
  true
);
*/

-- =====================================================
-- VALIDATION QUERIES
-- =====================================================
-- Run these to verify the schema was created correctly
-- =====================================================

-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'recipes');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'recipes');

-- Check policies exist
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'recipes');

-- Check indexes exist
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('profiles', 'recipes');

-- Check triggers exist
-- SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE event_object_schema = 'public' AND event_object_table IN ('profiles', 'recipes');

-- =====================================================
-- END OF MIGRATION
-- =====================================================
