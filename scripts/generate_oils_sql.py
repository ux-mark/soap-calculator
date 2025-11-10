#!/usr/bin/env python3
"""
Convert OIL_DATABASE.md to SQL INSERT statements
Generates SQL for inserting all oils into the oils table
"""

import re
import json

# Oil data from OIL_DATABASE.md
oils_data = """
| Abyssinian Oil | 0.168 | 98 | 70 | 0 | 0 | 3 | 2 | 0 | 18 | 11 | 4 |
| Almond Butter | 0.188 | 70 | 118 | 0 | 1 | 9 | 15 | 0 | 58 | 16 | 0 |
| Almond Oil, sweet | 0.195 | 99 | 97 | 0 | 0 | 7 | 0 | 0 | 71 | 18 | 0 |
| Aloe Butter | 0.24 | 9 | 241 | 45 | 18 | 8 | 3 | 0 | 7 | 2 | 0 |
| Andiroba Oil, karaba, crabwood | 0.188 | 68 | 120 | 0 | 0 | 28 | 8 | 0 | 51 | 9 | 0 |
| Apricot Kernel Oil | 0.195 | 100 | 91 | 0 | 0 | 6 | 0 | 0 | 66 | 27 | 0 |
| Argan Oil | 0.191 | 95 | 95 | 0 | 1 | 14 | 0 | 0 | 46 | 34 | 1 |
| Avocado butter | 0.187 | 67 | 120 | 0 | 0 | 21 | 10 | 0 | 53 | 6 | 2 |
| Avocado Oil | 0.186 | 86 | 99 | 0 | 0 | 20 | 2 | 0 | 58 | 12 | 0 |
| Babassu Oil | 0.245 | 15 | 230 | 50 | 20 | 11 | 4 | 0 | 10 | 0 | 0 |
| Baobab Oil | 0.2 | 75 | 125 | 0 | 1 | 24 | 4 | 0 | 37 | 28 | 2 |
| Beeswax | 0.094 | 10 | 84 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Black Cumin Seed Oil, nigella sativa | 0.195 | 133 | 62 | 0 | 0 | 13 | 3 | 0 | 22 | 60 | 1 |
| Black Currant Seed Oil | 0.19 | 178 | 12 | 0 | 0 | 6 | 2 | 0 | 13 | 46 | 29 |
| Borage Oil | 0.19 | 135 | 55 | 0 | 0 | 10 | 4 | 0 | 20 | 43 | 5 |
| Brazil Nut Oil | 0.19 | 100 | 90 | 0 | 0 | 13 | 11 | 0 | 39 | 36 | 0 |
| Broccoli Seed Oil, Brassica Oleracea | 0.172 | 105 | 67 | 0 | 0 | 3 | 1 | 0 | 14 | 11 | 9 |
| Buriti Oil | 0.223 | 70 | 153 | 0 | 0 | 17 | 2 | 0 | 71 | 7 | 1 |
| Camelina Seed Oil | 0.188 | 144 | 44 | 0 | 0 | 6 | 2 | 0 | 24 | 19 | 45 |
| Camellia Oil, Tea Seed | 0.193 | 78 | 115 | 0 | 0 | 9 | 2 | 0 | 77 | 8 | 0 |
| Candelilla Wax | 0.044 | 32 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Canola Oil | 0.186 | 110 | 56 | 0 | 0 | 4 | 2 | 0 | 61 | 21 | 9 |
| Canola Oil, high oleic | 0.186 | 96 | 90 | 0 | 0 | 4 | 2 | 0 | 74 | 12 | 4 |
| Carrot Seed Oil, cold pressed | 0.144 | 56 | 0 | 0 | 0 | 4 | 0 | 0 | 80 | 13 | 0 |
| Castor Oil | 0.18 | 86 | 95 | 0 | 0 | 0 | 0 | 90 | 4 | 4 | 0 |
| Cherry Kernel Oil, p. avium | 0.19 | 128 | 62 | 0 | 0 | 8 | 3 | 0 | 31 | 45 | 11 |
| Cherry Kernel Oil, p. cerasus | 0.192 | 118 | 74 | 0 | 0 | 6 | 3 | 0 | 50 | 40 | 0 |
| Chicken Fat | 0.195 | 69 | 130 | 0 | 1 | 25 | 7 | 0 | 38 | 21 | 0 |
| Cocoa Butter | 0.194 | 37 | 157 | 0 | 0 | 28 | 33 | 0 | 35 | 3 | 0 |
| Coconut Oil, 76 deg | 0.257 | 10 | 258 | 48 | 19 | 9 | 3 | 0 | 8 | 2 | 0 |
| Coconut Oil, 92 deg | 0.257 | 3 | 258 | 48 | 19 | 9 | 3 | 0 | 8 | 2 | 0 |
| Coconut Oil, fractionated | 0.325 | 1 | 324 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| Coffee Bean Oil, green | 0.185 | 85 | 100 | 0 | 0 | 38 | 8 | 0 | 9 | 39 | 2 |
| Coffee Bean Oil, roasted | 0.18 | 87 | 93 | 0 | 0 | 40 | 0 | 0 | 8 | 38 | 2 |
| Cohune Oil | 0.205 | 30 | 175 | 51 | 13 | 8 | 3 | 0 | 18 | 3 | 0 |
| Corn Oil | 0.192 | 117 | 69 | 0 | 0 | 12 | 2 | 0 | 32 | 51 | 1 |
| Cottonseed Oil | 0.194 | 108 | 89 | 0 | 0 | 13 | 13 | 0 | 18 | 52 | 1 |
| Cranberry Seed Oil | 0.19 | 150 | 40 | 0 | 0 | 6 | 2 | 0 | 23 | 37 | 32 |
| Crisco, new w/palm | 0.193 | 111 | 82 | 0 | 0 | 20 | 5 | 0 | 28 | 40 | 6 |
| Crisco, old | 0.192 | 93 | 115 | 0 | 0 | 13 | 13 | 0 | 18 | 52 | 0 |
| Cupuacu Butter | 0.192 | 39 | 153 | 0 | 0 | 8 | 35 | 0 | 42 | 2 | 0 |
| Duck Fat, flesh and skin | 0.194 | 72 | 122 | 0 | 1 | 26 | 9 | 0 | 44 | 13 | 1 |
| Emu Oil | 0.19 | 60 | 128 | 0 | 0 | 23 | 9 | 0 | 47 | 8 | 0 |
| Evening Primrose Oil | 0.19 | 160 | 30 | 0 | 0 | 0 | 0 | 0 | 0 | 80 | 9 |
| Flax Oil, linseed | 0.19 | 180 | -6 | 0 | 0 | 6 | 3 | 0 | 27 | 13 | 50 |
| Ghee, any bovine | 0.227 | 30 | 191 | 4 | 11 | 28 | 12 | 0 | 19 | 2 | 1 |
| Goose Fat | 0.192 | 65 | 130 | 0 | 0 | 21 | 6 | 0 | 54 | 10 | 0 |
| Grapeseed Oil | 0.181 | 131 | 66 | 0 | 0 | 8 | 4 | 0 | 20 | 68 | 0 |
| Hazelnut Oil | 0.195 | 97 | 94 | 0 | 0 | 5 | 3 | 0 | 75 | 10 | 0 |
| Hemp Oil | 0.193 | 165 | 39 | 0 | 0 | 6 | 2 | 0 | 12 | 57 | 21 |
| Horse Oil | 0.196 | 79 | 117 | 0 | 3 | 26 | 5 | 0 | 10 | 20 | 19 |
| Illipe Butter | 0.185 | 33 | 152 | 0 | 0 | 17 | 45 | 0 | 35 | 0 | 0 |
| Japan Wax | 0.215 | 11 | 204 | 0 | 1 | 80 | 7 | 0 | 4 | 0 | 0 |
| Jatropha Oil, soapnut seed oil | 0.193 | 102 | 91 | 0 | 0 | 9 | 7 | 0 | 44 | 34 | 0 |
| Jojoba Oil (a Liquid Wax Ester) | 0.092 | 83 | 11 | 0 | 0 | 0 | 0 | 0 | 12 | 0 | 0 |
| Karanja Oil | 0.183 | 85 | 98 | 0 | 0 | 6 | 6 | 0 | 58 | 15 | 0 |
| Kokum Butter | 0.19 | 35 | 155 | 0 | 0 | 4 | 56 | 0 | 36 | 1 | 0 |
| Kpangnan Butter | 0.191 | 42 | 149 | 0 | 0 | 6 | 44 | 0 | 49 | 1 | 0 |
| Kukui nut Oil | 0.189 | 168 | 24 | 0 | 0 | 6 | 2 | 0 | 20 | 42 | 29 |
| Lanolin liquid Wax | 0.106 | 27 | 83 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Lard, Pig Tallow (Manteca) | 0.198 | 57 | 139 | 0 | 1 | 28 | 13 | 0 | 46 | 6 | 0 |
| Laurel Fruit Oil | 0.198 | 74 | 124 | 25 | 1 | 15 | 1 | 0 | 31 | 26 | 1 |
| Lauric Acid | 0.28 | 0 | 280 | 99 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| Linseed Oil, flax | 0.19 | 180 | -6 | 0 | 0 | 6 | 3 | 0 | 27 | 13 | 50 |
| Loofa Seed Oil, Luffa cylinderica | 0.187 | 108 | 79 | 0 | 0 | 9 | 18 | 0 | 30 | 47 | 0 |
| Macadamia Nut Butter | 0.188 | 70 | 118 | 0 | 1 | 6 | 12 | 0 | 56 | 3 | 1 |
| Macadamia Nut Oil | 0.195 | 76 | 119 | 0 | 0 | 9 | 5 | 0 | 59 | 2 | 0 |
| Mafura Butter, Trichilia emetica | 0.198 | 66 | 132 | 0 | 1 | 37 | 3 | 0 | 49 | 11 | 1 |
| Mango Seed Butter | 0.191 | 45 | 146 | 0 | 0 | 7 | 42 | 0 | 45 | 3 | 0 |
| Mango Seed Oil | 0.19 | 60 | 130 | 0 | 0 | 8 | 27 | 0 | 52 | 8 | 1 |
| Marula Oil | 0.192 | 73 | 119 | 0 | 0 | 11 | 7 | 0 | 75 | 4 | 0 |
| Meadowfoam Oil | 0.169 | 92 | 77 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Milk Fat, any bovine | 0.227 | 30 | 191 | 4 | 11 | 28 | 12 | 0 | 19 | 2 | 1 |
| Milk Thistle Oil | 0.196 | 115 | 81 | 0 | 0 | 7 | 2 | 0 | 26 | 64 | 0 |
| Mink Oil | 0.196 | 55 | 141 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Monoi de Tahiti Oil | 0.255 | 9 | 246 | 44 | 16 | 10 | 3 | 0 | 0 | 2 | 0 |
| Moringa Oil | 0.192 | 68 | 124 | 0 | 0 | 7 | 7 | 0 | 71 | 2 | 0 |
| Mowrah Butter | 0.194 | 62 | 132 | 0 | 0 | 24 | 22 | 0 | 36 | 15 | 0 |
| Murumuru Butter | 0.275 | 25 | 250 | 47 | 26 | 6 | 3 | 0 | 15 | 3 | 0 |
| Mustard Oil, kachi ghani | 0.173 | 101 | 72 | 0 | 0 | 2 | 2 | 0 | 18 | 14 | 9 |
| Myristic Acid | 0.247 | 1 | 246 | 0 | 99 | 0 | 0 | 0 | 0 | 0 | 0 |
| Neatsfoot Oil | 0.18 | 90 | 90 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Neem Seed Oil | 0.193 | 72 | 121 | 0 | 2 | 21 | 16 | 0 | 46 | 12 | 0 |
| Nutmeg Butter | 0.1624 | 46 | 116 | 3 | 83 | 4 | 0 | 0 | 5 | 0 | 0 |
| Oat Oil | 0.19 | 104 | 86 | 0 | 0 | 15 | 2 | 0 | 40 | 39 | 0 |
| Oleic Acid | 0.202 | 92 | 110 | 0 | 0 | 0 | 0 | 0 | 99 | 0 | 0 |
| Olive Oil | 0.19 | 85 | 105 | 0 | 0 | 14 | 3 | 0 | 69 | 12 | 1 |
| Olive Oil pomace | 0.188 | 84 | 104 | 0 | 0 | 14 | 3 | 0 | 69 | 12 | 2 |
| Ostrich Oil | 0.1946 | 97 | 128 | 3 | 1 | 26 | 6 | 0 | 37 | 17 | 3 |
| Palm Kernel Oil | 0.247 | 20 | 227 | 49 | 16 | 8 | 2 | 0 | 15 | 3 | 0 |
| Palm Kernel Oil Flakes, hydrogenated | 0.247 | 20 | 227 | 49 | 17 | 8 | 16 | 0 | 4 | 0 | 0 |
| Palm Oil | 0.199 | 53 | 145 | 0 | 1 | 44 | 5 | 0 | 39 | 10 | 0 |
| Palm Stearin | 0.199 | 48 | 151 | 0 | 2 | 60 | 5 | 0 | 26 | 7 | 0 |
| Palmitic Acid | 0.215 | 2 | 213 | 0 | 0 | 98 | 0 | 0 | 0 | 0 | 0 |
| Palmolein | 0.2 | 58 | 142 | 0 | 1 | 40 | 5 | 0 | 43 | 11 | 0 |
| Papaya seed oil, Carica papaya | 0.158 | 67 | 91 | 0 | 0 | 13 | 5 | 0 | 76 | 3 | 0 |
| Passion Fruit Seed Oil | 0.183 | 136 | 47 | 0 | 0 | 10 | 3 | 0 | 15 | 70 | 1 |
| Pataua (Patawa) Oil | 0.2 | 77 | 123 | 0 | 0 | 13 | 4 | 0 | 78 | 3 | 1 |
| Peach Kernel Oil | 0.191 | 108 | 87 | 0 | 0 | 6 | 2 | 0 | 65 | 25 | 1 |
| Peanut Oil | 0.192 | 92 | 99 | 0 | 0 | 8 | 3 | 0 | 56 | 26 | 0 |
| Pecan Oil | 0.19 | 113 | 77 | 0 | 0 | 7 | 2 | 0 | 50 | 39 | 2 |
| Perilla Seed Oil | 0.19 | 196 | -6 | 0 | 0 | 6 | 2 | 0 | 15 | 16 | 56 |
| Pine Tar, lye calc only no FA | 0.06 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Pistachio Oil | 0.186 | 95 | 92 | 0 | 0 | 11 | 1 | 0 | 63 | 25 | 0 |
| Plum Kernel Oil | 0.194 | 98 | 96 | 0 | 0 | 3 | 0 | 0 | 68 | 23 | 0 |
| Pomegranate Seed Oil | 0.19 | 22 | 168 | 0 | 0 | 3 | 3 | 0 | 7 | 7 | 78 |
| Poppy Seed Oil | 0.194 | 140 | 54 | 0 | 0 | 10 | 2 | 0 | 17 | 69 | 2 |
| Pracaxi (Pracachy) Seed Oil - hair conditioner | 0.175 | 68 | 107 | 1 | 1 | 2 | 2 | 0 | 44 | 2 | 2 |
| Pumpkin Seed Oil virgin | 0.195 | 128 | 67 | 0 | 0 | 11 | 8 | 0 | 33 | 50 | 0 |
| Rabbit Fat | 0.201 | 85 | 116 | 0 | 3 | 30 | 6 | 0 | 30 | 20 | 5 |
| Rapeseed Oil, unrefined canola | 0.175 | 106 | 69 | 0 | 0 | 4 | 1 | 0 | 17 | 13 | 9 |
| Raspberry Seed Oil | 0.187 | 163 | 24 | 0 | 0 | 3 | 0 | 0 | 13 | 55 | 26 |
| Red Palm Butter | 0.199 | 53 | 145 | 0 | 1 | 44 | 5 | 0 | 39 | 10 | 0 |
| Rice Bran Oil, refined | 0.187 | 100 | 87 | 0 | 1 | 22 | 3 | 0 | 38 | 34 | 2 |
| Rosehip Oil | 0.187 | 188 | 10 | 0 | 0 | 4 | 2 | 0 | 12 | 46 | 31 |
| Sacha Inchi, Plukenetia volubilis | 0.188 | 141 | 47 | 0 | 0 | 4 | 3 | 0 | 10 | 35 | 48 |
| Safflower Oil | 0.192 | 145 | 47 | 0 | 0 | 7 | 0 | 0 | 15 | 75 | 0 |
| Safflower Oil, high oleic | 0.19 | 93 | 97 | 0 | 0 | 5 | 2 | 0 | 77 | 15 | 0 |
| Sal Butter | 0.185 | 39 | 146 | 0 | 0 | 6 | 44 | 0 | 40 | 2 | 0 |
| Salmon Oil | 0.185 | 169 | 16 | 0 | 5 | 19 | 2 | 0 | 23 | 2 | 1 |
| Saw Palmetto Extract | 0.23 | 45 | 185 | 29 | 11 | 8 | 2 | 0 | 35 | 4 | 1 |
| Saw Palmetto Oil | 0.22 | 44 | 176 | 29 | 13 | 9 | 2 | 0 | 31 | 4 | 1 |
| Sea Buckthorn Oil, seed | 0.195 | 165 | 30 | 0 | 0 | 7 | 3 | 0 | 14 | 36 | 38 |
| Sea Buckthorn Oil, seed and berry | 0.183 | 86 | 97 | 0 | 0 | 30 | 1 | 0 | 28 | 10 | 0 |
| Sesame Oil | 0.188 | 110 | 81 | 0 | 0 | 10 | 5 | 0 | 40 | 43 | 0 |
| Shea Butter | 0.179 | 59 | 116 | 0 | 0 | 5 | 40 | 0 | 48 | 6 | 0 |
| Shea Oil, fractionated | 0.185 | 83 | 102 | 0 | 0 | 6 | 10 | 0 | 73 | 11 | 0 |
| SoapQuick, conventional | 0.212 | 59 | 153 | 13 | 6 | 17 | 3 | 5 | 42 | 8 | 1 |
| SoapQuick, organic | 0.213 | 56 | 156 | 13 | 5 | 20 | 3 | 0 | 45 | 10 | 0 |
| Soybean Oil | 0.191 | 131 | 61 | 0 | 0 | 11 | 5 | 0 | 24 | 50 | 8 |
| Soybean, 27.5% hydrogenated | 0.191 | 78 | 113 | 0 | 0 | 9 | 15 | 0 | 41 | 7 | 1 |
| Soybean, fully hydrogenated (soy wax) | 0.192 | 1 | 191 | 0 | 0 | 11 | 87 | 0 | 0 | 0 | 0 |
| Stearic Acid | 0.198 | 2 | 196 | 0 | 0 | 0 | 99 | 0 | 0 | 0 | 0 |
| Sunflower Oil | 0.189 | 133 | 63 | 0 | 0 | 7 | 4 | 0 | 16 | 70 | 1 |
| Sunflower Oil, high oleic | 0.189 | 83 | 106 | 0 | 0 | 3 | 4 | 0 | 83 | 4 | 1 |
| Tallow Bear | 0.1946 | 92 | 100 | 0 | 2 | 7 | 3 | 0 | 70 | 9 | 0 |
| Tallow Beef | 0.2 | 45 | 147 | 2 | 6 | 28 | 22 | 0 | 36 | 3 | 1 |
| Tallow Deer | 0.193 | 31 | 166 | 0 | 1 | 20 | 24 | 0 | 30 | 15 | 3 |
| Tallow Goat | 0.192 | 40 | 152 | 5 | 11 | 23 | 30 | 0 | 29 | 2 | 0 |
| Tallow Sheep | 0.194 | 54 | 156 | 4 | 10 | 24 | 13 | 0 | 26 | 5 | 0 |
| Tamanu Oil, kamani | 0.208 | 111 | 82 | 0 | 0 | 12 | 13 | 0 | 34 | 38 | 1 |
| Tucuma Seed Butter | 0.238 | 13 | 175 | 48 | 23 | 6 | 0 | 0 | 13 | 0 | 0 |
| Ucuuba Butter | 0.205 | 38 | 167 | 0 | 0 | 0 | 31 | 0 | 44 | 5 | 0 |
| Walmart GV Shortening, tallow, palm | 0.198 | 49 | 151 | 1 | 4 | 35 | 14 | 0 | 37 | 6 | 1 |
| Walnut Oil | 0.189 | 145 | 45 | 0 | 0 | 7 | 2 | 0 | 18 | 60 | 0 |
| Watermelon Seed Oil | 0.19 | 119 | 71 | 0 | 0 | 11 | 10 | 0 | 18 | 60 | 1 |
| Wheat Germ Oil | 0.183 | 128 | 58 | 0 | 0 | 17 | 2 | 0 | 17 | 58 | 0 |
| Yangu, cape chestnut | 0.192 | 95 | 97 | 0 | 0 | 18 | 5 | 0 | 45 | 30 | 1 |
| Zapote seed oil, (Aceite de Sapuyul or Mamey) | 0.188 | 72 | 116 | 0 | 0 | 9 | 21 | 0 | 52 | 13 | 0 |
"""

