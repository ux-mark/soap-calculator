"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, AlertCircle } from "lucide-react";
import { useCalculator } from "@/contexts/CalculatorContext";

export function SelectedOilsList() {
  const {
    selectedOils,
    removeOil,
    updateOilPercentage,
    totalPercentage,
    isValid,
  } = useCalculator();

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
          {selectedOils.map((oil) => (
            <div
              key={oil.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm truncate">{oil.name}</h5>
                {oil.category && (
                  <p className="text-xs text-gray-500">{oil.category}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
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
          ))}
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
        </div>
      </CardContent>
    </Card>
  );
}
