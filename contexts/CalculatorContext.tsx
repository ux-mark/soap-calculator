"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  SelectedOil,
  RecipeInputs,
  CalculationResults,
  OilRecommendation,
  RecommendationContext as RecommendationContextType,
} from "@/lib/types";
import {
  calculateRecipe,
  calculateFattyAcidProfile,
  calculateSoapQualities,
  validateOilPercentages,
  syncOilInputMode,
  recalculateOilsForBatchWeight,
  updateOilInputValue,
} from "@/lib/calculations";
import {
  getRecommendedOils,
  getIncompatibleOils,
} from "@/lib/recommendations";
import { useOils } from "./OilsContext";

interface CalculatorContextValue {
  // State
  selectedOils: SelectedOil[];
  inputs: RecipeInputs;
  results: CalculationResults | null;
  recommendations: OilRecommendation[];
  incompatibleOilIds: Set<string>;
  inspectedOilIds: string[]; // Changed from single ID to array for multi-select

  // Actions
  addOil: (oil: SelectedOil) => void;
  removeOil: (oilId: string) => void;
  updateOilPercentage: (oilId: string, percentage: number) => void;
  updateOilInputValue: (oilId: string, value: number) => void; // New: update input value (% or g)
  updateOilInputMode: (oilId: string, mode: "percentage" | "weight") => void; // New: toggle input mode
  updateBatchWeight: (weight: number) => void; // New: update batch weight
  updateInputs: (newInputs: Partial<RecipeInputs>) => void;
  recalculate: () => void;
  resetCalculator: () => void;
  toggleOilInspection: (oilId: string) => void; // Renamed for clarity
  
  // Validation
  isValid: boolean;
  totalPercentage: number;
  totalWeight: number; // New: total weight of all oils
}

const CalculatorContext = createContext<CalculatorContextValue | undefined>(
  undefined
);

const DEFAULT_INPUTS: RecipeInputs = {
  totalOilWeight: 500,
  totalBatchWeight: 500, // Default batch weight same as oil weight
  unit: "g",
  soapType: "hard",
  lyeType: "NaOH",
  superfatPercentage: 5,
  waterMethod: "water_as_percent_of_oils",
  waterValue: 38,
  fragranceWeight: 0,
};

