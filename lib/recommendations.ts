import {
  OilData,
  SelectedOil,
  OilRecommendation,
  RecommendationContext,
  SoapQualities,
  FattyAcidProfile,
  RecommendationDetail,
  FattyAcidContribution,
  QualityProjection,
  IncompatibilityProblem,
  BetterAlternative,
  ComparativeAnalysis,
} from "./types";
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
 * Calculate suggested percentage for an oil based on current recipe needs
 */
function calculateSuggestedPercentage(
  oil: OilData,
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard"
): number {
  const remainingPercentage = 100 - context.currentPercentage;
  
  // If very little room left, suggest small amount
  if (remainingPercentage < 10) return Math.max(5, remainingPercentage);
  
  // Calculate ideal percentage based on oil properties and needs
  const needs = identifyRecipeNeeds(context.currentQualities, soapType);
  
  // Strong base oils should be 15-30%
  if (oil.category === "Hard Oil" && needs.includes("hardness")) {
    return Math.min(25, remainingPercentage);
  }
  
  // Conditioning oils 10-20%
  if (oil.fatty_acids.oleic > 50 && needs.includes("conditioning")) {
    return Math.min(20, remainingPercentage);
  }
  
  // Castor oil and specialty oils 5-10%
  if (oil.id === "castor-oil" || oil.fatty_acids.ricinoleic > 80) {
    return Math.min(8, remainingPercentage);
  }
  
  // Cleansing oils like coconut 15-25%
  if (oil.fatty_acids.lauric > 40 && needs.includes("cleansing")) {
    return Math.min(20, remainingPercentage);
  }
  
  // Default suggestion
  return Math.min(15, remainingPercentage);
}

/**
 * Calculate predicted impact of adding an oil at a given percentage
 */
