"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Lock } from "lucide-react";
import { OilData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface OilTileProps {
  oil: OilData;
  isSelected: boolean;
  isRecommended: boolean;
  isDisabled: boolean;
  recommendationReason?: string;
  onSelect: () => void;
}

export function OilTile({
  oil,
  isSelected,
  isRecommended,
  isDisabled,
  recommendationReason,
  onSelect,
}: OilTileProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5",
        isRecommended && !isSelected && "ring-2 ring-secondary/50 border-secondary/50",
        isDisabled && "opacity-50 cursor-not-allowed hover:shadow-none",
        !isSelected && !isRecommended && !isDisabled && "hover:border-gray-400"
      )}
      onClick={() => {
        if (!isDisabled && !isSelected) {
          onSelect();
        }
      }}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Recommended Indicator */}
      {isRecommended && !isSelected && (
        <div className="absolute top-2 right-2 bg-secondary text-white rounded-full p-1">
          <Sparkles className="h-3 w-3" />
        </div>
      )}

      {/* Disabled Indicator */}
      {isDisabled && (
        <div className="absolute top-2 right-2 bg-gray-400 text-white rounded-full p-1">
          <Lock className="h-3 w-3" />
        </div>
      )}

      <div className="p-4 space-y-2">
        {/* Oil Name */}
        <h4 className="font-semibold text-sm leading-tight">{oil.name}</h4>

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
        {recommendationReason && (
          <p className="text-xs text-secondary font-medium italic">
            {recommendationReason}
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
