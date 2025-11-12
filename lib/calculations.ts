import {
  FattyAcidProfile,
  SoapQualities,
  SelectedOil,
  RecipeInputs,
  CalculationResults,
  QualityRanges,
} from "./types";

// Quality ranges for HARD (BAR) SOAP based on SoapCalc standards
export const HARD_SOAP_QUALITY_RANGES: QualityRanges = {
  hardness: { min: 29, max: 54, ideal: { min: 29, max: 54 } },
  cleansing: { min: 12, max: 22, ideal: { min: 12, max: 22 } },
  conditioning: { min: 44, max: 69, ideal: { min: 44, max: 69 } },
  bubbly: { min: 14, max: 46, ideal: { min: 14, max: 46 } },
  creamy: { min: 16, max: 48, ideal: { min: 16, max: 48 } },
  iodine: { min: 41, max: 70, ideal: { min: 41, max: 70 } },
  ins: { min: 136, max: 165, ideal: { min: 136, max: 165 } },
};

// Quality ranges for LIQUID SOAP based on specialized formulation requirements
export const LIQUID_SOAP_QUALITY_RANGES: QualityRanges = {
  hardness: { min: 5, max: 15, ideal: { min: 8, max: 12 } },
  cleansing: { min: 10, max: 20, ideal: { min: 12, max: 16 } },
  conditioning: { min: 65, max: 80, ideal: { min: 72, max: 77 } },
  bubbly: { min: 5, max: 12, ideal: { min: 7, max: 10 } },
  creamy: { min: 50, max: 70, ideal: { min: 58, max: 65 } },
  iodine: { min: 65, max: 85, ideal: { min: 72, max: 78 } },
  ins: { min: 70, max: 90, ideal: { min: 78, max: 85 } },
};

// Legacy export for backward compatibility - defaults to hard soap
export const QUALITY_RANGES = HARD_SOAP_QUALITY_RANGES;

/**
 * Get quality ranges based on soap type
 */
export function getQualityRanges(soapType: "hard" | "liquid"): QualityRanges {
  return soapType === "liquid" ? LIQUID_SOAP_QUALITY_RANGES : HARD_SOAP_QUALITY_RANGES;
}

/**
 * Calculate weighted average fatty acid profile from selected oils
 */
export function calculateFattyAcidProfile(
  selectedOils: SelectedOil[]
): FattyAcidProfile {
  const totalPercentage = selectedOils.reduce(
    (sum, oil) => sum + oil.percentage,
    0
  );

  if (totalPercentage === 0) {
    return {
      lauric: 0,
      myristic: 0,
      palmitic: 0,
      stearic: 0,
      ricinoleic: 0,
      oleic: 0,
      linoleic: 0,
      linolenic: 0,
    };
  }

  const weightedFattyAcids = selectedOils.reduce(
    (acc, oil) => {
      const weight = oil.percentage / totalPercentage;
      return {
        lauric: acc.lauric + oil.fatty_acids.lauric * weight,
        myristic: acc.myristic + oil.fatty_acids.myristic * weight,
        palmitic: acc.palmitic + oil.fatty_acids.palmitic * weight,
        stearic: acc.stearic + oil.fatty_acids.stearic * weight,
        ricinoleic: acc.ricinoleic + oil.fatty_acids.ricinoleic * weight,
        oleic: acc.oleic + oil.fatty_acids.oleic * weight,
        linoleic: acc.linoleic + oil.fatty_acids.linoleic * weight,
        linolenic: acc.linolenic + oil.fatty_acids.linolenic * weight,
      };
    },
    {
      lauric: 0,
      myristic: 0,
      palmitic: 0,
      stearic: 0,
      ricinoleic: 0,
      oleic: 0,
      linoleic: 0,
      linolenic: 0,
    }
  );

  return weightedFattyAcids;
}

/**
 * Calculate soap qualities from fatty acid profile
 * Based on SoapCalc formulas
 */
