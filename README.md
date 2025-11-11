# The Fairies Soap Formula Calculator

A modern, data-driven web application for creating optimal cold process soap recipes with intelligent oil recommendations.

## Features

### 🧪 Core Functionality
- **Comprehensive Oil Database**: 149+ oils stored in Supabase with complete fatty acid profiles and SAP values
- **Real-time Calculations**: Instant lye, water, and recipe calculations
- **Seven Soap Quality Metrics**: Hardness, Cleansing, Conditioning, Bubbly, Creamy, Iodine, and INS values
- **Eight Fatty Acid Profiles**: Complete breakdown of all major fatty acids

### 🤖 Intelligent Recommendations
- **Smart Oil Suggestions**: AI-powered recommendations based on current selection
- **Compatibility Scoring**: Each oil rated for how well it complements your recipe
- **Dynamic Filtering**: Incompatible oils automatically disabled when selection < 50%
- **Context-Aware Tips**: Specific reasons why each oil is recommended

### ⚙️ Advanced Features
- **Multiple Unit Support**: Grams, ounces, and pounds
- **Flexible Water Calculations**: Water as % of oils, lye concentration, or water:lye ratio
- **Lye Type Selection**: NaOH (bar soap) or KOH (liquid soap)
- **Superfat Control**: Adjustable from 0-20%
- **Fragrance Calculator**: Built-in fragrance weight calculator
- **Recipe Export**: Save recipes as JSON
- **Print-Friendly**: Optimized print layout for recipe cards

### 📱 Modern UX
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Real-time Validation**: Instant feedback on oil percentages
- **Visual Quality Indicators**: Color-coded progress bars with ideal ranges
- **Auto-Distribution**: One-click equal distribution of oil percentages
- **Search & Filter**: Quick oil finding by name or category

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Shadcn UI + Radix UI
- **State Management**: React Context API
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd soap-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
soap-calculator/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles & Tailwind
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main calculator page
├── components/
│   ├── calculator/          # Calculator-specific components
│   │   ├── InputSection.tsx
│   │   ├── OilSelector.tsx
│   │   ├── OilTile.tsx
│   │   ├── SelectedOilsList.tsx
│   │   ├── QualityDisplay.tsx
│   │   └── CalculationResults.tsx
│   └── ui/                  # Reusable UI components (Shadcn)
├── contexts/
│   ├── CalculatorContext.tsx # Calculator state management
│   └── OilsContext.tsx      # Oil data from Supabase
├── lib/
│   ├── calculations.ts      # All calculation logic
│   ├── oilData.ts          # (DEPRECATED) Use Supabase instead
│   ├── recommendations.ts   # Recommendation engine
│   ├── types.ts            # TypeScript types
│   ├── utils.ts            # Utility functions
│   ├── services/
│   │   └── oils.ts         # Supabase oil data access
│   └── supabase/           # Supabase client configuration
└── public/                  # Static assets
```

## How It Works

### Oil Selection & Data Flow
1. **OilsProvider** fetches all available oils from Supabase on app load
2. **OilSelector** displays oils from the centralized OilsContext
3. Click on oils to add them to your recipe
4. Adjust percentages until they total 100%

### Intelligent Recommendations
- When you have < 50% oils selected, the system analyzes your current selection
- **Recommendation engine** receives the full oils list and calculates compatibility scores
- It calculates which oils would best complement your recipe
- Incompatible oils are automatically disabled
- Top 5 recommendations are highlighted with reasons
- **All data comes from the same Supabase source** - no duplicates!

### Quality Calculation
The calculator uses the same formulas as SoapCalc.net:
- **Hardness** = Lauric + Myristic + Palmitic + Stearic
- **Cleansing** = Lauric + Myristic
- **Conditioning** = Oleic + Linoleic + Linolenic + Ricinoleic
- **Bubbly** = Lauric + Myristic + Ricinoleic
- **Creamy** = Palmitic + Stearic + Ricinoleic
- **Iodine** = Weighted average of individual oil iodine values
- **INS** = Weighted average of individual oil INS values

## Data Attribution

This project uses oil data from SoapCalc (soapcalc.net) under fair use for educational and non-commercial purposes. All saponification values, fatty acid profiles, and quality calculations are based on SoapCalc's widely-trusted database.

## Safety Warning

⚠️ **IMPORTANT**: Soap making involves handling caustic chemicals (lye). Always:
- Wear safety goggles and gloves
- Work in a well-ventilated area
- Add lye to water, NEVER water to lye
- Keep away from children and pets
- Follow all safety protocols

This calculator is a tool for recipe formulation only. The user is responsible for safe handling of all materials.

## Future Enhancements

- [x] Supabase integration for saving recipes
- [ ] User accounts and recipe sharing
- [ ] Custom oil management (add your own oils)
- [ ] Batch scaling calculator
- [ ] Cost calculator
- [ ] Recipe templates (starter recipes)
- [ ] Color and swirl designer
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- SoapCalc.net for the comprehensive oil database
- The soap making community for their knowledge and expertise
- Vercel for Next.js and deployment platform
- Shadcn for the beautiful UI component library

---

**Made with ❤️ for soap makers everywhere**
