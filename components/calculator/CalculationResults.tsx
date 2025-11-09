"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useCalculator } from "@/contexts/CalculatorContext";

export function CalculationResults() {
  const { results, inputs, selectedOils } = useCalculator();

  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recipe Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Complete your oil selection and ensure percentages total 100% to see results.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const recipeData = {
      inputs,
      oils: selectedOils,
      results,
      createdAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(recipeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `soap-recipe-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recipe Results</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipe Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-2">Ingredients</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Oils:</span>
                <span className="font-medium">
                  {results.totalOilWeight} {inputs.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{inputs.lyeType}:</span>
                <span className="font-medium">
                  {results.lyeWeight} {inputs.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Water:</span>
                <span className="font-medium">
                  {results.waterWeight} {inputs.unit}
                </span>
              </div>
              {results.fragranceWeight > 0 && (
                <div className="flex justify-between">
                  <span>Fragrance:</span>
                  <span className="font-medium">
                    {results.fragranceWeight} {inputs.unit}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-2">Settings</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Superfat:</span>
                <span className="font-medium">{inputs.superfatPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Total Batch:</span>
                <span className="font-medium">
                  {results.totalBatchWeight} {inputs.unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Oil Breakdown */}
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-3">Oil Breakdown</h4>
          <div className="space-y-2">
            {results.selectedOils.map((oil) => (
              <div
                key={oil.id}
                className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
              >
                <span className="flex-1">{oil.name}</span>
                <span className="w-16 text-right text-gray-600">
                  {Math.round(oil.percentage * 10) / 10}%
                </span>
                <span className="w-24 text-right font-medium">
                  {oil.weight} {inputs.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-3">
            Basic Instructions
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Weigh all oils accurately and melt hard oils/butters together</li>
            <li>
              Wearing safety gear, carefully mix {results.lyeWeight} {inputs.unit} of{" "}
              {inputs.lyeType} with {results.waterWeight} {inputs.unit} of distilled water
            </li>
            <li>Allow lye solution to cool to 100-110°F (38-43°C)</li>
            <li>Heat oils to 100-110°F (38-43°C)</li>
            <li>
              Slowly pour lye solution into oils and blend with stick blender until
              trace
            </li>
            {results.fragranceWeight > 0 && (
              <li>Add {results.fragranceWeight} {inputs.unit} of fragrance and mix well</li>
            )}
            <li>Pour into molds and insulate for 24-48 hours</li>
            <li>Unmold and cut after 24-48 hours</li>
            <li>Cure for 4-6 weeks in a cool, dry place</li>
          </ol>
        </div>

        {/* Safety Warning */}
        <div className="bg-danger/10 border border-danger/20 rounded-md p-4">
          <h5 className="font-semibold text-sm text-danger mb-2">Safety Warning</h5>
          <p className="text-xs text-gray-700">
            Always wear safety goggles and gloves when handling lye. Work in a
            well-ventilated area. Add lye to water, never water to lye. Keep lye and
            soap batter away from children and pets.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