export function CalculatorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { oils: availableOils } = useOils();
  const [selectedOils, setSelectedOils] = useState<SelectedOil[]>([]);
  const [inputs, setInputs] = useState<RecipeInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [recommendations, setRecommendations] = useState<OilRecommendation[]>(
    []
  );
  const [incompatibleOilIds, setIncompatibleOilIds] = useState<Set<string>>(
    new Set()
  );
  const [inspectedOilIds, setInspectedOilIds] = useState<string[]>([]); // Changed to array

  // Validation
  const validation = validateOilPercentages(selectedOils);

  // Add an oil to the selection
  const addOil = useCallback(
    (oil: SelectedOil) => {
      setSelectedOils((prev) => {
        // Check if oil already exists
        if (prev.find((o) => o.id === oil.id)) {
          return prev;
        }
        // Set default input mode to percentage
        const newOil = {
          ...oil,
          inputMode: "percentage" as const,
          inputValue: oil.percentage,
        };
        return [...prev, newOil];
      });
    },
    []
  );

  // Remove an oil from the selection
  const removeOil = useCallback((oilId: string) => {
    setSelectedOils((prev) => prev.filter((oil) => oil.id !== oilId));
    // Remove from inspection if the removed oil was being inspected
    setInspectedOilIds((prev) => prev.filter((id) => id !== oilId));
  }, []);

  // Update oil percentage
  const updateOilPercentage = useCallback(
    (oilId: string, percentage: number) => {
      setSelectedOils((prev) =>
        prev.map((oil) => {
          if (oil.id === oilId) {
            // Also calculate the weight based on the new percentage
            const weight = (percentage / 100) * inputs.totalBatchWeight;
            return { ...oil, percentage, weight };
          }
          return oil;
        })
      );
    },
    [inputs.totalBatchWeight]
  );

  // Update oil input value (handles both % and weight modes)
  const updateOilInputValueAction = useCallback(
    (oilId: string, value: number) => {
      setSelectedOils((prev) =>
        prev.map((oil) =>
          oil.id === oilId
            ? updateOilInputValue(oil, value, inputs.totalBatchWeight)
            : oil
        )
      );
    },
    [inputs.totalBatchWeight]
  );

  // Update oil input mode (toggle between % and weight)
  const updateOilInputMode = useCallback(
    (oilId: string, mode: "percentage" | "weight") => {
      setSelectedOils((prev) =>
        prev.map((oil) =>
          oil.id === oilId
            ? syncOilInputMode(oil, mode, inputs.totalBatchWeight)
            : oil
        )
      );
    },
    [inputs.totalBatchWeight]
  );

  // Update batch weight and recalculate all oils
  const updateBatchWeight = useCallback((weight: number) => {
    setInputs((prev) => ({ ...prev, totalBatchWeight: weight }));
    setSelectedOils((prev) => recalculateOilsForBatchWeight(prev, weight));
  }, []);

  // Update inputs
  const updateInputs = useCallback((newInputs: Partial<RecipeInputs>) => {
    setInputs((prev) => ({ ...prev, ...newInputs }));
  }, []);

  // Toggle oil inspection (multi-select)
  const toggleOilInspection = useCallback((oilId: string) => {
    setInspectedOilIds((prev) => {
      // If oil is already inspected, remove it
      if (prev.includes(oilId)) {
        return prev.filter((id) => id !== oilId);
      }
      // Otherwise, add it to the inspected list
      return [...prev, oilId];
    });
  }, []);

  // Recalculate results and recommendations
  const recalculate = useCallback(() => {
    if (selectedOils.length === 0) {
      setResults(null);
      setRecommendations([]);
      setIncompatibleOilIds(new Set());
      return;
    }

    // Calculate results (always calculate for recommendations to work)
    const newResults = calculateRecipe(inputs, selectedOils);
    
    // Always set results for recommendation calculations
    // The UI components can check validation.isValid to decide what to display
    setResults(newResults);

    // Update recommendations
    const totalPercentage = selectedOils.reduce(
      (sum, oil) => sum + oil.percentage,
      0
    );

    // Only show recommendations if there's room for more oils (< 50% threshold for dynamic mode)
    if (totalPercentage < 100) {
      const recContext: RecommendationContextType = {
        currentOils: selectedOils,
        currentPercentage: totalPercentage,
        currentQualities: newResults.qualities,
        currentFattyAcids: newResults.fattyAcids,
      };

      const newRecommendations = getRecommendedOils(availableOils, recContext, inputs.soapType, 5);
      setRecommendations(newRecommendations);

      // Get incompatible oils for dynamic mode (when < 50% selected)
      if (totalPercentage < 50) {
        const incompatible = getIncompatibleOils(availableOils, recContext, inputs.soapType, 25);
        setIncompatibleOilIds(incompatible);
      } else {
        setIncompatibleOilIds(new Set());
      }
    } else {
      setRecommendations([]);
      setIncompatibleOilIds(new Set());
    }
  }, [selectedOils, inputs, validation.isValid, availableOils]);

  // Reset calculator
  const resetCalculator = useCallback(() => {
    setSelectedOils([]);
    setInputs(DEFAULT_INPUTS);
    setResults(null);
    setRecommendations([]);
    setIncompatibleOilIds(new Set());
    setInspectedOilIds([]); // Clear all inspections
  }, []);

  // Auto-recalculate when oils or inputs change
  React.useEffect(() => {
    recalculate();
  }, [recalculate]);

  // Calculate total weight
  const totalWeight = selectedOils.reduce((sum, oil) => sum + (oil.weight || 0), 0);

  const value: CalculatorContextValue = {
    selectedOils,
    inputs,
    results,
    recommendations,
    incompatibleOilIds,
    inspectedOilIds,
    addOil,
    removeOil,
    updateOilPercentage,
    updateOilInputValue: updateOilInputValueAction,
    updateOilInputMode,
    updateBatchWeight,
    updateInputs,
    recalculate,
    resetCalculator,
    toggleOilInspection,
    isValid: validation.isValid,
    totalPercentage: validation.totalPercentage,
    totalWeight,
  };

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return context;
}
