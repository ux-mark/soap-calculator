/**
 * Database Types for Supabase MVP
 * Generated: November 9, 2025
 * 
 * These types match the database schema:
 * - profiles
 * - recipes
 * - oils (added: migrations #2 and #3)
 * 
 * Based on: supabase/migrations/20251109000001_create_mvp_tables.sql
 *           supabase/migrations/20251109000002_add_oils_table.sql
 */

// =====================================================
// TABLE: profiles
// =====================================================

export interface Profile {
  id: string; // UUID - matches auth.users.id
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  
  // User preferences
  default_unit: 'g' | 'oz' | 'lb';
  default_soap_type: 'hard' | 'liquid';
  default_superfat: number; // 0-20
  
  // Privacy
  profile_public: boolean;
  
  // Timestamps
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export interface ProfileInsert {
  id: string; // Must match auth.users.id
  email: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  default_unit?: 'g' | 'oz' | 'lb';
  default_soap_type?: 'hard' | 'liquid';
  default_superfat?: number;
  profile_public?: boolean;
}

export interface ProfileUpdate {
  email?: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  default_unit?: 'g' | 'oz' | 'lb';
  default_soap_type?: 'hard' | 'liquid';
  default_superfat?: number;
  profile_public?: boolean;
}

// =====================================================
// TABLE: oils
// =====================================================

export interface Oil {
  id: string; // slug format (e.g., "coconut-oil-76")
  name: string;
  user_id: string | null; // NULL for system oils, user UUID for custom oils
  
  // Saponification values
  sap_naoh: number; // NaOH SAP value (decimal 6,4)
  sap_koh: number;  // KOH SAP value (decimal 6,4)
  
  // Oil properties
  iodine: number;
  ins: number;
  category: string; // "Hard Oil", "Soft Oil", "Liquid Oil", "Butter", "Animal Fat", "Fatty Acid"
  
  // Fatty acid profile (JSONB)
  fatty_acids: FattyAcidProfile;
  
  // Metadata
  is_system: boolean; // true for built-in oils
  is_public: boolean; // for user-created custom oils
  
  // Timestamps
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export interface OilInsert {
  id: string; // Required: slug format
  name: string;
  user_id?: string | null;
  sap_naoh: number;
  sap_koh: number;
  iodine: number;
  ins: number;
  category: string;
  fatty_acids: FattyAcidProfile;
  is_system?: boolean;
  is_public?: boolean;
}

export interface OilUpdate {
  name?: string;
  sap_naoh?: number;
  sap_koh?: number;
  iodine?: number;
  ins?: number;
  category?: string;
  fatty_acids?: FattyAcidProfile;
  is_public?: boolean;
}

// =====================================================
// TABLE: recipes
// =====================================================

export interface Recipe {
  id: string; // UUID
  user_id: string; // UUID - references profiles.id
  
  // Basic info
  name: string;
  description: string | null;
  notes: string | null;
  
  // Recipe data (JSONB)
  inputs: RecipeInputs;
  selected_oils: SelectedOil[];
  calculated_results: CalculationResults | null;
  
  // Metadata
  is_public: boolean;
  tags: string[] | null;
  
  // Stats
  view_count: number;
  
