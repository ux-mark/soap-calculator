/**
 * Oils Service Module
 * 
 * Handles all database operations for oils (system and custom user oils).
 * Provides functions to fetch, search, and filter oils from Supabase.
 */

import { createClient } from '@/lib/supabase/client';
import type { Oil } from '@/lib/database.types';
import type { OilData } from '@/lib/types';

// =====================================================
// TYPE CONVERTERS
// =====================================================

/**
 * Convert database Oil to app OilData format
 * Maintains compatibility with existing components
 */
export function oilToOilData(oil: Oil): OilData {
  return {
    id: oil.id,
    name: oil.name,
    sap_naoh: oil.sap_naoh,
    sap_koh: oil.sap_koh,
    fatty_acids: oil.fatty_acids,
    iodine: oil.iodine,
    ins: oil.ins,
    category: oil.category,
  };
}

/**
 * Convert multiple oils to OilData format
 */
export function oilsToOilData(oils: Oil[]): OilData[] {
  return oils.map(oilToOilData);
}

// =====================================================
// FETCH FUNCTIONS
// =====================================================

/**
 * Get all system oils (built-in oils available to everyone)
 * Returns oils sorted by name
 */
export async function getSystemOils(): Promise<OilData[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('oils')
    .select('*')
    .eq('is_system', true)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching system oils:', error);
    throw new Error(`Failed to fetch system oils: ${error.message}`);
  }
  
  return oilsToOilData(data || []);
}

/**
 * Get user's custom oils
 * Requires authentication
 */
export async function getUserCustomOils(userId: string): Promise<OilData[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('oils')
    .select('*')
    .eq('user_id', userId)
    .eq('is_system', false)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching user custom oils:', error);
    throw new Error(`Failed to fetch custom oils: ${error.message}`);
  }
  
  return oilsToOilData(data || []);
}

/**
 * Get all available oils for a user
 * Includes system oils + user's custom oils + public custom oils from other users
 */
export async function getAllAvailableOils(userId?: string): Promise<OilData[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('oils')
    .select('*')
    .order('name', { ascending: true });
  
  if (userId) {
    // System oils OR user's custom oils OR public custom oils
    query = query.or(`is_system.eq.true,user_id.eq.${userId},is_public.eq.true`);
  } else {
    // Just system oils and public custom oils (for unauthenticated users)
    query = query.or('is_system.eq.true,is_public.eq.true');
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching available oils:', error);
    throw new Error(`Failed to fetch oils: ${error.message}`);
  }
  
  return oilsToOilData(data || []);
}

/**
 * Get a specific oil by ID
 */
export async function getOilById(id: string): Promise<OilData | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('oils')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching oil by ID:', error);
    throw new Error(`Failed to fetch oil: ${error.message}`);
  }
  
  return data ? oilToOilData(data) : null;
}

/**
 * Get oils by category
 */
export async function getOilsByCategory(
  category: string,
  userId?: string
): Promise<OilData[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('oils')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });
  
  if (userId) {
    query = query.or(`is_system.eq.true,user_id.eq.${userId},is_public.eq.true`);
  } else {
    query = query.or('is_system.eq.true,is_public.eq.true');
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching oils by category:', error);
    throw new Error(`Failed to fetch oils: ${error.message}`);
  }
  
  return oilsToOilData(data || []);
}

/**
 * Search oils by name
 * Uses case-insensitive ILIKE search
 */
export async function searchOils(
  query: string,
  userId?: string
): Promise<OilData[]> {
  const supabase = createClient();
  
  const searchPattern = `%${query}%`;
  
  let dbQuery = supabase
    .from('oils')
    .select('*')
    .ilike('name', searchPattern)
    .order('name', { ascending: true });
  
  if (userId) {
    dbQuery = dbQuery.or(`is_system.eq.true,user_id.eq.${userId},is_public.eq.true`);
  } else {
    dbQuery = dbQuery.or('is_system.eq.true,is_public.eq.true');
  }
  
  const { data, error } = await dbQuery;
  
  if (error) {
    console.error('Error searching oils:', error);
    throw new Error(`Failed to search oils: ${error.message}`);
  }
  
  return oilsToOilData(data || []);
}

/**
 * Get all unique oil categories
 */
export async function getOilCategories(): Promise<string[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('oils')
    .select('category')
    .eq('is_system', true); // Only use system oils for categories
  
  if (error) {
    console.error('Error fetching oil categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
  
  // Get unique categories
  const categories = [...new Set((data as { category: string }[])?.map(row => row.category) || [])];
  return categories.sort();
}

// =====================================================
// CREATE/UPDATE/DELETE (for custom user oils)
// =====================================================

/**
 * Create a custom oil for a user
 * Requires authentication
 */
export async function createCustomOil(
  userId: string,
  oilData: Omit<OilData, 'id'> & { id: string }
): Promise<OilData> {
  const supabase = createClient();
  
  const oilInsert: any = {
    id: oilData.id,
    name: oilData.name,
    user_id: userId,
    sap_naoh: oilData.sap_naoh,
    sap_koh: oilData.sap_koh,
    iodine: oilData.iodine,
    ins: oilData.ins,
    category: oilData.category || 'Liquid Oil',
    fatty_acids: oilData.fatty_acids,
    is_system: false,
    is_public: false,
  };
  
  const { data, error } = await supabase
    .from('oils')
    .insert(oilInsert)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating custom oil:', error);
    throw new Error(`Failed to create oil: ${error.message}`);
  }
  
  return oilToOilData(data as Oil);
}

/**
 * Update a custom oil
 * Only allows updating user's own custom oils (not system oils)
 */
export async function updateCustomOil(
  oilId: string,
  userId: string,
  updates: Partial<OilData>
): Promise<OilData> {
  const supabase = createClient();
  
  const oilUpdate: any = {
    name: updates.name,
    sap_naoh: updates.sap_naoh,
    sap_koh: updates.sap_koh,
    iodine: updates.iodine,
    ins: updates.ins,
    category: updates.category,
    fatty_acids: updates.fatty_acids,
  };
  
  const { data, error } = await supabase
    .from('oils')
    // @ts-expect-error - Supabase type inference issue with oils table
    .update(oilUpdate)
    .eq('id', oilId)
    .eq('user_id', userId)
    .eq('is_system', false) // Safety: cannot update system oils
    .select()
    .single();
  
  if (error) {
    console.error('Error updating custom oil:', error);
    throw new Error(`Failed to update oil: ${error.message}`);
  }
  
  return oilToOilData(data as Oil);
}

/**
 * Delete a custom oil
 * Only allows deleting user's own custom oils (not system oils)
 */
export async function deleteCustomOil(
  oilId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('oils')
    .delete()
    .eq('id', oilId)
    .eq('user_id', userId)
    .eq('is_system', false); // Safety: cannot delete system oils
  
  if (error) {
    console.error('Error deleting custom oil:', error);
    throw new Error(`Failed to delete oil: ${error.message}`);
  }
}

/**
 * Toggle public visibility of a custom oil
 */
export async function toggleOilPublic(
  oilId: string,
  userId: string,
  isPublic: boolean
): Promise<OilData> {
  const supabase = createClient();
  
  const { data, error} = await supabase
    .from('oils')
    // @ts-expect-error - Supabase type inference issue with oils table
    .update({ is_public: isPublic })
    .eq('id', oilId)
    .eq('user_id', userId)
    .eq('is_system', false)
    .select()
    .single();
  
  if (error) {
    console.error('Error toggling oil visibility:', error);
    throw new Error(`Failed to update oil: ${error.message}`);
  }
  
  return oilToOilData(data as Oil);
}