export function calculateSoapQualities(
  fattyAcids: FattyAcidProfile,
  selectedOils: SelectedOil[]
): SoapQualities {
  // Hardness = Lauric + Myristic + Palmitic + Stearic
  const hardness =
    fattyAcids.lauric +
    fattyAcids.myristic +
    fattyAcids.palmitic +
    fattyAcids.stearic;

  // Cleansing = Lauric + Myristic
  const cleansing = fattyAcids.lauric + fattyAcids.myristic;

  // Conditioning = Oleic + Linoleic + Linolenic + Ricinoleic
  const conditioning =
    fattyAcids.oleic +
    fattyAcids.linoleic +
    fattyAcids.linolenic +
    fattyAcids.ricinoleic;

  // Bubbly = Lauric + Myristic + Ricinoleic
  const bubbly = fattyAcids.lauric + fattyAcids.myristic + fattyAcids.ricinoleic;

  // Creamy = Palmitic + Stearic + Ricinoleic
  const creamy =
    fattyAcids.palmitic + fattyAcids.stearic + fattyAcids.ricinoleic;

  // Calculate weighted iodine value
  const totalPercentage = selectedOils.reduce(
    (sum, oil) => sum + oil.percentage,
    0
  );
  const iodine =
    totalPercentage > 0
      ? selectedOils.reduce(
          (sum, oil) => sum + (oil.iodine * oil.percentage) / totalPercentage,
          0
        )
      : 0;

  // Calculate weighted INS value
  const ins =
    totalPercentage > 0
      ? selectedOils.reduce(
          (sum, oil) => sum + (oil.ins * oil.percentage) / totalPercentage,
          0
        )
      : 0;

  return {
    hardness: Math.round(hardness),
    cleansing: Math.round(cleansing),
    conditioning: Math.round(conditioning),
    bubbly: Math.round(bubbly),
    creamy: Math.round(creamy),
    iodine: Math.round(iodine),
    ins: Math.round(ins),
  };
}

/**
 * Calculate lye weight needed for saponification
 */
