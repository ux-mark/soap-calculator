import {
  OilData,
  SelectedOil,
  OilRecommendation,
  RecommendationContext,
  SoapQualities,
  FattyAcidProfile,
} from "./types";
import { OILS_DATABASE } from "./oilData";
import {
  calculateFattyAcidProfile,
  calculateSoapQualities,
  getQualityRanges,
} from "./calculations";

/**
 * Intelligent recommendation engine for suggesting complementary oils
 * Analyzes current selection and suggests oils that will improve the recipe
 */

/**
 * Calculate compatibility score for an oil given the current selection
 * Returns a score from 0-100
 * Now supports both hard and liquid soap formulations
 */
function calculateCompatibilityScore(
  oil: OilData,
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard"
): {
  score: number;
  reason: string;
  factors: {
    complementsFattyAcids: boolean;
    improvesQuality: string[];
    fillsNeeds: string[];
  };
} {
  let score = 50; // Base score
  const improvesQuality: string[] = [];
  const fillsNeeds: string[] = [];

  // Get appropriate quality ranges for soap type
  const qualityRanges = getQualityRanges(soapType);

  // If no oils selected yet, prioritize base oils
  if (context.currentOils.length === 0) {
    if (oil.category === "Hard Oil") {
      score += 20;
      fillsNeeds.push("base_hard_oil");
    }
    if (oil.category === "Soft Oil" && oil.id === "olive-oil") {
      score += 25;
      fillsNeeds.push("base_soft_oil");
    }
    return {
      score,
      reason: "Good starting oil for your recipe",
      factors: {
        complementsFattyAcids: true,
        improvesQuality,
        fillsNeeds,
      },
    };
  }

  // Simulate adding this oil at a reasonable percentage
  const testPercentage = Math.max(
    5,
    Math.min(30, 100 - context.currentPercentage)
  );
  const testOils: SelectedOil[] = [
    ...context.currentOils,
    { ...oil, percentage: testPercentage },
  ];

  // Normalize percentages
  const total = testOils.reduce((sum, o) => sum + o.percentage, 0);
  const normalizedOils = testOils.map((o) => ({
    ...o,
    percentage: (o.percentage / total) * 100,
  }));

  // Calculate projected qualities
  const projectedFattyAcids = calculateFattyAcidProfile(normalizedOils);
  const projectedQualities = calculateSoapQualities(
    projectedFattyAcids,
    normalizedOils
  );

  // Check if this oil improves any out-of-range qualities
  const qualityKeys: (keyof SoapQualities)[] = [
    "hardness",
    "cleansing",
    "conditioning",
    "bubbly",
    "creamy",
  ];

  qualityKeys.forEach((quality) => {
    const currentValue = context.currentQualities[quality];
    const projectedValue = projectedQualities[quality];
    const range = qualityRanges[quality];

    // Check if it brings an out-of-range value closer to ideal
    if (currentValue < range.min && projectedValue > currentValue) {
      score += 15;
      improvesQuality.push(`increases_${quality}`);
    } else if (currentValue > range.max && projectedValue < currentValue) {
      score += 15;
      improvesQuality.push(`decreases_${quality}`);
    } else if (
      range.ideal &&
      Math.abs(projectedValue - (range.ideal.min + range.ideal.max) / 2) <
        Math.abs(currentValue - (range.ideal.min + range.ideal.max) / 2)
    ) {
      score += 5;
      improvesQuality.push(`optimizes_${quality}`);
    }
  });

  // Check fatty acid diversity
  const complementsFattyAcids = checkFattyAcidComplement(
    oil.fatty_acids,
    context.currentFattyAcids
  );

  if (complementsFattyAcids) {
    score += 10;
  }

  // Check for specific needs
  const needs = identifyRecipeNeeds(context.currentQualities, soapType);
  needs.forEach((need) => {
    if (oilFulfillsNeed(oil, need, soapType)) {
      score += 10;
      fillsNeeds.push(need);
    }
  });

  // Penalize if oil is too similar to already selected oils
  const similarityPenalty = calculateSimilarityPenalty(oil, context.currentOils);
  score -= similarityPenalty;

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  let reason = "Complements your current selection";
  if (improvesQuality.length > 0) {
    reason = `Improves ${improvesQuality[0].replace("_", " ")}`;
  } else if (fillsNeeds.length > 0) {
    reason = `Provides ${fillsNeeds[0].replace("_", " ")}`;
  }

  return {
    score,
    reason,
    factors: {
      complementsFattyAcids,
      improvesQuality,
      fillsNeeds,
    },
  };
}

/**
 * Check if an oil's fatty acids complement the current profile
 */
function checkFattyAcidComplement(
  oilFattyAcids: FattyAcidProfile,
  currentFattyAcids: FattyAcidProfile
): boolean {
  const fattyAcidKeys: (keyof FattyAcidProfile)[] = [
    "lauric",
    "myristic",
    "palmitic",
    "stearic",
    "ricinoleic",
    "oleic",
    "linoleic",
    "linolenic",
  ];

  // Check if oil provides fatty acids that are low in current profile
  let complementCount = 0;
  fattyAcidKeys.forEach((acid) => {
    if (currentFattyAcids[acid] < 10 && oilFattyAcids[acid] > 20) {
      complementCount++;
    }
  });

  return complementCount >= 2;
}

