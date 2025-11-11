"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Lock, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { OilData, RecommendationDetail } from "@/lib/types";
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
  recommendationDetail?: RecommendationDetail;
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
  recommendationDetail,
  onSelect,
  onQuickAdd,
}: OilTileProps) {
  // Use detail if available, otherwise fall back to basic props
  const detail = recommendationDetail;
  const scoreCategory = detail?.scoreCategory;
  const cardColor = detail?.cardColor;
  const displayCopy = detail?.displayCopy || recommendationReason || "";
  
  // Determine card styling based on score category
  const getCardClassName = () => {
    if (isSelected) {
      return "ring-2 ring-primary border-primary bg-primary/5";
    }
    
    if (isDisabled) {
      return "opacity-50 cursor-not-allowed hover:shadow-none bg-gray-100";
    }
    
    if (!detail && !isRecommended) {
      return "hover:border-gray-400";
    }
    
    // Color-coded based on score
    switch (cardColor) {
      case "green":
        return "ring-2 ring-green-500 border-green-500 bg-green-50/50";
      case "blue":
        return "ring-2 ring-blue-500 border-blue-500 bg-blue-50/50";
      case "yellow":
        return "ring-2 ring-yellow-500 border-yellow-500 bg-yellow-50/50";
      case "orange":
        return "ring-2 ring-orange-500 border-orange-500 bg-orange-50/50";
      case "red":
        return "ring-2 ring-red-500 border-red-500 bg-red-50/50";
      default:
        return "hover:border-gray-400";
    }
  };
  
  // Get badge based on score category
  const getBadge = () => {
    if (isSelected) return null;
    if (isDisabled) return null;
    
    switch (scoreCategory) {
      case "highly_recommended":
        return (
          <Badge className="bg-green-600 text-white text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Highly Recommended
          </Badge>
        );
      case "good_match":
        return (
          <Badge className="bg-blue-600 text-white text-xs">
            <Info className="h-3 w-3 mr-1" />
            Good Match
          </Badge>
        );
      case "neutral":
        return (
          <Badge className="bg-yellow-600 text-white text-xs">
            <Info className="h-3 w-3 mr-1" />
            Use With Caution
          </Badge>
        );
      case "caution":
        return (
          <Badge className="bg-orange-600 text-white text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Limited Compatibility
          </Badge>
        );
      case "incompatible":
        return (
          <Badge className="bg-red-600 text-white text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Incompatible
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden",
        getCardClassName()
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
        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 z-10">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Recommendation Badge */}
      {!isSelected && getBadge() && (
        <div className="absolute top-2 left-2 right-2 z-10">
          {getBadge()}
        </div>
      )}

      {/* Disabled Indicator */}
      {isDisabled && (
        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10" 
             title={disabledReason}>
          <Lock className="h-3 w-3" />
        </div>
      )}

      <div className={cn(
        "p-4 space-y-2",
        (scoreCategory && !isSelected) && "pt-8"
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

        {/* Enhanced Display Copy */}
        {displayCopy && !isDisabled && (
          <div className={cn(
            "text-xs font-medium p-2 rounded",
            cardColor === "green" && "text-green-800 bg-green-100",
            cardColor === "blue" && "text-blue-800 bg-blue-100",
            cardColor === "yellow" && "text-yellow-800 bg-yellow-100",
            cardColor === "orange" && "text-orange-800 bg-orange-100",
            cardColor === "red" && "text-red-800 bg-red-100",
            !cardColor && "text-gray-700 bg-gray-100"
          )}>
            {displayCopy}
          </div>
        )}

        {/* Quality Projections Summary */}
        {detail && detail.qualityProjections.length > 0 && !isDisabled && (
          <div className="space-y-1">
            {detail.qualityProjections.slice(0, 2).map((projection) => (
              <div key={projection.quality} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 capitalize">{projection.quality}:</span>
                <span className={cn(
                  "font-medium",
                  projection.movesTowardIdeal ? "text-green-600" : "text-amber-600"
                )}>
                  {projection.current} → {projection.projected}
                  {projection.movesTowardIdeal && " ✓"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Fatty Acid Contributions */}
        {detail && detail.fattyAcidContributions.length > 0 && !isDisabled && (
          <div className="text-xs text-gray-600 italic">
            {detail.fattyAcidContributions[0].acid}: {detail.fattyAcidContributions[0].percentage.toFixed(0)}%
          </div>
        )}

        {/* Usage Tip */}
        {detail?.usageTip && !isDisabled && (
          <div className="flex items-start gap-1 text-xs text-blue-700 bg-blue-50 p-2 rounded">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{detail.usageTip}</span>
          </div>
        )}

        {/* Suggested Percentage and Quick Add */}
        {suggestedPercentage && !isSelected && !isDisabled && onQuickAdd && scoreCategory !== "incompatible" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(suggestedPercentage);
            }}
            className={cn(
              "w-full mt-2 px-3 py-1.5 text-xs font-medium rounded transition-colors",
              cardColor === "green" && "bg-green-600 hover:bg-green-700 text-white",
              cardColor === "blue" && "bg-blue-600 hover:bg-blue-700 text-white",
              cardColor === "yellow" && "bg-yellow-600 hover:bg-yellow-700 text-white",
              cardColor === "orange" && "bg-orange-600 hover:bg-orange-700 text-white",
              !cardColor && "bg-primary hover:bg-primary/90 text-white"
            )}
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

        {/* Problems/Incompatibilities */}
        {detail?.problems && detail.problems.length > 0 && (
          <div className="space-y-1">
            {detail.problems.slice(0, 1).map((problem, idx) => (
              <div key={idx} className="text-xs text-red-700 bg-red-50 p-2 rounded">
                <div className="font-semibold">{problem.details}</div>
                <div className="mt-1 text-red-600">{problem.visualResult}</div>
              </div>
            ))}
          </div>
        )}

        {/* Better Alternatives */}
        {detail?.betterAlternatives && detail.betterAlternatives.length > 0 && (
          <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
            <div className="font-semibold">Try instead:</div>
            {detail.betterAlternatives.slice(0, 1).map((alt, idx) => (
              <div key={idx} className="mt-1">
                {alt.oilId.replace(/-/g, ' ')} - {alt.whyBetter}
              </div>
            ))}
          </div>
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
