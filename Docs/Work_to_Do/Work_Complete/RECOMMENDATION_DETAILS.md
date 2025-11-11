Please rewrite the recommendation engine to output structured data for dynamic copy generation.

## Comments for Different Score Ranges
Design distinct comment templates based on the recommendation score: 

* >70 - positive comments - green, 
* 50-69 - positive and negative - blue, 
*  30-49  - positive and negative - yellow, 
* 25-29  - positive and negative - orange, 
* <25 - negative comments - red.

Ensure comments of copy appear on all cards and the card has the colour associated with the score.

## Better Data Structure
Instead of generic copy, build sentences from **factual components**:

```json
{
  "recommendation_system": {
    "scoring_factors": {
      "improves_quality": {
        "hardness_low": {
          "oils_that_help": ["palm-oil", "cocoa-butter", "tallow"],
          "reason_template": "High in {palmitic}% palmitic + {stearic}% stearic acid",
          "user_benefit": "Creates firm, long-lasting bars",
          "why_specific": "Saturated fats crystallize to form solid structure"
        },
        "hardness_high_liquid": {
          "oils_that_help": ["olive-oil", "sunflower-oil", "almond-oil"],
          "reason_template": "High in {oleic}% oleic acid with low saturates",
          "user_benefit": "Keeps liquid soap fluid and pumpable",
          "why_specific": "Unsaturated fats remain liquid at room temperature"
        },
        "cleansing_low": {
          "oils_that_help": ["coconut-oil-76", "babassu-oil"],
          "reason_template": "{lauric}% lauric + {myristic}% myristic acids",
          "user_benefit": "Creates abundant, cleansing lather",
          "why_specific": "Short-chain fatty acids cut through oils effectively"
        },
        "conditioning_low": {
          "oils_that_help": ["olive-oil", "sweet-almond-oil", "avocado-oil"],
          "reason_template": "{oleic}% oleic + {linoleic}% linoleic acids",
          "user_benefit": "Moisturizes skin without stripping natural oils",
          "why_specific": "Unsaturated fats similar to skin's natural sebum"
        },
        "bubbly_low": {
          "oils_that_help": ["coconut-oil-76", "castor-oil"],
          "reason_template": "{lauric}% lauric or {ricinoleic}% ricinoleic acid",
          "user_benefit": "Creates quick, fluffy lather bubbles",
          "why_specific": "Small molecules create surface tension for bubbles"
        },
        "creamy_low": {
          "oils_that_help": ["shea-butter", "castor-oil"],
          "reason_template": "{stearic}% stearic + {ricinoleic}% ricinoleic acids",
          "user_benefit": "Produces stable, creamy lather",
          "why_specific": "Creates dense, long-lasting foam structure"
        }
      },
      
      "incompatibility_reasons": {
        "too_similar": {
          "condition": "fatty_acid_overlap > 70%",
          "reason_template": "Already have {similar_oil} with {overlap}% similar profile",
          "specific_duplicates": "Both high in {dominant_fatty_acid}",
          "better_alternative": "Choose oil with different fatty acid balance",
          "why_bad": "Duplicates properties without adding variety"
        },
        "wrong_soap_type": {
          "hard_in_liquid": {
            "reason_template": "{palmitic}% palmitic + {stearic}% stearic will solidify",
            "specific_problem": "Saturated fats crystallize in KOH liquid soap",
            "visual_result": "Creates waxy chunks or thick paste",
            "better_alternative": "Use high-oleic oils (olive, sunflower, safflower)"
          },
          "too_soft_for_bars": {
            "reason_template": "Only {hardness_contribution} hardness from {oil_name}",
            "specific_problem": "{linoleic}% linoleic makes bars soft and slow-curing",
            "visual_result": "Bars stay soft, deform easily, short shelf life",
            "better_alternative": "Add palm, tallow, or cocoa butter for structure"
          }
        },
        "pushes_out_of_range": {
          "too_cleansing": {
            "reason_template": "Would bring cleansing to {projected_value} (max: {max})",
            "specific_problem": "{lauric}% lauric is stripping at this concentration",
            "skin_result": "Drying, tight feeling, disrupts skin barrier",
            "better_alternative": "Reduce coconut to <25% or add conditioning oils"
          },
          "too_soft": {
            "reason_template": "Would reduce hardness to {projected_value} (min: {min})",
            "specific_problem": "Too much {linoleic}% linoleic + {linolenic}% linolenic",
            "physical_result": "Soap won't unmold, stays mushy, dissolves quickly",
            "better_alternative": "Increase palm/tallow to 25-40% for structure"
          }
        },
        "dos_risk": {
          "condition": "linolenic > 15% in formula",
          "reason_template": "{linolenic}% linolenic acid oxidizes rapidly",
          "specific_problem": "Polyunsaturated fats develop rancidity (DOS)",
          "timeline": "Orange spots appear within weeks to months",
          "better_alternative": "Keep hemp/flax <10% or add antioxidant"
        }
      },
      
      "comparative_analysis": {
        "vs_selected_oils": {
          "better_hardness": {
            "comparison": "{candidate_oil} provides {X}% more palmitic than {current_oil}",
            "numeric_benefit": "Increases bar hardness by ~{Y} points",
            "practical_result": "Bars unmold {Z} days faster"
          },
          "better_conditioning": {
            "comparison": "{candidate_oil} has {X}% oleic vs {current_oil}'s {Y}%",
            "skin_benefit": "More closely matches skin's natural oils",
            "feel_result": "Less tight/dry feeling after washing"
          },
          "cost_effectiveness": {
            "comparison": "{candidate_oil} achieves similar results at {X}% vs {Y}%",
            "efficiency": "Need less oil for same effect",
            "formula_room": "Frees up {Z}% for specialty oils"
          }
        }
      }
    },
    
    "sentence_construction": {
      "highly_recommended": {
        "template": "{quality_improvement} • {fatty_acid_detail} • {user_benefit}",
        "example": "Increases hardness to ideal range • 44% palmitic + 5% stearic acids • Creates firm bars that last 3-4 weeks"
      },
      "good_match": {
        "template": "{what_it_adds} • {caveat} • {usage_tip}",
        "example": "Adds 20% oleic for conditioning • Watch total soft oils <60% • Best at 15-20% of recipe"
      },
      "incompatible": {
        "template": "{specific_problem} • {projected_impact} • {better_alternative}",
        "example": "Already 45% oleic in recipe • Adding this pushes hardness to 18 (need 29+) • Try palm oil for structure"
      }
    },
    
    "dynamic_copy_generation": {
      "rules": [
        "Always cite specific fatty acid percentages",
        "Always show projected numeric impact",
        "Always compare to current state",
        "Always suggest concrete alternative when rejecting",
        "Never use vague quality words (good, nice, great)",
        "Always explain WHY chemically/physically"
      ]
    }
  }
}
```

