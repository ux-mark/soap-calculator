"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Lock, TrendingUp } from "lucide-react";
import { OilData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface OilTileProps {
  oil: OilData;
  isSelected: boolean;
  isRecommended: boolean;
  isDisabled: boolean;
  recommendationReason?: string;
  suggestedPercentage?: number;
  predictedImpact?: string;
  disabledReason?: string;
  recommendationScore?: number;
  onSelect: () => void;
  onQuickAdd?: (percentage: number) => void;
}

export function OilTile({
  oil,
  isSelected,
  isRecommended,
  isDisabled,
  recommendationReason,
  suggestedPercentage,
  predictedImpact,
  disabledReason,
  recommendationScore = 0,
  onSelect,
  onQuickAdd,
}: OilTileProps) {
  // Determine recommendation tier (for badge colors)
  const isHighlyRecommended = recommendationScore >= 70;
  const isGoodMatch = recommendationScore >= 50 && recommendationScore < 70;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5",
        isHighlyRecommended && !isSelected && "ring-2 ring-green-500 border-green-500 bg-green-50/50",
        isGoodMatch && !isSelected && "ring-2 ring-blue-500 border-blue-500 bg-blue-50/50",
        isDisabled && "opacity-50 cursor-not-allowed hover:shadow-none bg-gray-100",
        !isSelected && !isRecommended && !isDisabled && "hover:border-gray-400"
      )}
      onClick={() => {
        if (!isDisabled && !isSelected) {
          onSelect();
        }
      }}
      title={isDisabled ? disabledReason : undefined}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Highly Recommended Badge */}
      {isHighlyRecommended && !isSelected && (
        <div className="absolute top-2 left-2 right-2">
          <Badge className="bg-green-600 text-white text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Highly Recommended
          </Badge>
        </div>
      )}

      {/* Good Match Badge */}
      {isGoodMatch && !isSelected && (
        <div className="absolute top-2 left-2 right-2">
          <Badge className="bg-blue-600 text-white text-xs">
            Good Match
          </Badge>
        </div>
      )}

      {/* Disabled Indicator */}
      {isDisabled && (
        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1" 
             title={disabledReason}>
          <Lock className="h-3 w-3" />
        </div>
      )}

      <div className={cn(
        "p-4 space-y-2",
        (isHighlyRecommended || isGoodMatch) && !isSelected && "pt-8"
      )}>
        {/* Oil Name with Suggested Percentage for Selected Oils */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm leading-tight">{oil.name}</h4>
          {isSelected && suggestedPercentage !== undefined && (
            <Badge 
              variant="outline" 
              className="text-xs bg-green-50 text-green-700 border-green-200 flex-shrink-0"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {suggestedPercentage}%
            </Badge>
          )}
        </div>

        {/* Category Badge */}
        {oil.category && (
          <Badge variant="outline" className="text-xs">
            {oil.category}
          </Badge>
        )}

        {/* Key Properties */}
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
          <div>
            <span className="font-medium">SAP:</span> {oil.sap_naoh.toFixed(3)}
          </div>
          <div>
            <span className="font-medium">INS:</span> {oil.ins}
          </div>
        </div>

        {/* Top Fatty Acids */}
        <div className="text-xs text-gray-500">
          {getTopFattyAcids(oil).map((fa, idx) => (
            <span key={fa.name}>
              {fa.name} {fa.value}%
              {idx < 2 ? ", " : ""}
            </span>
          ))}
        </div>

        {/* Recommendation Reason */}
        {recommendationReason && !isDisabled && (
          <p className="text-xs font-medium text-gray-700 italic">
            {recommendationReason}
          </p>
        )}

        {/* Predicted Impact */}
        {predictedImpact && !isDisabled && (
          <div className="flex items-start gap-1 text-xs text-green-700 bg-green-50 p-2 rounded">
            <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{predictedImpact}</span>
          </div>
        )}

        {/* Suggested Percentage and Quick Add */}
        {suggestedPercentage && !isSelected && !isDisabled && onQuickAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(suggestedPercentage);
            }}
            className="w-full mt-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded hover:bg-primary/90 transition-colors"
          >
            Add {suggestedPercentage}%
          </button>
        )}

        {/* Disabled Reason */}
        {isDisabled && disabledReason && (
          <p className="text-xs text-red-600 italic">
            {disabledReason}
          </p>
        )}
      </div>
    </Card>
  );
}

// Helper function to get top 3 fatty acids
function getTopFattyAcids(oil: OilData) {
  const fattyAcids = [
    { name: "Lauric", value: oil.fatty_acids.lauric },
    { name: "Myristic", value: oil.fatty_acids.myristic },
    { name: "Palmitic", value: oil.fatty_acids.palmitic },
    { name: "Stearic", value: oil.fatty_acids.stearic },
    { name: "Ricinoleic", value: oil.fatty_acids.ricinoleic },
    { name: "Oleic", value: oil.fatty_acids.oleic },
    { name: "Linoleic", value: oil.fatty_acids.linoleic },
    { name: "Linolenic", value: oil.fatty_acids.linolenic },
  ];

  return fattyAcids
    .sort((a, b) => b.value - a.value)
    .filter((fa) => fa.value > 0)
    .slice(0, 3);
}