def name_to_id(name):
    """Convert oil name to slug ID"""
    # Remove special characters and convert to lowercase
    id_str = name.lower()
    # Replace special chars with spaces
    id_str = re.sub(r'[(),/]', ' ', id_str)
    # Remove extra text in parentheses
    id_str = re.sub(r'\s+\w+\s+\w+\s+\w+$', '', id_str)  
    # Replace spaces with hyphens
    id_str = re.sub(r'\s+', '-', id_str.strip())
    # Remove multiple hyphens
    id_str = re.sub(r'-+', '-', id_str)
    # Remove trailing hyphens
    id_str = id_str.strip('-')
    return id_str

def determine_category(name, ins, lauric, myristic):
    """Determine oil category based on properties"""
    name_lower = name.lower()
    
    if 'butter' in name_lower or 'wax' in name_lower:
        return 'Butter'
    elif 'tallow' in name_lower or 'lard' in name_lower or 'fat' in name_lower:
        return 'Animal Fat'
    elif 'acid' in name_lower:
        return 'Fatty Acid'
    elif ins > 160:
        return 'Hard Oil'
    elif (lauric + myristic) > 40:
        return 'Hard Oil'
    elif ins < 100:
        return 'Liquid Oil'
    else:
        return 'Soft Oil'

def parse_oils():
    """Parse the oil data and generate SQL"""
    oils = []
    
    for line in oils_data.strip().split('\n'):
        if not line.strip() or not line.startswith('|'):
            continue
            
        # Parse the table row
        parts = [p.strip() for p in line.split('|')[1:-1]]  # Skip empty first and last
        
        if len(parts) != 12:
            continue
            
        name, sap, iodine, ins, lauric, myristic, palmitic, stearic, ricinoleic, oleic, linoleic, linolenic = parts
        
        oil_id = name_to_id(name)
        category = determine_category(name, int(ins), int(lauric), int(myristic))
        
        fatty_acids = {
            "lauric": int(lauric),
            "myristic": int(myristic),
            "palmitic": int(palmitic),
            "stearic": int(stearic),
            "ricinoleic": int(ricinoleic),
            "oleic": int(oleic),
            "linoleic": int(linoleic),
            "linolenic": int(linolenic)
        }
        
        oils.append({
            'id': oil_id,
            'name': name,
            'sap': sap,
            'iodine': iodine,
            'ins': ins,
            'category': category,
            'fatty_acids': json.dumps(fatty_acids)
        })
    
    return oils