export function calculateLyeWeight(
  selectedOils: SelectedOil[],
  lyeType: "NaOH" | "KOH",
  superfatPercentage: number
): number {
  const sapKey = lyeType === "NaOH" ? "sap_naoh" : "sap_koh";

  const totalLyeBeforeSuperfat = selectedOils.reduce((sum, oil) => {
    const oilWeight = oil.weight || 0;
    const sapValue = oil[sapKey];
    return sum + oilWeight * sapValue;
  }, 0);

  // Apply superfat discount
  const lyeWeight = totalLyeBeforeSuperfat * (1 - superfatPercentage / 100);

  return Math.round(lyeWeight * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate water weight based on selected method
 */
export function calculateWaterWeight(
  totalOilWeight: number,
  lyeWeight: number,
  method: "water_as_percent_of_oils" | "lye_concentration" | "water_to_lye_ratio",
  value: number
): number {
  let waterWeight = 0;

  switch (method) {
    case "water_as_percent_of_oils":
      // Water as percentage of oils (default 38%)
      waterWeight = (totalOilWeight * value) / 100;
      break;
    case "lye_concentration":
      // Lye concentration percentage
      // lyeConcentration = lye / (lye + water) * 100
      // Solving for water: water = lye * (100 / lyeConcentration - 1)
      waterWeight = lyeWeight * (100 / value - 1);
      break;
    case "water_to_lye_ratio":
      // Water to lye ratio (e.g., 2:1)
      waterWeight = lyeWeight * value;
      break;
  }

  return Math.round(waterWeight * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert weight units
 */
export function convertWeight(
  weight: number,
  fromUnit: "g" | "oz" | "lb",
  toUnit: "g" | "oz" | "lb"
): number {
  if (fromUnit === toUnit) return weight;

  // Convert to grams first
  let grams = weight;
  if (fromUnit === "oz") grams = weight * 28.3495;
  if (fromUnit === "lb") grams = weight * 453.592;

  // Convert to target unit
  if (toUnit === "g") return grams;
  if (toUnit === "oz") return grams / 28.3495;
  if (toUnit === "lb") return grams / 453.592;

  return weight;
}

/**
 * Distribute total oil weight among selected oils based on percentages
 */
export function calculateOilWeights(
  selectedOils: SelectedOil[],
  totalOilWeight: number
): SelectedOil[] {
  return selectedOils.map((oil) => ({
    ...oil,
    weight: Math.round((totalOilWeight * oil.percentage) / 100 * 100) / 100,
  }));
}

/**
 * Validate that oil percentages sum to 100
 */
export function validateOilPercentages(selectedOils: SelectedOil[]): {
  isValid: boolean;
  totalPercentage: number;
} {
  const totalPercentage = selectedOils.reduce(
    (sum, oil) => sum + oil.percentage,
    0
  );

  return {
    isValid: Math.abs(totalPercentage - 100) < 0.01, // Allow for tiny floating point errors
    totalPercentage: Math.round(totalPercentage * 100) / 100,
  };
}

/**
 * Calculate complete recipe results
 */
export function calculateRecipe(
  inputs: RecipeInputs,
  selectedOils: SelectedOil[]
): CalculationResults {
  // Ensure oil weights are calculated
  const oilsWithWeights = calculateOilWeights(
    selectedOils,
    inputs.totalOilWeight
  );

  // Calculate fatty acid profile
  const fattyAcids = calculateFattyAcidProfile(oilsWithWeights);

  // Calculate soap qualities
  const qualities = calculateSoapQualities(fattyAcids, oilsWithWeights);

  // Calculate lye weight
  const lyeWeight = calculateLyeWeight(
    oilsWithWeights,
    inputs.lyeType,
    inputs.superfatPercentage
  );

  // Calculate water weight
  const waterWeight = calculateWaterWeight(
    inputs.totalOilWeight,
    lyeWeight,
    inputs.waterMethod,
    inputs.waterValue
  );

  // Calculate total batch weight
  const totalBatchWeight =
    inputs.totalOilWeight +
    lyeWeight +
    waterWeight +
    inputs.fragranceWeight;

  return {
    selectedOils: oilsWithWeights,
    totalOilWeight: inputs.totalOilWeight,
    lyeWeight,
    waterWeight,
    fragranceWeight: inputs.fragranceWeight,
    totalBatchWeight: Math.round(totalBatchWeight * 100) / 100,
    qualities,
    fattyAcids,
  };
}

/**
 * Get quality status (below, in-range, above, ideal)
 */
export function getQualityStatus(
  quality: keyof SoapQualities,
  value: number,
  soapType: "hard" | "liquid" = "hard"
): "below" | "in-range" | "above" | "ideal" {
  const ranges = getQualityRanges(soapType);
  const range = ranges[quality];

  if (range.ideal && value >= range.ideal.min && value <= range.ideal.max) {
    return "ideal";
  }

  if (value < range.min) return "below";
  if (value > range.max) return "above";
  return "in-range";
}

/**
 * Calculate percentage of quality value within its range
 */
export function getQualityPercentage(
  quality: keyof SoapQualities,
  value: number,
  soapType: "hard" | "liquid" = "hard"
): number {
  const ranges = getQualityRanges(soapType);
  const range = ranges[quality];
  const percentage = ((value - range.min) / (range.max - range.min)) * 100;
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Calculate individual oil's contribution to soap qualities
 * Shows how a single oil contributes to the overall formula
 */
export function calculateIndividualOilContribution(
  oil: SelectedOil,
  totalPercentage: number = 100
): {
  qualities: SoapQualities;
  fattyAcids: FattyAcidProfile;
} {
  // Create a "virtual" oil that represents this oil's weighted contribution
  // Scale the oil's properties by its percentage in the formula
  const weight = oil.percentage / totalPercentage;
  
  const scaledFattyAcids: FattyAcidProfile = {
    lauric: oil.fatty_acids.lauric * weight,
    myristic: oil.fatty_acids.myristic * weight,
    palmitic: oil.fatty_acids.palmitic * weight,
    stearic: oil.fatty_acids.stearic * weight,
    ricinoleic: oil.fatty_acids.ricinoleic * weight,
    oleic: oil.fatty_acids.oleic * weight,
    linoleic: oil.fatty_acids.linoleic * weight,
    linolenic: oil.fatty_acids.linolenic * weight,
  };

  // Calculate qualities from the scaled fatty acids
  const qualities = calculateSoapQualities(scaledFattyAcids, [
    { ...oil, percentage: oil.percentage * weight }
  ]);

  return {
    qualities,
    fattyAcids: scaledFattyAcids,
  };
}

/**
 * Convert percentage to weight (grams)
 * Formula: grams = (percentage / 100) × totalBatchWeight
 */
export function percentageToWeight(
  percentage: number,
  totalBatchWeight: number
): number {
  return Math.round((percentage / 100) * totalBatchWeight * 100) / 100;
}

/**
 * Convert weight (grams) to percentage
 * Formula: percentage = (grams / totalBatchWeight) × 100
 */
export function weightToPercentage(
  weight: number,
  totalBatchWeight: number
): number {
  if (totalBatchWeight === 0) return 0;
  return Math.round((weight / totalBatchWeight) * 100 * 10) / 10;
}

/**
 * Sync oil values when switching input modes
 * Converts between percentage and weight based on the new mode
 */
export function syncOilInputMode(
  oil: SelectedOil,
  newMode: "percentage" | "weight",
  totalBatchWeight: number
): SelectedOil {
  if (newMode === "weight") {
    // Switching to weight mode: calculate weight from percentage
    const weight = percentageToWeight(oil.percentage, totalBatchWeight);
    return {
      ...oil,
      inputMode: "weight",
      inputValue: weight,
      weight: weight,
    };
  } else {
    // Switching to percentage mode: calculate percentage from weight
    const percentage = weightToPercentage(oil.weight || 0, totalBatchWeight);
    return {
      ...oil,
      inputMode: "percentage",
      inputValue: percentage,
      percentage: percentage,
    };
  }
}

/**
 * Recalculate all oils when batch weight changes
 * Updates weights for oils in weight mode, keeps percentages for oils in percentage mode
 */
export function recalculateOilsForBatchWeight(
  oils: SelectedOil[],
  newBatchWeight: number
): SelectedOil[] {
  return oils.map((oil) => {
    if (oil.inputMode === "weight") {
      // In weight mode: recalculate percentage from weight
      const percentage = weightToPercentage(oil.inputValue, newBatchWeight);
      return {
        ...oil,
        percentage: percentage,
        weight: oil.inputValue,
      };
    } else {
      // In percentage mode: recalculate weight from percentage
      const weight = percentageToWeight(oil.percentage, newBatchWeight);
      return {
        ...oil,
        weight: weight,
      };
    }
  });
}

/**
 * Update oil's input value and sync percentage/weight
 */
export function updateOilInputValue(
  oil: SelectedOil,
  newValue: number,
  totalBatchWeight: number
): SelectedOil {
  if (oil.inputMode === "weight") {
    // User is entering weight: calculate percentage
    const percentage = weightToPercentage(newValue, totalBatchWeight);
    return {
      ...oil,
      inputValue: newValue,
      weight: newValue,
      percentage: percentage,
    };
  } else {
    // User is entering percentage: calculate weight
    const weight = percentageToWeight(newValue, totalBatchWeight);
    return {
      ...oil,
      inputValue: newValue,
      percentage: newValue,
      weight: weight,
    };
  }
}


