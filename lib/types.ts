// Oil data types
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

export interface OilData {
  id: string;
  name: string;
  sap_naoh: number; // Saponification value for NaOH
  sap_koh: number;  // Saponification value for KOH
  fatty_acids: FattyAcidProfile;
  iodine: number;
  ins: number;
  category?: string; // e.g., "Hard Oil", "Soft Oil", "Liquid Oil", "Butter"
}

export interface SelectedOil extends OilData {
  percentage: number;
  weight?: number;
  isInspecting?: boolean; // UI state for oil inspection feature
}

// Soap quality metrics
export interface SoapQualities {
  hardness: number;
  cleansing: number;
  conditioning: number;
  bubbly: number;
  creamy: number;
  iodine: number;
  ins: number;
}

export interface QualityRange {
  min: number;
  max: number;
  ideal?: { min: number; max: number };
}

export interface QualityRanges {
  hardness: QualityRange;
  cleansing: QualityRange;
  conditioning: QualityRange;
  bubbly: QualityRange;
  creamy: QualityRange;
  iodine: QualityRange;
  ins: QualityRange;
}

// Recipe data
export interface RecipeInputs {
  totalOilWeight: number;
  unit: "g" | "oz" | "lb";
  soapType: "hard" | "liquid";
  lyeType: "NaOH" | "KOH";
  superfatPercentage: number;
  waterMethod: "water_as_percent_of_oils" | "lye_concentration" | "water_to_lye_ratio";
  waterValue: number;
  fragranceWeight: number;
}

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

export interface SavedRecipe {
  id: string;
  name: string;
  description?: string;
  inputs: RecipeInputs;
  selectedOils: SelectedOil[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

// Recommendation system
export interface FattyAcidContribution {
  acid: string;
  percentage: number;
  whyHelpful: string;
}

export interface QualityProjection {
  quality: string;
  current: number;
  projected: number;
  range: { min: number; max: number };
  movesTowardIdeal: boolean;
}

export interface IncompatibilityProblem {
  type: "wrong_soap_type" | "too_similar" | "pushes_out_of_range" | "dos_risk";
  details: string;
  numericIssue: string;
  visualResult: string;
}

export interface BetterAlternative {
  oilId: string;
  whyBetter: string;
  specificAdvantage: string;
}

export interface ComparativeAnalysis {
  similarTo?: string; // oil ID
  overlapPercentage?: number;
  advantageOver?: {
    oilId: string;
    metric: string;
    improvement: number;
  };
}

export interface RecommendationDetail {
  score: number;
  scoreCategory: "highly_recommended" | "good_match" | "neutral" | "caution" | "incompatible";
  cardColor: "green" | "blue" | "yellow" | "orange" | "red";
  
  // Specific chemistry
  fattyAcidContributions: FattyAcidContribution[];
  
  // Numeric projections
  qualityProjections: QualityProjection[];
  
  // Comparisons
  comparativeAnalysis: ComparativeAnalysis;
  
  // Specific incompatibilities
  problems?: IncompatibilityProblem[];
  
  // Concrete alternatives
  betterAlternatives?: BetterAlternative[];
  
  // Generated sentence
  displayCopy: string;
  
  // Additional metadata
  suggestedPercentage: number;
  usageTip?: string;
}

export interface OilRecommendation {
  oil: OilData;
  score: number;
  reason: string;
  suggestedPercentage: number;
  predictedImpact: string;
  compatibilityFactors: {
    complementsFattyAcids: boolean;
    improvesQuality: string[];
    fillsNeeds: string[];
  };
  // Enhanced details
  detail?: RecommendationDetail;
}

export interface RecommendationContext {
  currentOils: SelectedOil[];
  currentPercentage: number;
  currentQualities: SoapQualities;
  currentFattyAcids: FattyAcidProfile;
  targetQualities?: Partial<SoapQualities>;
}