def generate_sql(oils):
    """Generate SQL INSERT statements"""
    sql = []
    sql.append("-- =====================================================")
    sql.append("-- SEED ALL OILS FROM OIL_DATABASE.md")
    sql.append("-- =====================================================")
    sql.append(f"-- Total oils: {len(oils)}")
    sql.append("-- Generated automatically")
    sql.append("-- =====================================================\n")
    sql.append("INSERT INTO oils (id, name, sap_naoh, sap_koh, iodine, ins, category, fatty_acids, is_system) VALUES")
    
    for i, oil in enumerate(oils):
        comma = "," if i < len(oils) - 1 else ";"
        name_escaped = oil['name'].replace("'", "''")
        sql.append(f"('{oil['id']}', '{name_escaped}', {oil['sap']}, {oil['sap']}, {oil['iodine']}, {oil['ins']}, '{oil['category']}', '{oil['fatty_acids']}'::JSONB, true){comma}")
    
    sql.append("\n-- Verification query:")
    sql.append("-- SELECT category, COUNT(*) as count FROM oils WHERE is_system = true GROUP BY category ORDER BY count DESC;")
    
    return '\n'.join(sql)

if __name__ == '__main__':
    oils = parse_oils()
    sql = generate_sql(oils)
    
    # Write to file
    output_file = 'supabase/migrations/20251109000003_seed_all_oils.sql'
    with open(output_file, 'w') as f:
        f.write(sql)
    
    print(f"✅ Generated SQL for {len(oils)} oils")
    print(f"📁 File: {output_file}")
    print(f"\nTo apply:")
    print(f"1. Copy the contents of {output_file}")
    print(f"2. Paste into Supabase SQL Editor")
    print(f"3. Run the query")
