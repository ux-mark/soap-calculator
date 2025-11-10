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
    id: "coconut-oil-76",
    name: "Coconut Oil, 76 deg",
    sap_naoh: 0.183,
    sap_koh: 0.257,
    category: "Hard Oil",
    iodine: 10,
    ins: 258,
    fatty_acids: {
      lauric: 48,
      myristic: 19,
      palmitic: 9,
      stearic: 3,
      ricinoleic: 0,
      oleic: 8,
      linoleic: 2,
      linolenic: 0,
    },
  },
  {
    id: "palm-oil",
    name: "Palm Oil",
    sap_naoh: 0.141,
    sap_koh: 0.198,
    category: "Hard Oil",
    iodine: 53,
    ins: 145,
    fatty_acids: {
      lauric: 0,
      myristic: 1,
      palmitic: 44,
      stearic: 5,
      ricinoleic: 0,
      oleic: 39,
      linoleic: 10,
      linolenic: 0,
    },
  },
  {
    id: "olive-oil",
    name: "Olive Oil",
    sap_naoh: 0.134,
    sap_koh: 0.188,
    category: "Soft Oil",
    iodine: 85,
    ins: 109,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 11,
      stearic: 4,
      ricinoleic: 0,
      oleic: 72,
      linoleic: 10,
      linolenic: 1,
    },
  },
  {
    id: "castor-oil",
    name: "Castor Oil",
    sap_naoh: 0.1286,
    sap_koh: 0.18,
    category: "Soft Oil",
    iodine: 86,
    ins: 95,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 2,
      stearic: 1,
      ricinoleic: 90,
      oleic: 4,
      linoleic: 3,
      linolenic: 0,
    },
  },
  {
    id: "sweet-almond-oil",
    name: "Sweet Almond Oil",
    sap_naoh: 0.136,
    sap_koh: 0.191,
    category: "Liquid Oil",
    iodine: 99,
    ins: 97,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 7,
      stearic: 2,
      ricinoleic: 0,
      oleic: 69,
      linoleic: 17,
      linolenic: 0,
    },
  },
  {
    id: "shea-butter",
    name: "Shea Butter",
    sap_naoh: 0.128,
    sap_koh: 0.179,
    category: "Butter",
    iodine: 59,
    ins: 116,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 4,
      stearic: 43,
      ricinoleic: 0,
      oleic: 45,
      linoleic: 6,
      linolenic: 0,
    },
  },
  {
    id: "cocoa-butter",
    name: "Cocoa Butter",
    sap_naoh: 0.137,
    sap_koh: 0.192,
    category: "Butter",
    iodine: 37,
    ins: 157,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 26,
      stearic: 34,
      ricinoleic: 0,
      oleic: 35,
      linoleic: 3,
      linolenic: 0,
    },
  },
  {
    id: "sunflower-oil",
    name: "Sunflower Oil",
    sap_naoh: 0.134,
    sap_koh: 0.188,
    category: "Liquid Oil",
    iodine: 133,
    ins: 63,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 6,
      stearic: 5,
      ricinoleic: 0,
      oleic: 19,
      linoleic: 68,
      linolenic: 1,
    },
  },
  {
    id: "avocado-oil",
    name: "Avocado Oil",
    sap_naoh: 0.1339,
    sap_koh: 0.1875,
    category: "Liquid Oil",
    iodine: 86,
    ins: 99,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 12,
      stearic: 2,
      ricinoleic: 0,
      oleic: 68,
      linoleic: 13,
      linolenic: 1,
    },
  },
  {
    id: "jojoba-oil",
    name: "Jojoba Oil",
    sap_naoh: 0.069,
    sap_koh: 0.097,
    category: "Liquid Oil",
    iodine: 82,
    ins: 11,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 1,
      stearic: 0,
      ricinoleic: 0,
      oleic: 10,
      linoleic: 0,
      linolenic: 0,
    },
  },
  {
    id: "rice-bran-oil",
    name: "Rice Bran Oil",
    sap_naoh: 0.128,
    sap_koh: 0.179,
    category: "Liquid Oil",
    iodine: 105,
    ins: 70,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 15,
      stearic: 2,
      ricinoleic: 0,
      oleic: 42,
      linoleic: 39,
      linolenic: 1,
    },
  },
  {
    id: "hemp-seed-oil",
    name: "Hemp Seed Oil",
    sap_naoh: 0.1345,
    sap_koh: 0.1884,
    category: "Liquid Oil",
    iodine: 165,
    ins: 39,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 6,
      stearic: 2,
      ricinoleic: 0,
      oleic: 12,
      linoleic: 57,
      linolenic: 21,
    },
  },
  {
    id: "mango-butter",
    name: "Mango Butter",
    sap_naoh: 0.1371,
    sap_koh: 0.1920,
    category: "Butter",
    iodine: 56,
    ins: 146,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 9,
      stearic: 44,
      ricinoleic: 0,
      oleic: 42,
      linoleic: 4,
      linolenic: 0,
    },
  },
  {
    id: "kukui-nut-oil",
    name: "Kukui Nut Oil",
    sap_naoh: 0.135,
    sap_koh: 0.189,
    category: "Liquid Oil",
    iodine: 159,
    ins: 49,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 6,
      stearic: 2,
      ricinoleic: 0,
      oleic: 24,
      linoleic: 42,
      linolenic: 25,
    },
  },
  {
    id: "babassu-oil",
    name: "Babassu Oil",
    sap_naoh: 0.175,
    sap_koh: 0.245,
    category: "Hard Oil",
    iodine: 15,
    ins: 230,
    fatty_acids: {
      lauric: 44,
      myristic: 16,
      palmitic: 8,
      stearic: 4,
      ricinoleic: 0,
      oleic: 15,
      linoleic: 3,
      linolenic: 0,
    },
  },
  {
    id: "grapeseed-oil",
    name: "Grapeseed Oil",
    sap_naoh: 0.1265,
    sap_koh: 0.1772,
    category: "Liquid Oil",
    iodine: 131,
    ins: 66,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 7,
      stearic: 4,
      ricinoleic: 0,
      oleic: 17,
      linoleic: 71,
      linolenic: 0,
    },
  },
  {
    id: "hazelnut-oil",
    name: "Hazelnut Oil",
    sap_naoh: 0.1356,
    sap_koh: 0.1899,
    category: "Liquid Oil",
    iodine: 94,
    ins: 94,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 5,
      stearic: 2,
      ricinoleic: 0,
      oleic: 78,
      linoleic: 10,
      linolenic: 0,
    },
  },
  {
    id: "apricot-kernel-oil",
    name: "Apricot Kernel Oil",
    sap_naoh: 0.135,
    sap_koh: 0.189,
    category: "Liquid Oil",
    iodine: 100,
    ins: 91,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 6,
      stearic: 2,
      ricinoleic: 0,
      oleic: 63,
      linoleic: 28,
      linolenic: 0,
    },
  },
  {
    id: "macadamia-nut-oil",
    name: "Macadamia Nut Oil",
    sap_naoh: 0.139,
    sap_koh: 0.195,
    category: "Liquid Oil",
    iodine: 75,
    ins: 119,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 8,
      stearic: 3,
      ricinoleic: 0,
      oleic: 59,
      linoleic: 2,
      linolenic: 0,
    },
  },
  {
    id: "neem-oil",
    name: "Neem Oil",
    sap_naoh: 0.1387,
    sap_koh: 0.1942,
    category: "Liquid Oil",
    iodine: 71,
    ins: 124,
    fatty_acids: {
      lauric: 0,
      myristic: 0,
      palmitic: 14,
      stearic: 15,
      ricinoleic: 0,
      oleic: 54,
      linoleic: 15,
      linolenic: 0,
    },
  },
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
