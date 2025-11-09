"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SoapQualities, FattyAcidProfile } from "@/lib/types";
import {
  getQualityRanges,
  getQualityStatus,
  getQualityPercentage,
} from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { useCalculator } from "@/contexts/CalculatorContext";

interface QualityDisplayProps {
  qualities: SoapQualities;
  fattyAcids: FattyAcidProfile;
}

export function QualityDisplay({ qualities, fattyAcids }: QualityDisplayProps) {
  const { inputs } = useCalculator();
  const soapType = inputs.soapType;
  const qualityRanges = getQualityRanges(soapType);
  const qualityItems: Array<{
    key: keyof SoapQualities;
    label: string;
    hardDescription: string;
    liquidDescription: string;
  }> = [
    {
      key: "hardness",
      label: "Hardness",
      hardDescription: "How hard and long-lasting the bar will be",
      liquidDescription: "Low hardness promotes fluidity and pumpability (avoid high values)",
    },
    {
      key: "cleansing",
      label: "Cleansing",
      hardDescription: "Deep cleaning ability (high values can be drying)",
      liquidDescription: "Effective cleaning and lather without stripping skin",
    },
    {
      key: "conditioning",
      label: "Conditioning",
      hardDescription: "Moisturizing and skin-nourishing properties",
      liquidDescription: "Higher than bar soap - ensures gentle, moisturizing liquid product",
    },
    {
      key: "bubbly",
      label: "Bubbly Lather",
      hardDescription: "Large, fluffy bubbles (short-lived)",
      liquidDescription: "Moderate levels prevent over-foaming during pumping",
    },
    {
      key: "creamy",
      label: "Creamy Lather",
      hardDescription: "Stable, long-lasting creamy lather",
      liquidDescription: "Smooth, velvety lather texture in liquid form",
    },
    {
      key: "iodine",
      label: "Iodine Value",
      hardDescription: "Indicates softness and shelf life",
      liquidDescription: "Higher values keep oils in solution and maintain fluidity",
    },
    {
      key: "ins",
      label: "INS Value",
      hardDescription: "Overall soap quality indicator",
      liquidDescription: "Lower than bar soap - balances fluidity with cleaning effectiveness",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Soap Qualities</CardTitle>
          <Badge variant={soapType === "hard" ? "default" : "secondary"}>
            {soapType === "hard" ? "Hard Soap" : "Liquid Soap"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {qualityItems.map((item) => {
          const value = qualities[item.key];
          const range = qualityRanges[item.key];
          const status = getQualityStatus(item.key, value, soapType);
          const percentage = getQualityPercentage(item.key, value, soapType);

          return (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{item.label}</h5>
                  <p className="text-xs text-gray-500">
                    {soapType === "hard" ? item.hardDescription : item.liquidDescription}
                  </p>
                </div>
                <div className="text-right">
                  <span className={cn("font-bold text-sm", getStatusColor(status))}>
                    {value}
                  </span>
                  <p className="text-xs text-gray-500">
                    {range.min}-{range.max}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <Progress value={percentage} className="h-3" />
                <div
                  className={cn(
                    "absolute top-0 left-0 h-3 rounded-full transition-all",
                    status === "ideal" && "bg-success",
                    status === "in-range" && "bg-secondary",
                    status === "below" && "bg-warning",
                    status === "above" && "bg-danger"
                  )}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />

                {/* Ideal Range Indicator */}
                {range.ideal && (
                  <div
                    className="absolute top-0 h-3 border-2 border-success/30 bg-success/10 rounded"
                    style={{
                      left: `${((range.ideal.min - range.min) / (range.max - range.min)) * 100}%`,
                      width: `${((range.ideal.max - range.ideal.min) / (range.max - range.min)) * 100}%`,
                    }}
                  />
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", getStatusColor(status))}>
                  {getStatusLabel(status)}
                </span>
                {range.ideal && (
                  <span className="text-gray-500">
                    Ideal: {range.ideal.min}-{range.ideal.max}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function FattyAcidDisplay({ fattyAcids }: { fattyAcids: FattyAcidProfile }) {
  const acidItems: Array<{
    key: keyof FattyAcidProfile;
    label: string;
    description: string;
  }> = [
    {
      key: "lauric",
      label: "Lauric Acid",
      description: "Big bubbles, hardness, cleansing",
    },
    {
      key: "myristic",
      label: "Myristic Acid",
      description: "Big bubbles, hardness, cleansing",
    },
    {
      key: "palmitic",
      label: "Palmitic Acid",
      description: "Hardness, stable lather",
    },
    {
      key: "stearic",
      label: "Stearic Acid",
      description: "Hardness, stable lather",
    },
    {
      key: "ricinoleic",
      label: "Ricinoleic Acid",
      description: "Stable lather, conditioning",
    },
    {
      key: "oleic",
      label: "Oleic Acid",
      description: "Conditioning, moisturizing",
    },
    {
      key: "linoleic",
      label: "Linoleic Acid",
      description: "Conditioning, short shelf life",
    },
    {
      key: "linolenic",
      label: "Linolenic Acid",
      description: "Conditioning, very short shelf life",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fatty Acid Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {acidItems.map((item) => {
          const value = Math.round(fattyAcids[item.key]);
          
          if (value === 0) return null; // Don't show acids with 0%

          return (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{item.label}</h5>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <span className="font-bold text-sm text-gray-700">{value}%</span>
              </div>

              {/* Simple Progress Bar */}
              <Progress value={value} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: "below" | "in-range" | "above" | "ideal"): string {
  switch (status) {
    case "ideal":
      return "text-success";
    case "in-range":
      return "text-secondary";
    case "below":
      return "text-warning";
    case "above":
      return "text-danger";
  }
}

function getStatusLabel(status: "below" | "in-range" | "above" | "ideal"): string {
  switch (status) {
    case "ideal":
      return "✓ Ideal";
    case "in-range":
      return "✓ In Range";
    case "below":
      return "⚠ Below Range";
    case "above":
      return "⚠ Above Range";
  }
}