function calculatePredictedImpact(
  oil: OilData,
  percentage: number,
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard"
): {
  qualityChanges: { [key in keyof SoapQualities]?: number };
  improvementText: string;
} {
  // Simulate adding this oil
  const testOils: SelectedOil[] = [
    ...context.currentOils,
    { ...oil, percentage, inputMode: "percentage", inputValue: percentage },
  ];
  
  // Normalize percentages
  const total = testOils.reduce((sum, o) => sum + o.percentage, 0);
  const normalizedOils = testOils.map((o) => ({
    ...o,
    percentage: (o.percentage / total) * 100,
  }));
  
  // Calculate projected qualities
  const projectedFattyAcids = calculateFattyAcidProfile(normalizedOils);
  const projectedQualities = calculateSoapQualities(projectedFattyAcids, normalizedOils);
  
  // Calculate changes
  const qualityChanges: { [key in keyof SoapQualities]?: number } = {};
  const improvements: string[] = [];
  const qualityRanges = getQualityRanges(soapType);
  
  const qualityKeys: (keyof SoapQualities)[] = [
    "hardness", "cleansing", "conditioning", "bubbly", "creamy", "iodine", "ins"
  ];
  
  qualityKeys.forEach((quality) => {
    const currentValue = context.currentQualities[quality];
    const projectedValue = projectedQualities[quality];
    const change = projectedValue - currentValue;
    
    if (Math.abs(change) > 1) {
      qualityChanges[quality] = change;
      
      // Check if this brings the value into or closer to ideal range
      const range = qualityRanges[quality];
      if (range.ideal) {
        const currentDistance = Math.min(
          Math.abs(currentValue - range.ideal.min),
          Math.abs(currentValue - range.ideal.max)
        );
        const projectedDistance = Math.min(
          Math.abs(projectedValue - range.ideal.min),
          Math.abs(projectedValue - range.ideal.max)
        );
        
        if (projectedDistance < currentDistance) {
          improvements.push(`${quality} to ${projectedValue}`);
        }
      }
    }
  });
  
  // Generate improvement text
  let improvementText = "";
  if (improvements.length > 0) {
    const topImprovement = improvements[0];
    improvementText = `This will bring ${topImprovement}`;
  } else if (Object.keys(qualityChanges).length > 0) {
    const firstChange = Object.entries(qualityChanges)[0];
    const direction = firstChange[1] > 0 ? "increase" : "decrease";
    improvementText = `Will ${direction} ${firstChange[0]}`;
  }
  
  return { qualityChanges, improvementText };
}

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
  suggestedPercentage: number;
  predictedImpact: string;
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
    const suggestedPercentage = 30; // Start with a good base
    return {
      score,
      reason: "Good starting oil for your recipe",
      suggestedPercentage,
      predictedImpact: "Great base for your soap recipe",
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
    { ...oil, percentage: testPercentage, inputMode: "percentage", inputValue: testPercentage },
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

  // Calculate suggested percentage
  const suggestedPercentage = calculateSuggestedPercentage(oil, context, soapType);
  
  // Calculate predicted impact
  const { improvementText } = calculatePredictedImpact(oil, suggestedPercentage, context, soapType);

  let reason = "Complements your current selection";
  if (improvesQuality.length > 0) {
    reason = `Improves ${improvesQuality[0].replace("_", " ")}`;
  } else if (fillsNeeds.length > 0) {
    reason = `Provides ${fillsNeeds[0].replace("_", " ")}`;
  }

  return {
    score,
    reason,
    suggestedPercentage,
    predictedImpact: improvementText,
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
 * Get fatty acid contributions that are helpful for this oil
 */
function getFattyAcidContributions(
  oil: OilData,
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard"
): FattyAcidContribution[] {
  const contributions: FattyAcidContribution[] = [];
  const needs = identifyRecipeNeeds(context.currentQualities, soapType);

  // Palmitic & Stearic - Hardness
  if ((oil.fatty_acids.palmitic > 20 || oil.fatty_acids.stearic > 5) && needs.includes("hardness") && soapType === "hard") {
    contributions.push({
      acid: "Palmitic + Stearic",
      percentage: oil.fatty_acids.palmitic + oil.fatty_acids.stearic,
      whyHelpful: "Saturated fats crystallize to form solid bar structure",
    });
  }

  // High Oleic - Conditioning or Liquid Soap
  if (oil.fatty_acids.oleic > 50) {
    if (soapType === "liquid") {
      contributions.push({
        acid: "Oleic",
        percentage: oil.fatty_acids.oleic,
        whyHelpful: "Unsaturated fats remain liquid at room temperature, perfect for liquid soap",
      });
    } else if (needs.includes("conditioning")) {
      contributions.push({
        acid: "Oleic",
        percentage: oil.fatty_acids.oleic,
        whyHelpful: "Moisturizes skin without stripping natural oils, similar to skin's sebum",
      });
    }
  }

  // Lauric & Myristic - Cleansing
  if ((oil.fatty_acids.lauric > 30 || oil.fatty_acids.myristic > 5) && needs.includes("cleansing")) {
    contributions.push({
      acid: "Lauric + Myristic",
      percentage: oil.fatty_acids.lauric + oil.fatty_acids.myristic,
      whyHelpful: "Short-chain fatty acids cut through oils effectively, creating cleansing lather",
    });
  }

  // Linoleic - Conditioning
  if (oil.fatty_acids.linoleic > 30 && needs.includes("conditioning")) {
    contributions.push({
      acid: "Linoleic",
      percentage: oil.fatty_acids.linoleic,
      whyHelpful: "Polyunsaturated fat provides lightweight moisturizing properties",
    });
  }

  // Ricinoleic - Bubbly & Creamy
  if (oil.fatty_acids.ricinoleic > 80) {
    if (needs.includes("bubbly_lather")) {
      contributions.push({
        acid: "Ricinoleic",
        percentage: oil.fatty_acids.ricinoleic,
        whyHelpful: "Creates stable bubbles and helps other oils lather better",
      });
    }
    if (needs.includes("creamy_lather")) {
      contributions.push({
        acid: "Ricinoleic",
        percentage: oil.fatty_acids.ricinoleic,
        whyHelpful: "Produces dense, long-lasting foam structure",
      });
    }
  }

  return contributions;
}

/**
 * Calculate quality projections for adding this oil
 */
function calculateQualityProjections(
  oil: OilData,
  percentage: number,
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard"
): QualityProjection[] {
  // Simulate adding this oil
  const testOils: SelectedOil[] = [
    ...context.currentOils,
    { ...oil, percentage, inputMode: "percentage", inputValue: percentage },
  ];
  
  // Normalize percentages
  const total = testOils.reduce((sum, o) => sum + o.percentage, 0);
  const normalizedOils = testOils.map((o) => ({
    ...o,
    percentage: (o.percentage / total) * 100,
  }));
  
  // Calculate projected qualities
  const projectedFattyAcids = calculateFattyAcidProfile(normalizedOils);
  const projectedQualities = calculateSoapQualities(projectedFattyAcids, normalizedOils);
  
  const qualityRanges = getQualityRanges(soapType);
  const projections: QualityProjection[] = [];
  
  const qualityKeys: (keyof SoapQualities)[] = [
    "hardness", "cleansing", "conditioning", "bubbly", "creamy"
  ];
  
  qualityKeys.forEach((quality) => {
    const currentValue = context.currentQualities[quality];
    const projectedValue = projectedQualities[quality];
    const range = qualityRanges[quality];
    
    // Only include if there's a meaningful change
    if (Math.abs(projectedValue - currentValue) > 1) {
      const movesTowardIdeal = range.ideal
        ? isMovingTowardIdeal(currentValue, projectedValue, range.ideal.min, range.ideal.max)
        : isMovingTowardRange(currentValue, projectedValue, range.min, range.max);
      
      projections.push({
        quality,
        current: Math.round(currentValue),
        projected: Math.round(projectedValue),
        range: { min: range.min, max: range.max },
        movesTowardIdeal,
      });
    }
  });
  
  return projections;
}

/**
 * Check if value is moving toward ideal range
 */
function isMovingTowardIdeal(
  current: number,
  projected: number,
  idealMin: number,
  idealMax: number
): boolean {
  const idealMid = (idealMin + idealMax) / 2;
  const currentDistance = Math.abs(current - idealMid);
  const projectedDistance = Math.abs(projected - idealMid);
  return projectedDistance < currentDistance;
}

/**
 * Check if value is moving toward acceptable range
 */
function isMovingTowardRange(
  current: number,
  projected: number,
  min: number,
  max: number
): boolean {
  // If already in range, check if moving toward center
  if (current >= min && current <= max) {
    const mid = (min + max) / 2;
    return Math.abs(projected - mid) < Math.abs(current - mid);
  }
  
  // If below range, improvement is moving up
  if (current < min) return projected > current;
  
  // If above range, improvement is moving down
  return projected < current;
}

/**
 * Identify incompatibility problems
 */
function identifyIncompatibilityProblems(
  oil: OilData,
  context: RecommendationContext,
  projections: QualityProjection[],
  soapType: "hard" | "liquid" = "hard"
): IncompatibilityProblem[] {
  const problems: IncompatibilityProblem[] = [];
  const qualityRanges = getQualityRanges(soapType);

  // Wrong soap type - hard oils in liquid soap
  if (soapType === "liquid") {
    const saturatedFats = oil.fatty_acids.palmitic + oil.fatty_acids.stearic;
    if (saturatedFats > 30) {
      problems.push({
        type: "wrong_soap_type",
        details: `${saturatedFats.toFixed(0)}% palmitic + stearic will solidify in KOH liquid soap`,
        numericIssue: "Saturated fats crystallize in potassium hydroxide solutions",
        visualResult: "Creates waxy chunks or thick paste requiring heat to remain fluid",
      });
    }
  }

  // Wrong soap type - too soft for bars
  if (soapType === "hard") {
    const softFats = oil.fatty_acids.linoleic + oil.fatty_acids.linolenic;
    const hardnessProjection = projections.find(p => p.quality === "hardness");
    if (hardnessProjection && hardnessProjection.projected < qualityRanges.hardness.min) {
      problems.push({
        type: "wrong_soap_type",
        details: `Only ${hardnessProjection.projected} hardness contribution (need ${qualityRanges.hardness.min}+)`,
        numericIssue: `${softFats.toFixed(0)}% linoleic + linolenic makes bars soft and slow-curing`,
        visualResult: "Bars stay soft, deform easily, short shelf life",
      });
    }
  }

  // Pushes quality out of range
  projections.forEach(projection => {
    if (projection.projected > projection.range.max) {
      problems.push({
        type: "pushes_out_of_range",
        details: `Would bring ${projection.quality} to ${projection.projected} (max: ${projection.range.max})`,
        numericIssue: `Exceeds acceptable range by ${Math.round(projection.projected - projection.range.max)} points`,
        visualResult: getOutOfRangeVisualResult(projection.quality, "high"),
      });
    } else if (projection.projected < projection.range.min) {
      problems.push({
        type: "pushes_out_of_range",
        details: `Would bring ${projection.quality} to ${projection.projected} (min: ${projection.range.min})`,
        numericIssue: `Below acceptable range by ${Math.round(projection.range.min - projection.projected)} points`,
        visualResult: getOutOfRangeVisualResult(projection.quality, "low"),
      });
    }
  });

  // DOS risk
  if (oil.fatty_acids.linolenic > 10) {
    problems.push({
      type: "dos_risk",
      details: `${oil.fatty_acids.linolenic.toFixed(0)}% linolenic acid oxidizes rapidly`,
      numericIssue: "Polyunsaturated fats develop rancidity (dreaded orange spots)",
      visualResult: "Orange spots appear within weeks to months",
    });
  }

  // Too similar to existing oils
  const mostSimilarOil = findMostSimilarOil(oil, context.currentOils);
  if (mostSimilarOil && mostSimilarOil.similarity > 0.7) {
    problems.push({
      type: "too_similar",
      details: `Already have ${mostSimilarOil.oil.name} with ${Math.round(mostSimilarOil.similarity * 100)}% similar profile`,
      numericIssue: `Both high in ${getDominantFattyAcid(oil)} (${getFattyAcidValue(oil, getDominantFattyAcid(oil)).toFixed(0)}%)`,
      visualResult: "Duplicates properties without adding variety to recipe balance",
    });
  }

  return problems;
}

/**
 * Get visual result description for out-of-range qualities
 */
function getOutOfRangeVisualResult(quality: string, direction: "high" | "low"): string {
  const descriptions: { [key: string]: { high: string; low: string } } = {
    cleansing: {
      high: "Drying, tight feeling, disrupts skin barrier",
      low: "Doesn't clean effectively, leaves oily residue",
    },
    hardness: {
      high: "Brittle bars that crack, harsh feel",
      low: "Soap won't unmold, stays mushy, dissolves quickly",
    },
    conditioning: {
      high: "May leave greasy residue on skin",
      low: "Strips natural oils, leaves skin feeling tight",
    },
    bubbly: {
      high: "Excessive foam, may be irritating",
      low: "Minimal lather, poor cleansing experience",
    },
    creamy: {
      high: "Too dense, doesn't rinse clean",
      low: "Thin lather, lacks luxurious feel",
    },
  };
  
  return descriptions[quality]?.[direction] || "May affect soap performance";
}

/**
 * Find most similar oil in current selection
 */
function findMostSimilarOil(
  oil: OilData,
  selectedOils: SelectedOil[]
): { oil: SelectedOil; similarity: number } | null {
  if (selectedOils.length === 0) return null;
  
  let mostSimilar = selectedOils[0];
  let maxSimilarity = calculateOilSimilarity(oil, selectedOils[0]);
  
  selectedOils.forEach(selectedOil => {
    const similarity = calculateOilSimilarity(oil, selectedOil);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilar = selectedOil;
    }
  });
  
  return { oil: mostSimilar, similarity: maxSimilarity };
}

/**
 * Get dominant fatty acid name for an oil
 */
function getDominantFattyAcid(oil: OilData): string {
  const fattyAcids = [
    { name: "lauric", value: oil.fatty_acids.lauric },
    { name: "myristic", value: oil.fatty_acids.myristic },
    { name: "palmitic", value: oil.fatty_acids.palmitic },
    { name: "stearic", value: oil.fatty_acids.stearic },
    { name: "ricinoleic", value: oil.fatty_acids.ricinoleic },
    { name: "oleic", value: oil.fatty_acids.oleic },
    { name: "linoleic", value: oil.fatty_acids.linoleic },
    { name: "linolenic", value: oil.fatty_acids.linolenic },
  ];
  
  return fattyAcids.sort((a, b) => b.value - a.value)[0].name;
}

/**
 * Get fatty acid value by name
 */
function getFattyAcidValue(oil: OilData, acidName: string): number {
  return oil.fatty_acids[acidName as keyof FattyAcidProfile] || 0;
}

/**
 * Find better alternatives for incompatible oils
 */
function findBetterAlternatives(
  availableOils: OilData[],
  oil: OilData,
  context: RecommendationContext,
  problems: IncompatibilityProblem[],
  soapType: "hard" | "liquid" = "hard"
): BetterAlternative[] {
  const alternatives: BetterAlternative[] = [];
  const selectedOilIds = new Set(context.currentOils.map(o => o.id));
  
  // Based on the problems, suggest specific alternatives
  problems.forEach(problem => {
    if (problem.type === "wrong_soap_type" && soapType === "liquid") {
      // Suggest high-oleic oils for liquid soap
      const highOleicOils = availableOils.filter(
        o => !selectedOilIds.has(o.id) && o.fatty_acids.oleic > 60 && o.fatty_acids.palmitic + o.fatty_acids.stearic < 20
      );
      
      highOleicOils.slice(0, 2).forEach(alt => {
        alternatives.push({
          oilId: alt.id,
          whyBetter: `${alt.fatty_acids.oleic.toFixed(0)}% oleic acid stays liquid in KOH soap`,
          specificAdvantage: "No crystallization or thickening issues",
        });
      });
    }
    
    if (problem.type === "wrong_soap_type" && soapType === "hard") {
      // Suggest hardening oils for bar soap
      const hardeningOils = availableOils.filter(
        o => !selectedOilIds.has(o.id) && (o.fatty_acids.palmitic > 25 || o.fatty_acids.stearic > 20)
      );
      
      hardeningOils.slice(0, 2).forEach(alt => {
        alternatives.push({
          oilId: alt.id,
          whyBetter: `${(alt.fatty_acids.palmitic + alt.fatty_acids.stearic).toFixed(0)}% palmitic + stearic for bar structure`,
          specificAdvantage: "Creates firm bars that unmold quickly and last longer",
        });
      });
    }
    
    if (problem.type === "too_similar") {
      // Suggest oils with different fatty acid profiles
      const differentOils = availableOils.filter(
        o => !selectedOilIds.has(o.id) && calculateOilSimilarity(oil, o) < 0.5
      );
      
      differentOils.slice(0, 2).forEach(alt => {
        alternatives.push({
          oilId: alt.id,
          whyBetter: "Provides different fatty acid balance for variety",
          specificAdvantage: `Adds ${getDominantFattyAcid(alt)} instead of duplicating ${getDominantFattyAcid(oil)}`,
        });
      });
    }
  });
  
  return alternatives.slice(0, 3); // Max 3 alternatives
}

/**
 * Generate comparative analysis
 */
function generateComparativeAnalysis(
  oil: OilData,
  context: RecommendationContext
): ComparativeAnalysis {
  const analysis: ComparativeAnalysis = {};
  
  // Find most similar oil
  const similarOil = findMostSimilarOil(oil, context.currentOils);
  if (similarOil && similarOil.similarity > 0.5) {
    analysis.similarTo = similarOil.oil.id;
    analysis.overlapPercentage = Math.round(similarOil.similarity * 100);
  }
  
  // Find what this oil does better than current oils
  if (context.currentOils.length > 0) {
    // Compare hardness contribution
    const avgCurrentHardness = context.currentOils.reduce((sum, o) => 
      sum + (o.fatty_acids.palmitic + o.fatty_acids.stearic), 0) / context.currentOils.length;
    const thisHardness = oil.fatty_acids.palmitic + oil.fatty_acids.stearic;
    
    if (thisHardness > avgCurrentHardness + 10) {
      analysis.advantageOver = {
        oilId: "current_average",
        metric: "hardness",
        improvement: Math.round(thisHardness - avgCurrentHardness),
      };
    }
  }
  
  return analysis;
}

/**
 * Generate display copy based on score and data
 */
function generateDisplayCopy(
  availableOils: OilData[],
  oil: OilData,
  score: number,
  fattyAcidContributions: FattyAcidContribution[],
  qualityProjections: QualityProjection[],
  problems: IncompatibilityProblem[],
  betterAlternatives: BetterAlternative[],
  suggestedPercentage: number,
  soapType: "hard" | "liquid" = "hard"
): string {
  // Highly recommended (>70)
  if (score >= 70) {
    const parts: string[] = [];
    
    // Lead with main benefit
    const mainProjection = qualityProjections.find(p => p.movesTowardIdeal);
    if (mainProjection) {
      parts.push(`Brings ${mainProjection.quality} to ${mainProjection.projected} (ideal range)`);
    }
    
    // Add fatty acid detail
    if (fattyAcidContributions.length > 0) {
      const fa = fattyAcidContributions[0];
      parts.push(`${fa.percentage.toFixed(0)}% ${fa.acid.toLowerCase()} • ${fa.whyHelpful}`);
    }
    
    // Add practical benefit
    if (mainProjection?.quality === "hardness") {
      parts.push("Bars will unmold faster and last 3-4 weeks of daily use");
    }
    
    return parts.join(" • ");
  }
  
  // Good match (50-69)
  if (score >= 50) {
    const parts: string[] = [];
    
    // What it adds
    if (fattyAcidContributions.length > 0) {
      const fa = fattyAcidContributions[0];
      parts.push(`Adds ${fa.percentage.toFixed(0)}% ${fa.acid.toLowerCase()} for ${fa.whyHelpful.toLowerCase()}`);
    }
    
    // Caveat
    if (qualityProjections.length > 0) {
      const projection = qualityProjections[0];
      if (!projection.movesTowardIdeal) {
        parts.push(`However, ${projection.quality} moves to ${projection.projected}`);
      }
    }
    
    // Usage tip
    parts.push(`Best at ${suggestedPercentage}% of recipe`);
    
    return parts.join(" • ");
  }
  
  // Neutral (30-49)
  if (score >= 30) {
    const parts: string[] = [];
    
    if (fattyAcidContributions.length > 0) {
      const fa = fattyAcidContributions[0];
      parts.push(`Provides ${fa.percentage.toFixed(0)}% ${fa.acid.toLowerCase()}`);
    }
    
    if (qualityProjections.length > 0) {
      const worsening = qualityProjections.filter(p => !p.movesTowardIdeal);
      if (worsening.length > 0) {
        parts.push(`But ${worsening[0].quality} becomes ${worsening[0].projected} (want ${worsening[0].range.min}-${worsening[0].range.max})`);
      }
    }
    
    parts.push(`Use sparingly, max ${suggestedPercentage}%`);
    
    return parts.join(" • ");
  }
  
  // Incompatible (<30)
  if (problems.length > 0) {
    const problem = problems[0];
    const parts: string[] = [];
    
    parts.push(`⚠️ ${problem.details}`);
    parts.push(problem.visualResult);
    
    if (betterAlternatives.length > 0) {
      const alt = betterAlternatives[0];
      const altOil = availableOils.find(o => o.id === alt.oilId);
      if (altOil) {
        parts.push(`Try ${altOil.name} instead: ${alt.whyBetter}`);
      }
    }
    
    return parts.join(" • ");
  }
  
  return "Not recommended for this recipe";
}

/**
 * Generate detailed recommendation for an oil
 */
function generateRecommendationDetail(
  availableOils: OilData[],
  oil: OilData,
  context: RecommendationContext,
  score: number,
  suggestedPercentage: number,
  soapType: "hard" | "liquid" = "hard"
): RecommendationDetail {
  // Determine score category and color
  let scoreCategory: RecommendationDetail["scoreCategory"];
  let cardColor: RecommendationDetail["cardColor"];
  
  if (score >= 70) {
    scoreCategory = "highly_recommended";
    cardColor = "green";
  } else if (score >= 50) {
    scoreCategory = "good_match";
    cardColor = "blue";
  } else if (score >= 30) {
    scoreCategory = "neutral";
    cardColor = "yellow";
  } else if (score >= 25) {
    scoreCategory = "caution";
    cardColor = "orange";
  } else {
    scoreCategory = "incompatible";
    cardColor = "red";
  }
  
  // Generate all components
  const fattyAcidContributions = getFattyAcidContributions(oil, context, soapType);
  const qualityProjections = calculateQualityProjections(oil, suggestedPercentage, context, soapType);
  const comparativeAnalysis = generateComparativeAnalysis(oil, context);
  const problems = identifyIncompatibilityProblems(oil, context, qualityProjections, soapType);
  const betterAlternatives = problems.length > 0 
    ? findBetterAlternatives(availableOils, oil, context, problems, soapType) 
    : undefined;
  
  // Generate display copy
  const displayCopy = generateDisplayCopy(
    availableOils,
    oil,
    score,
    fattyAcidContributions,
    qualityProjections,
    problems,
    betterAlternatives || [],
    suggestedPercentage,
    soapType
  );
  
  // Generate usage tip
  let usageTip: string | undefined;
  if (score >= 50) {
    if (oil.id === "castor-oil") {
      usageTip = "Keep under 10% - higher amounts make soap sticky";
    } else if (oil.fatty_acids.lauric > 40) {
      usageTip = "15-25% range provides cleansing without being too drying";
    } else if (oil.category === "Hard Oil" || oil.category === "Butter") {
      usageTip = "Use as base oil at 25-40% for bar structure";
    } else if (oil.fatty_acids.oleic > 60) {
      usageTip = "Excellent as main conditioning oil up to 50%";
    }
  }
  
  return {
    score,
    scoreCategory,
    cardColor,
    fattyAcidContributions,
    qualityProjections,
    comparativeAnalysis,
    problems: problems.length > 0 ? problems : undefined,
    betterAlternatives,
    displayCopy,
    suggestedPercentage,
    usageTip,
  };
}

/**
 * Get recommendation detail for a specific oil
 * This can be used for any oil, whether selected, recommended, or just browsing
 */
export function getOilRecommendationDetail(
  availableOils: OilData[],
  oil: OilData,
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard"
): RecommendationDetail {
  const { score, suggestedPercentage } = calculateCompatibilityScore(
    oil,
    context,
    soapType
  );
  
  return generateRecommendationDetail(
    availableOils,
    oil,
    context,
    score,
    suggestedPercentage,
    soapType
  );
}

/**
 * Get recommended oils for the current selection
 * Returns top N recommendations sorted by score
 */
export function getRecommendedOils(
  availableOils: OilData[],
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  maxRecommendations: number = 5
): OilRecommendation[] {
  // Get list of already selected oil IDs
  const selectedOilIds = new Set(context.currentOils.map((oil) => oil.id));

  // Calculate scores for all non-selected oils
  const recommendations: OilRecommendation[] = availableOils.filter(
    (oil) => !selectedOilIds.has(oil.id)
  ).map((oil) => {
    const { score, reason, suggestedPercentage, predictedImpact, factors } = calculateCompatibilityScore(
      oil,
      context,
      soapType
    );
    
    // Generate detailed recommendation
    const detail = generateRecommendationDetail(
      availableOils,
      oil,
      context,
      score,
      suggestedPercentage,
      soapType
    );
    
    return {
      oil,
      score,
      reason,
      suggestedPercentage,
      predictedImpact,
      compatibilityFactors: factors,
      detail,
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
  availableOils: OilData[],
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard",
  threshold: number = 25
): Set<string> {
  const selectedOilIds = new Set(context.currentOils.map((oil) => oil.id));

  const incompatibleIds = new Set<string>();

  availableOils.forEach((oil) => {
    if (selectedOilIds.has(oil.id)) return; // Skip already selected oils

    const { score } = calculateCompatibilityScore(oil, context, soapType);
    if (score < threshold) {
      incompatibleIds.add(oil.id);
    }
  });

  return incompatibleIds;
}

/**
 * Get the reason why an oil is disabled
 */
export function getDisabledReason(
  oil: OilData,
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard"
): string {
  const { reason, factors } = calculateCompatibilityScore(oil, context, soapType);
  
  if (factors.improvesQuality.length === 0 && factors.fillsNeeds.length === 0) {
    return "Cannot achieve ideal ranges with this oil";
  }
  
  return `Low compatibility: ${reason}`;
}

/**
 * Get suggested percentage for a specific oil based on current recipe
 * This works for both selected and unselected oils
 */
export function getSuggestedPercentageForOil(
  oil: OilData,
  context: RecommendationContext,
  soapType: "hard" | "liquid" = "hard"
): number | undefined {
  // Create a temporary context without this oil
  const contextWithoutThisOil = {
    ...context,
    currentOils: context.currentOils.filter(o => o.id !== oil.id),
    currentPercentage: context.currentOils
      .filter(o => o.id !== oil.id)
      .reduce((sum, o) => sum + o.percentage, 0),
  };
  
  // If this is the only oil selected, suggest 100% (they need to add more oils for a balanced recipe)
  if (contextWithoutThisOil.currentOils.length === 0) {
    return 100;
  }
  
  // Recalculate qualities without this oil
  const fattyAcidsWithoutThisOil = calculateFattyAcidProfile(contextWithoutThisOil.currentOils);
  const qualitiesWithoutThisOil = calculateSoapQualities(
    fattyAcidsWithoutThisOil,
    contextWithoutThisOil.currentOils
  );
  
  const updatedContext = {
    ...contextWithoutThisOil,
    currentFattyAcids: fattyAcidsWithoutThisOil,
    currentQualities: qualitiesWithoutThisOil,
  };
  
  return calculateSuggestedPercentage(oil, updatedContext, soapType);
}
