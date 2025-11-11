"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, AlertCircle, Lightbulb } from "lucide-react";
import { useCalculator } from "@/contexts/CalculatorContext";
import { getSuggestedPercentageForOil } from "@/lib/recommendations";

export function SelectedOilsList() {
  const {
    selectedOils,
    removeOil,
    updateOilPercentage,
    totalPercentage,
    isValid,
    recommendations,
    results,
    inputs,
    inspectedOilIds,
    toggleOilInspection,
  } = useCalculator();

  // Calculate suggested percentages for ALL selected oils
  const suggestedPercentages = useMemo(() => {
    const map = new Map<string, number>();
    
    // If we have results, calculate suggestions for each selected oil
    if (results && selectedOils.length > 0) {
      const context = {
        currentOils: selectedOils,
        currentPercentage: totalPercentage,
        currentQualities: results.qualities,
        currentFattyAcids: results.fattyAcids,
      };
      
      selectedOils.forEach((oil) => {
        const suggested = getSuggestedPercentageForOil(oil, context, inputs.soapType);
        if (suggested !== undefined) {
          map.set(oil.id, Math.round(suggested * 10) / 10);
        }
      });
    }
    
    return map;
  }, [selectedOils, results, totalPercentage, inputs.soapType]);

  if (selectedOils.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selected Oils</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No oils selected. Choose oils from the selector below to begin creating your recipe.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Selected Oils</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isValid ? "success" : "warning"}>
              Total: {Math.round(totalPercentage * 10) / 10}%
            </Badge>
            {!isValid && (
              <AlertCircle className="h-4 w-4 text-warning" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Message */}
        {!isValid && (
          <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
            <p className="text-sm text-warning">
              {totalPercentage < 100
                ? `Oil percentages must total 100%. Currently at ${Math.round(totalPercentage * 10) / 10}%. Add ${Math.round((100 - totalPercentage) * 10) / 10}% more.`
                : `Oil percentages exceed 100%. Currently at ${Math.round(totalPercentage * 10) / 10}%. Reduce by ${Math.round((totalPercentage - 100) * 10) / 10}%.`}
            </p>
          </div>
        )}

        {/* Oil List */}
        <div className="space-y-3">
          {selectedOils.map((oil) => {
            const suggestedPercentage = suggestedPercentages.get(oil.id);
            const hasSuggestion = suggestedPercentage !== undefined;
            const isInspected = inspectedOilIds.includes(oil.id);
            
            return (
              <div
                key={oil.id}
                onClick={() => toggleOilInspection(oil.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleOilInspection(oil.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isInspected}
                aria-label={`${isInspected ? "Currently comparing" : "Click to compare"} ${oil.name}`}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                  ${isInspected 
                    ? "bg-blue-100 border-2 border-blue-500 shadow-md" 
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-300"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-sm truncate">{oil.name}</h5>
                    {hasSuggestion && (
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {suggestedPercentage}%
                      </Badge>
                    )}
                    {isInspected && (
                      <Badge className="text-xs bg-blue-600 text-white">
                        Comparing
                      </Badge>
                    )}
                  </div>
                  {oil.category && (
                    <p className="text-xs text-gray-500">{oil.category}</p>
                  )}
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="w-24">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={oil.percentage}
                        onChange={(e) =>
                          updateOilPercentage(
                            oil.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="text-sm h-8"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </div>

                  {hasSuggestion && oil.percentage !== suggestedPercentage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateOilPercentage(oil.id, suggestedPercentage)}
                      className="h-8 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
                      title={`Use suggested ${suggestedPercentage}%`}
                    >
                      Use
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOil(oil.id)}
                    className="h-8 w-8 text-gray-400 hover:text-danger"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Auto-distribute percentages equally
              const equalPercentage = 100 / selectedOils.length;
              selectedOils.forEach((oil) => {
                updateOilPercentage(oil.id, equalPercentage);
              });
            }}
          >
            Distribute Equally
          </Button>
          
          {/* Show "Use All Suggestions" button if any oils have suggestions */}
          {selectedOils.some(oil => suggestedPercentages.has(oil.id)) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selectedOils.forEach((oil) => {
                  const suggested = suggestedPercentages.get(oil.id);
                  if (suggested !== undefined) {
                    updateOilPercentage(oil.id, suggested);
                  }
                });
              }}
              className="text-green-700 border-green-300 hover:bg-green-50"
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Use All Suggestions
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