/**
 * Identify what the recipe needs based on current qualities
 */
function identifyRecipeNeeds(
  currentQualities: SoapQualities,
  soapType: "hard" | "liquid" = "hard"
): string[] {
  const needs: string[] = [];
  const qualityRanges = getQualityRanges(soapType);

  if (currentQualities.hardness < qualityRanges.hardness.min) {
    needs.push("hardness");
  }
  if (currentQualities.cleansing < qualityRanges.cleansing.min) {
    needs.push("cleansing");
  }
  if (currentQualities.conditioning < qualityRanges.conditioning.min) {
    needs.push("conditioning");
  }
  if (currentQualities.bubbly < qualityRanges.bubbly.min) {
    needs.push("bubbly_lather");
  }
  if (currentQualities.creamy < qualityRanges.creamy.min) {
    needs.push("creamy_lather");
  }

  return needs;
}

/**
 * Check if an oil fulfills a specific recipe need
 */
function oilFulfillsNeed(oil: OilData, need: string, soapType: "hard" | "liquid" = "hard"): boolean {
  switch (need) {
    case "hardness":
      // For liquid soap, we DON'T want high hardness oils
      if (soapType === "liquid") {
        return false; // Avoid recommending hardness-boosting oils for liquid soap
      }
      return (
        oil.fatty_acids.palmitic > 20 ||
        oil.fatty_acids.stearic > 20 ||
        oil.category === "Hard Oil" ||
        oil.category === "Butter"
      );
    case "cleansing":
      return oil.fatty_acids.lauric > 30 || oil.fatty_acids.myristic > 10;
    case "conditioning":
      return (
        oil.fatty_acids.oleic > 40 ||
        oil.fatty_acids.linoleic > 30 ||
        oil.fatty_acids.ricinoleic > 50
      );
    case "bubbly_lather":
      return (
        oil.fatty_acids.lauric > 30 ||
        oil.fatty_acids.ricinoleic > 50 ||
        oil.id === "castor-oil"
      );
    case "creamy_lather":
      return (
        oil.fatty_acids.palmitic > 20 ||
        oil.fatty_acids.stearic > 20 ||
        oil.fatty_acids.ricinoleic > 50
      );
    default:
      return false;
  }
}

/**
 * Calculate penalty for similarity to already selected oils
 */
function calculateSimilarityPenalty(
  oil: OilData,
  selectedOils: SelectedOil[]
): number {
  let maxSimilarity = 0;

  selectedOils.forEach((selectedOil) => {
    const similarity = calculateOilSimilarity(oil, selectedOil);
    maxSimilarity = Math.max(maxSimilarity, similarity);
  });

  // Return penalty from 0-20 based on similarity
  return maxSimilarity * 20;
}

/**
 * Calculate similarity between two oils (0-1)
 */
function calculateOilSimilarity(oil1: OilData, oil2: OilData): number {
  // Same oil = 100% similar
  if (oil1.id === oil2.id) return 1;

  // Compare fatty acid profiles
  const fattyAcidKeys: (keyof FattyAcidProfile)[] = [
    "lauric",
    "myristic",
    "palmitic",
    "stearic",
    "ricinoleic",
    "oleic",
    "linoleic",
    "linolenic",
  ];

  let totalDifference = 0;
  fattyAcidKeys.forEach((acid) => {
    const diff = Math.abs(oil1.fatty_acids[acid] - oil2.fatty_acids[acid]);
    totalDifference += diff;
  });

  // Average difference across all fatty acids
  const avgDifference = totalDifference / fattyAcidKeys.length;

  // Convert to similarity (0-1)
  const similarity = Math.max(0, 1 - avgDifference / 100);

  return similarity;
}

/**
 * Get recommended oils for the current selection
 * Returns top N recommendations sorted by score
 */
export function getRecommendedOils(
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  maxRecommendations: number = 5
): OilRecommendation[] {
  // Get list of already selected oil IDs
  const selectedOilIds = new Set(context.currentOils.map((oil) => oil.id));

  // Calculate scores for all non-selected oils
  const recommendations: OilRecommendation[] = OILS_DATABASE.filter(
    (oil) => !selectedOilIds.has(oil.id)
  ).map((oil) => {
    const { score, reason, factors } = calculateCompatibilityScore(
      oil,
      context,
      soapType
    );
    return {
      oil,
      score,
      reason,
      compatibilityFactors: factors,
    };
  });

  // Sort by score (highest first) and return top N
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations);
}

/**
 * Check if adding an oil would be compatible (not create conflicts)
 */
export function isOilCompatible(
  oil: OilData,
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  minScore: number = 30
): boolean {
  const { score } = calculateCompatibilityScore(oil, context, soapType);
  return score >= minScore;
}

/**
 * Get oils that should be disabled (incompatible with current selection)
 */
export function getIncompatibleOils(
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  threshold: number = 25
): Set<string> {
  const selectedOilIds = new Set(context.currentOils.map((oil) => oil.id));

  const incompatibleIds = new Set<string>();

  OILS_DATABASE.forEach((oil) => {
    if (selectedOilIds.has(oil.id)) return; // Skip already selected oils

    const { score } = calculateCompatibilityScore(oil, context, soapType);
    if (score < threshold) {
      incompatibleIds.add(oil.id);
    }
  });

  return incompatibleIds;
}