  // Timestamps
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  deleted_at: string | null; // ISO 8601 timestamp or null
}

export interface RecipeInsert {
  user_id: string;
  name: string;
  description?: string | null;
  notes?: string | null;
  inputs: RecipeInputs;
  selected_oils: SelectedOil[];
  calculated_results?: CalculationResults | null;
  is_public?: boolean;
  tags?: string[] | null;
}

export interface RecipeUpdate {
  name?: string;
  description?: string | null;
  notes?: string | null;
  inputs?: RecipeInputs;
  selected_oils?: SelectedOil[];
  calculated_results?: CalculationResults | null;
  is_public?: boolean;
  tags?: string[] | null;
  deleted_at?: string | null; // For soft delete
}

// =====================================================
// JSONB STRUCTURES (from existing lib/types.ts)
// =====================================================

/**
 * Recipe input parameters
 * Stored in recipes.inputs (JSONB)
 */
export interface RecipeInputs {
  totalOilWeight: number;
  unit: 'g' | 'oz' | 'lb';
  soapType: 'hard' | 'liquid';
  lyeType: 'NaOH' | 'KOH';
  superfatPercentage: number; // 0-20
  waterMethod: 'water_as_percent_of_oils' | 'lye_concentration' | 'water_to_lye_ratio';
  waterValue: number;
  fragranceWeight: number;
}

/**
 * Fatty acid profile
 * Used in SelectedOil and CalculationResults
 */
export interface FattyAcidProfile {
  lauric: number;
  myristic: number;
  palmitic: number;
  stearic: number;
  ricinoleic: number;
  oleic: number;
  linoleic: number;
  linolenic: number;
}

/**
 * Oil data structure
 * Stored in recipes.selected_oils (JSONB array)
 */
export interface SelectedOil {
  id: string;
  name: string;
  percentage: number;
  weight: number;
  sap_naoh: number;
  sap_koh: number;
  fatty_acids: FattyAcidProfile;
  iodine: number;
  ins: number;
  category: string;
}

/**
 * Soap quality metrics
 * Used in CalculationResults
 */
export interface SoapQualities {
  hardness: number;
  cleansing: number;
  conditioning: number;
  bubbly: number;
  creamy: number;
  iodine: number;
  ins: number;
}

/**
 * Complete calculation results
 * Stored in recipes.calculated_results (JSONB)
 */
export interface CalculationResults {
  selectedOils: SelectedOil[];
  totalOilWeight: number;
  lyeWeight: number;
  waterWeight: number;
  fragranceWeight: number;
  totalBatchWeight: number;
  qualities: SoapQualities;
  fattyAcids: FattyAcidProfile;
}

// =====================================================
// QUERY RESULT TYPES
// =====================================================

/**
 * Recipe with owner profile
 * Common join query result
 */
export interface RecipeWithProfile extends Recipe {
  profile: Pick<Profile, 'username' | 'avatar_url' | 'profile_public'>;
}

/**
 * Recipe list item (minimal data)
 * For recipe browsing/listing
 */
export interface RecipeListItem {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  tags: string[] | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  username: string | null; // From joined profile
  avatar_url: string | null; // From joined profile
}

// =====================================================
// SUPABASE DATABASE TYPE
// =====================================================

/**
 * Complete database schema type
 * Use with Supabase client for type-safe queries
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      recipes: {
        Row: Recipe;
        Insert: RecipeInsert;
        Update: RecipeUpdate;
      };
      oils: {
        Row: Oil;
        Insert: OilInsert;
        Update: OilUpdate;
      };
    };
    Views: {
      // No views in MVP
    };
    Functions: {
      // Functions can be added here if needed
    };
    Enums: {
      // No enums in MVP (using TEXT with CHECK constraints)
    };
  };
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Recipe filter options
 * For building WHERE clauses
 */
export interface RecipeFilters {
  userId?: string;
  isPublic?: boolean;
  tags?: string[];
  searchQuery?: string;
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'view_count';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Profile preferences
 * Subset of Profile for settings
 */
export interface UserPreferences {
  default_unit: 'g' | 'oz' | 'lb';
  default_soap_type: 'hard' | 'liquid';
  default_superfat: number;
}

/**
 * Recipe metadata
 * Non-formula data about a recipe
 */
export interface RecipeMetadata {
  name: string;
  description: string | null;
  notes: string | null;
  is_public: boolean;
  tags: string[] | null;
}

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Check if a recipe has calculated results
 */
export function hasCalculatedResults(recipe: Recipe): recipe is Recipe & {
  calculated_results: CalculationResults;
} {
  return recipe.calculated_results !== null;
}

/**
 * Check if a profile is public
 */
export function isPublicProfile(profile: Profile): boolean {
  return profile.profile_public === true;
}

/**
 * Check if a recipe is public
 */
export function isPublicRecipe(recipe: Recipe): boolean {
  return recipe.is_public === true && recipe.deleted_at === null;
}

/**
 * Check if a recipe is soft-deleted
 */
export function isDeletedRecipe(recipe: Recipe): boolean {
  return recipe.deleted_at !== null;
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate recipe inputs
 */
export function validateRecipeInputs(inputs: RecipeInputs): boolean {
  return (
    inputs.totalOilWeight > 0 &&
    ['g', 'oz', 'lb'].includes(inputs.unit) &&
    ['hard', 'liquid'].includes(inputs.soapType) &&
    ['NaOH', 'KOH'].includes(inputs.lyeType) &&
    inputs.superfatPercentage >= 0 &&
    inputs.superfatPercentage <= 20 &&
    inputs.waterValue > 0 &&
    inputs.fragranceWeight >= 0
  );
}

/**
 * Validate selected oils
 */
export function validateSelectedOils(oils: SelectedOil[]): boolean {
  if (oils.length === 0) return false;
  
  const totalPercentage = oils.reduce((sum, oil) => sum + oil.percentage, 0);
  
  // Allow 0.01% tolerance for floating point errors
  return Math.abs(totalPercentage - 100) < 0.01;
}

/**
 * Validate profile preferences
 */
export function validateUserPreferences(prefs: UserPreferences): boolean {
  return (
    ['g', 'oz', 'lb'].includes(prefs.default_unit) &&
    ['hard', 'liquid'].includes(prefs.default_soap_type) &&
    prefs.default_superfat >= 0 &&
    prefs.default_superfat <= 20
  );
}
