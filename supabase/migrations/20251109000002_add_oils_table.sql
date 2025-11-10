-- =====================================================
-- ADD OILS TABLE - Optional Enhancement
-- =====================================================
-- Version: 1.1
-- Created: November 9, 2025
-- Purpose: Store system oils and allow custom user oils
-- =====================================================

-- =====================================================
-- TABLE 3: oils (System + User Custom Oils)
-- =====================================================

CREATE TABLE oils (
  id TEXT PRIMARY KEY,                -- e.g., "coconut-oil-76"
  name TEXT NOT NULL,                 -- Display name
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for system oils
  
  -- Saponification values
  sap_naoh DECIMAL(6,4) NOT NULL,    -- NaOH SAP value
  sap_koh DECIMAL(6,4) NOT NULL,     -- KOH SAP value
  
  -- Oil properties
  iodine INTEGER NOT NULL,            -- Iodine value
  ins INTEGER NOT NULL,               -- INS value
  category TEXT NOT NULL,             -- "Hard Oil", "Soft Oil", etc.
  
  -- Fatty acid profile (percentages)
  fatty_acids JSONB NOT NULL,         -- {lauric: 48, myristic: 19, ...}
  
  -- Metadata
  is_system BOOLEAN DEFAULT false,    -- true for built-in oils
  is_public BOOLEAN DEFAULT false,    -- for user-created custom oils
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_oils_user_id ON oils(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_oils_category ON oils(category);
CREATE INDEX idx_oils_is_system ON oils(is_system);
CREATE INDEX idx_oils_name ON oils(name);

-- Comments
COMMENT ON TABLE oils IS 'System oils and user-created custom oils';
COMMENT ON COLUMN oils.id IS 'Unique identifier (slug format)';
COMMENT ON COLUMN oils.user_id IS 'NULL for system oils, user ID for custom oils';
COMMENT ON COLUMN oils.is_system IS 'True for built-in oils that cannot be deleted';
COMMENT ON COLUMN oils.fatty_acids IS 'JSONB: {lauric, myristic, palmitic, stearic, ricinoleic, oleic, linoleic, linolenic}';

-- Trigger for updated_at
CREATE TRIGGER update_oils_updated_at
  BEFORE UPDATE ON oils
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE oils ENABLE ROW LEVEL SECURITY;

-- Anyone can read system oils
CREATE POLICY "Anyone can read system oils"
  ON oils FOR SELECT
  USING (is_system = true);

-- Anyone can read public custom oils
CREATE POLICY "Anyone can read public custom oils"
  ON oils FOR SELECT
  USING (is_public = true);

-- Users can read their own custom oils
CREATE POLICY "Users can read own custom oils"
  ON oils FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own custom oils
CREATE POLICY "Users can create custom oils"
  ON oils FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = false);

-- Users can update their own custom oils (not system oils)
CREATE POLICY "Users can update own custom oils"
  ON oils FOR UPDATE
  USING (auth.uid() = user_id AND is_system = false);

-- Users can delete their own custom oils (not system oils)
CREATE POLICY "Users can delete own custom oils"
  ON oils FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);

-- =====================================================
-- SEED DATA - System Oils from OIL_DATABASE.md
-- =====================================================

