"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCalculator } from "@/contexts/CalculatorContext";

export function InputSection() {
  const { inputs, updateInputs } = useCalculator();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recipe Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Soap Type Selector */}
        <div className="space-y-2">
          <Label htmlFor="soapType">Soap Type</Label>
          <Select
            value={inputs.soapType}
            onValueChange={(value: "hard" | "liquid") => {
              // Auto-adjust lye type based on soap type
              const newLyeType = value === "liquid" ? "KOH" : "NaOH";
              updateInputs({ soapType: value, lyeType: newLyeType });
            }}
          >
            <SelectTrigger id="soapType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hard">Hard Soap (Bar Soap)</SelectItem>
              <SelectItem value="liquid">Liquid Soap</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {inputs.soapType === "hard"
              ? "Traditional bar soap - requires different oil ratios for hardness"
              : "Liquid/cream soap - needs higher conditioning and lower hardness"}
          </p>
        </div>

        {/* Total Oil Weight */}
        <div className="space-y-2">
          <Label htmlFor="totalOilWeight">Total Oil Weight</Label>
          <div className="flex gap-2">
            <Input
              id="totalOilWeight"
              type="number"
              min="0"
              step="1"
              value={inputs.totalOilWeight}
              onChange={(e) =>
                updateInputs({ totalOilWeight: parseFloat(e.target.value) || 0 })
              }
              className="flex-1"
            />
            <Select
              value={inputs.unit}
              onValueChange={(value: "g" | "oz" | "lb") =>
                updateInputs({ unit: value })
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="oz">oz</SelectItem>
                <SelectItem value="lb">lb</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lye Type */}
        <div className="space-y-2">
          <Label htmlFor="lyeType">Lye Type</Label>
          <Select
            value={inputs.lyeType}
            onValueChange={(value: "NaOH" | "KOH") =>
              updateInputs({ lyeType: value })
            }
          >
            <SelectTrigger id="lyeType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NaOH">NaOH (Sodium Hydroxide)</SelectItem>
              <SelectItem value="KOH">KOH (Potassium Hydroxide)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {inputs.lyeType === "NaOH" 
              ? "Recommended for hard bar soap" 
              : "Recommended for liquid soap"}
            {inputs.soapType === "hard" && inputs.lyeType === "KOH" && (
              <span className="text-warning"> ⚠️ KOH typically makes softer soap</span>
            )}
            {inputs.soapType === "liquid" && inputs.lyeType === "NaOH" && (
              <span className="text-warning"> ⚠️ NaOH is uncommon for liquid soap</span>
            )}
          </p>
        </div>

        {/* Superfat Percentage */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="superfat">Superfat</Label>
            <span className="text-sm font-medium">{inputs.superfatPercentage}%</span>
          </div>
          <Slider
            id="superfat"
            min={0}
            max={20}
            step={1}
            value={[inputs.superfatPercentage]}
            onValueChange={(value) =>
              updateInputs({ superfatPercentage: value[0] })
            }
          />
          <p className="text-xs text-gray-500">
            Recommended: 5-8% for most soaps
          </p>
        </div>

        {/* Water Calculation Method */}
        <div className="space-y-2">
          <Label htmlFor="waterMethod">Water Calculation Method</Label>
          <Select
            value={inputs.waterMethod}
            onValueChange={(
              value: "water_as_percent_of_oils" | "lye_concentration" | "water_to_lye_ratio"
            ) => {
              updateInputs({ waterMethod: value });
              // Set default values for each method
              if (value === "water_as_percent_of_oils") {
                updateInputs({ waterValue: 38 });
              } else if (value === "lye_concentration") {
                updateInputs({ waterValue: 33 });
              } else if (value === "water_to_lye_ratio") {
                updateInputs({ waterValue: 2 });
              }
            }}
          >
            <SelectTrigger id="waterMethod">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="water_as_percent_of_oils">
                Water as % of Oils
              </SelectItem>
              <SelectItem value="lye_concentration">
                Lye Concentration
              </SelectItem>
              <SelectItem value="water_to_lye_ratio">
                Water to Lye Ratio
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Water Value */}
        <div className="space-y-2">
          <Label htmlFor="waterValue">
            {inputs.waterMethod === "water_as_percent_of_oils" && "Water Percentage"}
            {inputs.waterMethod === "lye_concentration" && "Lye Concentration"}
            {inputs.waterMethod === "water_to_lye_ratio" && "Water to Lye Ratio"}
          </Label>
          <Input
            id="waterValue"
            type="number"
            min="0"
            step="0.1"
            value={inputs.waterValue}
            onChange={(e) =>
              updateInputs({ waterValue: parseFloat(e.target.value) || 0 })
            }
          />
          <p className="text-xs text-gray-500">
            {inputs.waterMethod === "water_as_percent_of_oils" &&
              "Default: 38% (typical range: 33-38%)"}
            {inputs.waterMethod === "lye_concentration" &&
              "Default: 33% (typical range: 28-40%)"}
            {inputs.waterMethod === "water_to_lye_ratio" &&
              "Default: 2:1 (typical range: 1.5:1 to 3:1)"}
          </p>
        </div>

        {/* Fragrance Weight */}
        <div className="space-y-2">
          <Label htmlFor="fragranceWeight">
            Fragrance/Essential Oil Weight ({inputs.unit})
          </Label>
          <Input
            id="fragranceWeight"
            type="number"
            min="0"
            step="0.1"
            value={inputs.fragranceWeight}
            onChange={(e) =>
              updateInputs({ fragranceWeight: parseFloat(e.target.value) || 0 })
            }
          />
          <p className="text-xs text-gray-500">
            Typical: 3-6% of total oil weight (
            {Math.round(inputs.totalOilWeight * 0.03 * 10) / 10}-
            {Math.round(inputs.totalOilWeight * 0.06 * 10) / 10} {inputs.unit})
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