## Example Generated Copy

**Score 85 (Highly Recommended) - Palm Oil for Hard Soap:**
```
Provides critical bar structure • 44% palmitic + 5% stearic acids create firm crystalline matrix • Bars will unmold in 24-48hrs and last 3-4 weeks of daily use • Your recipe currently at 18 hardness needs this to reach 29-54 range
```

**Score 45 (Neutral) - Sunflower for Hard Soap:**
```
Adds 70% linoleic for conditioning • However, already have 35% linoleic from olive oil • Would increase conditioning from 55 to 62, but softens bars (hardness drops to 25) • Consider using 10% max OR swap for rice bran oil (less linoleic, more palmitic)
```

**Score 15 (Incompatible) - Palm Oil for Liquid Soap:**
```
INCOMPATIBLE: 44% palmitic acid solidifies in KOH liquid soap • Would create waxy chunks or thick paste requiring heat to remain fluid • Liquid soap needs high oleic (>60%) + low saturates (<20%) • Instead try: olive oil (69% oleic), sunflower (16% oleic), or safflower
```

## Idea on ow to represent this structured data in TypeScript:

```typescript
interface RecommendationDetail {
  score: number;
  
  // Specific chemistry
  fatty_acid_contribution: {
    acid: string;
    percentage: number;
    why_helpful: string;
  }[];
  
  // Numeric projections
  quality_projections: {
    quality: string;
    current: number;
    projected: number;
    range: {min: number, max: number};
    moves_toward_ideal: boolean;
  }[];
  
  // Comparisons
  vs_current_oils: {
    similar_to?: string; // oil ID
    overlap_percentage?: number;
    advantage_over?: {
      oil_id: string;
      metric: string;
      improvement: number;
    };
  };
  
  // Specific incompatibilities
  problems?: {
    type: "wrong_soap_type" | "too_similar" | "pushes_out_of_range" | "dos_risk";
    details: string;
    numeric_issue: string;
    visual_result: string;
  }[];
  
  // Concrete alternatives
  better_alternatives?: {
    oil_id: string;
    why_better: string;
    specific_advantage: string;
  }[];
  
  // Generated sentence
  display_copy: string;
}
```