INSERT INTO oils (id, name, sap_naoh, sap_koh, iodine, ins, category, fatty_acids, is_system) VALUES
('abyssinian-oil', 'Abyssinian Oil', 0.168, 0.168, 98, 70, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 3, "stearic": 2, "ricinoleic": 0, "oleic": 18, "linoleic": 11, "linolenic": 4}'::JSONB, true),
('almond-butter', 'Almond Butter', 0.188, 0.188, 70, 118, 'Butter', '{"lauric": 0, "myristic": 1, "palmitic": 9, "stearic": 15, "ricinoleic": 0, "oleic": 58, "linoleic": 16, "linolenic": 0}'::JSONB, true),
('almond-oil-sweet', 'Almond Oil, sweet', 0.195, 0.195, 99, 97, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 0, "ricinoleic": 0, "oleic": 71, "linoleic": 18, "linolenic": 0}'::JSONB, true),
('aloe-butter', 'Aloe Butter', 0.24, 0.24, 9, 241, 'Butter', '{"lauric": 45, "myristic": 18, "palmitic": 8, "stearic": 3, "ricinoleic": 0, "oleic": 7, "linoleic": 2, "linolenic": 0}'::JSONB, true),
('apricot-kernel-oil', 'Apricot Kernel Oil', 0.195, 0.195, 100, 91, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 0, "ricinoleic": 0, "oleic": 66, "linoleic": 27, "linolenic": 0}'::JSONB, true),
('avocado-butter', 'Avocado butter', 0.187, 0.187, 67, 120, 'Butter', '{"lauric": 0, "myristic": 0, "palmitic": 21, "stearic": 10, "ricinoleic": 0, "oleic": 53, "linoleic": 6, "linolenic": 2}'::JSONB, true),
('avocado-oil', 'Avocado Oil', 0.186, 0.186, 86, 99, 'Soft Oil', '{"lauric": 0, "myristic": 0, "palmitic": 20, "stearic": 2, "ricinoleic": 0, "oleic": 58, "linoleic": 12, "linolenic": 0}'::JSONB, true),
('babassu-oil', 'Babassu Oil', 0.245, 0.245, 15, 230, 'Hard Oil', '{"lauric": 50, "myristic": 20, "palmitic": 11, "stearic": 4, "ricinoleic": 0, "oleic": 10, "linoleic": 0, "linolenic": 0}'::JSONB, true),
('castor-oil', 'Castor Oil', 0.18, 0.18, 86, 95, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 90, "oleic": 4, "linoleic": 4, "linolenic": 0}'::JSONB, true),
('cocoa-butter', 'Cocoa Butter', 0.194, 0.194, 37, 157, 'Butter', '{"lauric": 0, "myristic": 0, "palmitic": 28, "stearic": 33, "ricinoleic": 0, "oleic": 35, "linoleic": 3, "linolenic": 0}'::JSONB, true),
('coconut-oil-76', 'Coconut Oil, 76 deg', 0.257, 0.257, 10, 258, 'Hard Oil', '{"lauric": 48, "myristic": 19, "palmitic": 9, "stearic": 3, "ricinoleic": 0, "oleic": 8, "linoleic": 2, "linolenic": 0}'::JSONB, true),
('coconut-oil-92', 'Coconut Oil, 92 deg', 0.257, 0.257, 3, 258, 'Hard Oil', '{"lauric": 48, "myristic": 19, "palmitic": 9, "stearic": 3, "ricinoleic": 0, "oleic": 8, "linoleic": 2, "linolenic": 0}'::JSONB, true),
('grapeseed-oil', 'Grapeseed Oil', 0.181, 0.181, 131, 66, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 8, "stearic": 4, "ricinoleic": 0, "oleic": 20, "linoleic": 68, "linolenic": 0}'::JSONB, true),
('hazelnut-oil', 'Hazelnut Oil', 0.195, 0.195, 97, 94, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 5, "stearic": 3, "ricinoleic": 0, "oleic": 75, "linoleic": 10, "linolenic": 0}'::JSONB, true),
('hemp-oil', 'Hemp Oil', 0.193, 0.193, 165, 39, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 2, "ricinoleic": 0, "oleic": 12, "linoleic": 57, "linolenic": 21}'::JSONB, true),
('jojoba-oil', 'Jojoba Oil', 0.092, 0.092, 83, 11, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 12, "linoleic": 0, "linolenic": 0}'::JSONB, true),
('mango-butter', 'Mango Seed Butter', 0.191, 0.191, 45, 146, 'Butter', '{"lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 42, "ricinoleic": 0, "oleic": 45, "linoleic": 3, "linolenic": 0}'::JSONB, true),
('olive-oil', 'Olive Oil', 0.19, 0.19, 85, 105, 'Soft Oil', '{"lauric": 0, "myristic": 0, "palmitic": 14, "stearic": 3, "ricinoleic": 0, "oleic": 69, "linoleic": 12, "linolenic": 1}'::JSONB, true),
('palm-kernel-oil', 'Palm Kernel Oil', 0.247, 0.247, 20, 227, 'Hard Oil', '{"lauric": 49, "myristic": 16, "palmitic": 8, "stearic": 2, "ricinoleic": 0, "oleic": 15, "linoleic": 3, "linolenic": 0}'::JSONB, true),
('palm-oil', 'Palm Oil', 0.199, 0.199, 53, 145, 'Hard Oil', '{"lauric": 0, "myristic": 1, "palmitic": 44, "stearic": 5, "ricinoleic": 0, "oleic": 39, "linoleic": 10, "linolenic": 0}'::JSONB, true),
('rice-bran-oil', 'Rice Bran Oil', 0.187, 0.187, 100, 87, 'Soft Oil', '{"lauric": 0, "myristic": 1, "palmitic": 22, "stearic": 3, "ricinoleic": 0, "oleic": 38, "linoleic": 34, "linolenic": 2}'::JSONB, true),
('shea-butter', 'Shea Butter', 0.179, 0.179, 59, 116, 'Butter', '{"lauric": 0, "myristic": 0, "palmitic": 5, "stearic": 40, "ricinoleic": 0, "oleic": 48, "linoleic": 6, "linolenic": 0}'::JSONB, true),
('sunflower-oil', 'Sunflower Oil', 0.189, 0.189, 133, 63, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 4, "ricinoleic": 0, "oleic": 16, "linoleic": 70, "linolenic": 1}'::JSONB, true),
('sweet-almond-oil', 'Sweet Almond Oil', 0.195, 0.195, 99, 97, 'Liquid Oil', '{"lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 0, "ricinoleic": 0, "oleic": 71, "linoleic": 18, "linolenic": 0}'::JSONB, true);

-- Add more common oils (you can add all 150+ later if needed)

-- =====================================================
-- VALIDATION
-- =====================================================

-- Check oils were inserted
-- SELECT COUNT(*) as total_oils, COUNT(*) FILTER (WHERE is_system = true) as system_oils FROM oils;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
