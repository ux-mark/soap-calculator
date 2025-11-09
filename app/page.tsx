"use client";

import { CalculatorProvider } from "@/contexts/CalculatorContext";
import { InputSection } from "@/components/calculator/InputSection";
import { SelectedOilsList } from "@/components/calculator/SelectedOilsList";
import { OilSelector } from "@/components/calculator/OilSelector";
import { QualityDisplay, FattyAcidDisplay } from "@/components/calculator/QualityDisplay";
import { CalculationResults } from "@/components/calculator/CalculationResults";
import { useCalculator } from "@/contexts/CalculatorContext";

function CalculatorContent() {
  const { results } = useCalculator();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Intelligent Soap Formulation Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create optimal soap recipes with data-driven guidance and smart recommendations
          </p>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Inputs and Selected Oils */}
          <div className="space-y-6">
            <InputSection />
            <SelectedOilsList />
          </div>

          {/* Middle Column - Oil Selector */}
          <div className="lg:col-span-2">
            <OilSelector />
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <CalculationResults />
            </div>
            <div>
              <QualityDisplay 
                qualities={results.qualities} 
                fattyAcids={results.fattyAcids}
              />
            </div>
            <div>
              <FattyAcidDisplay fattyAcids={results.fattyAcids} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <CalculatorProvider>
      <CalculatorContent />
    </CalculatorProvider>
  );
}

