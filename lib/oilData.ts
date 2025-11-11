import { OilData } from "./types";

// =====================================================
// DEPRECATED: This file is kept for backwards compatibility
// =====================================================
// 
// NEW APPROACH: Oils are now stored in the Supabase database (oils table)
// Use lib/services/oils.ts to fetch oils from the database instead
//
// This static data file is maintained as a fallback but should not be
// used in new code. The database contains 149+ oils with the same structure.
//
// Migration path:
// - Old: import { OILS_DATABASE } from '@/lib/oilData'
// - New: import { getAllAvailableOils } from '@/lib/services/oils'
//
// =====================================================

// Comprehensive oil database with fatty acid profiles and saponification values
// Data sourced from SoapCalc (soapcalc.net) - used under fair use for educational purposes

/**
 * @deprecated Use getAllAvailableOils() from lib/services/oils.ts instead
 */
export const OILS_DATABASE: OilData[] = [
  {
    id: "ignore-me",
    name: "Ignore Me",
    sap_naoh: 0,
    sap_koh: 0,
    category: "NONE",
    iodine: 0,
    ins: 0,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 0,
      stearic: 0,
      ricinoleic: 0,
      oleic: 0,
      linoleic: 0,
      linolenic: 0,
    },
  }
];

// =====================================================
// Helper functions
// =====================================================

/**
 * @deprecated Use getOilById() from lib/services/oils.ts instead
 */
export function getOilById(id: string): OilData | undefined {
  return OILS_DATABASE.find((oil) => oil.id === id);
}

/**
 * @deprecated Use searchOils() from lib/services/oils.ts instead
 */
export function searchOils(query: string): OilData[] {
  const lowerQuery = query.toLowerCase();
  return OILS_DATABASE.filter((oil) =>
    oil.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * @deprecated Use getOilsByCategory() from lib/services/oils.ts instead
 */
export function getOilsByCategory(category: string): OilData[] {
  return OILS_DATABASE.filter((oil) => oil.category === category);
}

/**
 * @deprecated Use getOilCategories() from lib/services/oils.ts instead
 */
export const OIL_CATEGORIES = ["Hard Oil", "Soft Oil", "Liquid Oil", "Butter"];
