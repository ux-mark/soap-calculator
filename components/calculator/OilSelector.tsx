"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Sparkles } from "lucide-react";
import { OILS_DATABASE, OIL_CATEGORIES } from "@/lib/oilData";
import { useCalculator } from "@/contexts/CalculatorContext";
import { OilTile } from "./OilTile";

export function OilSelector() {
  const {
    selectedOils,
    addOil,
    recommendations,
    incompatibleOilIds,
    totalPercentage,
  } = useCalculator();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Filter oils based on search and category
  const filteredOils = useMemo(() => {
    return OILS_DATABASE.filter((oil) => {
      const matchesSearch = oil.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || oil.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  // Get recommended oil IDs for easy lookup
  const recommendedOilIds = useMemo(() => {
    return new Set(recommendations.map((rec) => rec.oil.id));
  }, [recommendations]);

  // Get selected oil IDs
  const selectedOilIds = useMemo(() => {
    return new Set(selectedOils.map((oil) => oil.id));
  }, [selectedOils]);

  // Determine if we're in dynamic mode (< 50% selected)
  const isDynamicMode = totalPercentage < 50;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Select Oils</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {selectedOils.length} selected
            </Badge>
            <Badge
              variant={totalPercentage === 100 ? "success" : "default"}
            >
              {Math.round(totalPercentage * 10) / 10}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search oils..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {OIL_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Recommended for your recipe</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map((rec) => (
                <OilTile
                  key={rec.oil.id}
                  oil={rec.oil}
                  isSelected={selectedOilIds.has(rec.oil.id)}
                  isRecommended={true}
                  isDisabled={false}
                  recommendationReason={rec.reason}
                  onSelect={() => addOil({ ...rec.oil, percentage: 0 })}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Oils Grid */}
        <div>
          {filteredOils.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No oils found matching your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredOils.map((oil) => (
                <OilTile
                  key={oil.id}
                  oil={oil}
                  isSelected={selectedOilIds.has(oil.id)}
                  isRecommended={recommendedOilIds.has(oil.id)}
                  isDisabled={
                    isDynamicMode && incompatibleOilIds.has(oil.id)
                  }
                  onSelect={() => addOil({ ...oil, percentage: 0 })}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
