# Supabase Implementation Plan
## Soap Calculator Database Integration

**Last Updated:** November 9, 2025  
**Estimated Timeline:** 2-3 weeks  
**Status:** Planning Phase

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Supabase Setup](#phase-1-supabase-setup)
4. [Phase 2: Database Schema Implementation](#phase-2-database-schema-implementation)
5. [Phase 3: Authentication](#phase-3-authentication)
6. [Phase 4: Core Features](#phase-4-core-features)
7. [Phase 5: Advanced Features](#phase-5-advanced-features)
8. [Phase 6: Testing & Deployment](#phase-6-testing--deployment)
9. [Rollback Plan](#rollback-plan)

---

## Overview

### Goals
Transform the current client-side Soap Calculator into a full-stack application with:
- ✅ User authentication
- ✅ Cloud recipe storage
- ✅ Recipe sharing and discovery
- ✅ Custom oil database
- ✅ Collections and organization
- ✅ Ratings and reviews

### Current State
- Client-side only (no backend)
- Hardcoded oil database
- No user accounts
- No persistence (browser localStorage only)
- No sharing capabilities

### Target State
- Full-stack Next.js + Supabase
- User authentication (email, OAuth)
- Cloud database with RLS
- Real-time sync
- Public recipe sharing
- Advanced features (ratings, comments, collections)

### Success Metrics
- User signup/login working
- Recipes saved to database
- Recipe sharing functional
- Performance < 2s load time
- 99.9% uptime

---

## Prerequisites

### Required Accounts
- [ ] Supabase account (free tier to start)
- [ ] Vercel account (for deployment)
- [ ] GitHub account (for version control)

### Development Tools
- [ ] Node.js 18+
- [ ] npm or yarn
- [ ] Git
- [ ] Supabase CLI (optional but recommended)

### Skills Required
- TypeScript/JavaScript
- React/Next.js
- SQL basics
- PostgreSQL knowledge (helpful)

---

## Phase 1: Supabase Setup
**Duration:** 1-2 days  
**Priority:** Critical

### 1.1 Create Supabase Project

**Steps:**
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Enter project details:
   - Name: `soap-calculator`
   - Database Password: (generate strong password - SAVE THIS!)
   - Region: Choose closest to target users
   - Pricing Plan: Free (upgrade later if needed)
5. Wait for project to initialize (~2 minutes)

**Deliverables:**
- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Project URL noted
- [ ] API keys copied

---

### 1.2 Install Supabase Dependencies

```bash
cd /Users/markwhooley/Documents/1-UPLOAD\ TO\ NAS/Soap-Calculator

# Install Supabase client library
npm install @supabase/supabase-js

# Install Supabase auth helpers for Next.js
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react

# Install additional utilities
npm install date-fns uuid
npm install -D @types/uuid
```

**Deliverables:**
- [ ] Dependencies installed
- [ ] package.json updated
- [ ] No installation errors

---

### 1.3 Environment Configuration

Create `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Add to `.gitignore`:
```
.env.local
.env*.local
```

**Deliverables:**
- [ ] `.env.local` created with real values
- [ ] Environment variables working
- [ ] `.env.local` in `.gitignore`
- [ ] `.env.example` created for team

---

### 1.4 Create Supabase Client Utilities

Create `/lib/supabase/client.ts`:
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase/database.types'

export const createClient = () => {
  return createClientComponentClient<Database>()
}
```

Create `/lib/supabase/server.ts`:
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
```

Create `/lib/supabase/middleware.ts`:
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  await supabase.auth.getSession()
  
  return res
}
```

**Deliverables:**
- [ ] Client utilities created
- [ ] TypeScript types generated
- [ ] No compilation errors

---

## Phase 2: Database Schema Implementation
**Duration:** 3-4 days  
**Priority:** Critical

### 2.1 Set Up Database Tables

**Option A: Using Supabase Dashboard (Recommended for Beginners)**

1. Go to Supabase Dashboard → SQL Editor
2. Copy schema from `SUPABASE_DATABASE_SCHEMA.md`
3. Execute table creation SQL
4. Verify tables created

**Option B: Using Migration Files (Recommended for Production)**

Install Supabase CLI:
```bash
npm install -g supabase
supabase login
supabase init
supabase link --project-ref your-project-ref
```

Create migration:
```bash
supabase migration new initial_schema
```

Copy schema SQL to migration file, then:
```bash
supabase db push
```

**Tables to Create (in order):**
1. ✅ `profiles`
2. ✅ `custom_oils`
3. ✅ `recipes`
4. ✅ `recipe_oils`
5. ✅ `collections`
6. ✅ `collection_recipes`
7. ✅ `saved_recipes`
8. ✅ `recipe_ratings`
9. ✅ `recipe_comments`
10. ✅ `recipe_forks`
11. ✅ `activity_log`
12. ✅ `app_settings`

**Deliverables:**
- [ ] All tables created
- [ ] Foreign keys established
- [ ] Constraints applied
- [ ] No SQL errors

---

### 2.2 Set Up Row Level Security (RLS)

Execute RLS policies from schema document:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- Create policies for each table
CREATE POLICY "Users can read own profile" ON profiles...
-- ... (all policies)
```

**Test RLS:**
1. Create test user
2. Try to access another user's data
3. Verify access denied
4. Verify own data accessible

**Deliverables:**
- [ ] RLS enabled on all tables
- [ ] Policies created and tested
- [ ] Security verified

---

### 2.3 Create Indexes

Execute index creation SQL:
```sql
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_search ON recipes USING GIN(...);
-- ... (all indexes from schema)
```

**Deliverables:**
- [ ] All indexes created
- [ ] Query performance tested
- [ ] Explain plans reviewed

---

### 2.4 Set Up Functions & Triggers

Execute function and trigger SQL:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()...
CREATE TRIGGER update_profiles_updated_at...
-- ... (all functions and triggers)
```

**Test Triggers:**
1. Insert test recipe → verify `created_at`
2. Update test recipe → verify `updated_at`
3. Rate a recipe → verify `rating_avg` updates
4. Delete rating → verify count decreases

**Deliverables:**
- [ ] All functions created
- [ ] All triggers created
- [ ] Trigger behavior verified

---

### 2.5 Seed Initial Data

Create seed file `/supabase/seed.sql`:

```sql
-- Seed system oils from existing oilData.ts
INSERT INTO custom_oils (oil_id, name, sap_naoh, sap_koh, fatty_acids, iodine, ins, category, is_verified)
VALUES
  ('coconut-oil-76', 'Coconut Oil, 76 deg', 0.183, 0.257, '{"lauric":48,"myristic":19,...}', 10, 258, 'Hard Oil', true),
  ('palm-oil', 'Palm Oil', 0.141, 0.198, '{"lauric":0,"myristic":1,...}', 53, 145, 'Hard Oil', true),
  -- ... (all oils from OILS_DATABASE)
;

-- Seed default quality ranges
INSERT INTO app_settings (key, value, description)
VALUES
  ('hard_soap_quality_ranges', '{"hardness":{"min":29,"max":54,...},...}', 'Quality ranges for hard bar soap'),
  ('liquid_soap_quality_ranges', '{"hardness":{"min":5,"max":15,...},...}', 'Quality ranges for liquid soap');
```

Run seed:
```bash
psql -h your-db-host -U postgres -d postgres -f supabase/seed.sql
# OR via Supabase Dashboard SQL Editor
```

**Deliverables:**
- [ ] System oils seeded
- [ ] Default settings seeded
- [ ] Data verified in database

---

### 2.6 Generate TypeScript Types

```bash
# Using Supabase CLI
supabase gen types typescript --project-id your-project-ref > lib/supabase/database.types.ts

# OR manually export from Supabase Dashboard → API → TypeScript
```

**Deliverables:**
- [ ] `database.types.ts` generated
- [ ] Types imported in client/server files
- [ ] No TypeScript errors

---

## Phase 3: Authentication
**Duration:** 2-3 days  
**Priority:** Critical

### 3.1 Configure Authentication Providers

**In Supabase Dashboard → Authentication → Providers:**

1. **Email Provider:**
   - [x] Enable email authentication
   - [x] Enable email confirmations (optional)
   - Set redirect URLs

2. **OAuth Providers (Optional):**
   - [ ] Google OAuth
   - [ ] GitHub OAuth
   - [ ] Configure client IDs and secrets

3. **Settings:**
   - Set site URL: `http://localhost:3000` (dev), `https://yourdomain.com` (prod)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback`

**Deliverables:**
- [ ] Email auth enabled
- [ ] OAuth configured (if using)
- [ ] Redirect URLs set

---

### 3.2 Create Authentication Components

**Create `/components/auth/LoginForm.tsx`:**
```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) console.error('Login error:', error.message)
    else console.log('Logged in:', data.user)
  }

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Log In</button>
    </form>
  )
}
```

**Create similar components:**
- `/components/auth/SignupForm.tsx`
- `/components/auth/ResetPasswordForm.tsx`
- `/components/auth/UserMenu.tsx`
- `/components/auth/AuthProvider.tsx`

**Deliverables:**
- [ ] Login form created
- [ ] Signup form created
- [ ] Password reset form created
- [ ] User menu/dropdown created
- [ ] Auth context provider created

---

### 3.3 Create Authentication Pages

**Create `/app/login/page.tsx`:**
```typescript
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1>Log In</h1>
        <LoginForm />
      </div>
    </div>
  )
}
```

**Create similar pages:**
- `/app/signup/page.tsx`
- `/app/reset-password/page.tsx`
- `/app/auth/callback/route.ts` (OAuth callback handler)

**Deliverables:**
- [ ] Login page created
- [ ] Signup page created
- [ ] Password reset page created
- [ ] OAuth callback route created

---

### 3.4 Implement Auth Middleware

Update `/middleware.ts`:
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protect routes that require authentication
  const protectedRoutes = ['/recipes/new', '/profile', '/collections']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return res
}

export const config = {
  matcher: ['/recipes/:path*', '/profile/:path*', '/collections/:path*']
}
```

**Deliverables:**
- [ ] Middleware configured
- [ ] Protected routes defined
- [ ] Redirects working

---

### 3.5 Update App Layout with Auth

Update `/app/layout.tsx`:
```typescript
import { createServerClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/auth/UserMenu'

export default async function RootLayout({ children }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <html>
      <body>
        <header>
          <nav>
            <Link href="/">Soap Calculator</Link>
            {session ? (
              <>
                <Link href="/recipes">My Recipes</Link>
                <UserMenu user={session.user} />
              </>
            ) : (
              <>
                <Link href="/login">Log In</Link>
                <Link href="/signup">Sign Up</Link>
              </>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
```

**Deliverables:**
- [ ] Navigation updated with auth
- [ ] User menu showing when logged in
- [ ] Login/signup links when logged out

---

### 3.6 Test Authentication Flow

**Test Cases:**
1. [ ] Sign up new user → receives confirmation email
2. [ ] Confirm email → account activated
3. [ ] Log in with email/password → session created
4. [ ] Access protected route → redirected if not logged in
5. [ ] Log out → session cleared
6. [ ] Reset password → email sent → password changed
7. [ ] OAuth login (if enabled) → account created/linked

**Deliverables:**
- [ ] All auth flows tested
- [ ] No errors in console
- [ ] Sessions persisting correctly

---

## Phase 4: Core Features
**Duration:** 5-7 days  
**Priority:** High

### 4.1 User Profile Management

**Create `/app/profile/page.tsx`:**
```typescript
import { createServerClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return <ProfileForm profile={profile} />
}
```

**Create `/components/profile/ProfileForm.tsx`:**
- Username input
- Full name input
- Bio textarea
- Avatar upload
- Preferences (default unit, soap type, superfat)
- Save button

**API Route `/app/api/profile/route.ts`:**
```typescript
export async function PATCH(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const updates = await req.json()
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
```

**Deliverables:**
- [ ] Profile page created
- [ ] Profile form working
- [ ] Profile updates saving
- [ ] Avatar upload functional (if implemented)

---

### 4.2 Recipe Saving & Loading

**Update `/contexts/CalculatorContext.tsx`:**

Add database methods:
```typescript
const saveRecipe = async (name: string, description?: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      name,
      description,
      inputs: inputs,
      selected_oils: selectedOils,
      calculated_results: results,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

const loadRecipe = async (recipeId: string) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single()
  
  if (error) throw error
  
  // Restore state
  setSelectedOils(data.selected_oils)
  setInputs(data.inputs)
  setResults(data.calculated_results)
  
  return data
}
```

**Create `/components/calculator/SaveRecipeDialog.tsx`:**
- Recipe name input
- Description textarea
- Save as public checkbox
- Tags input
- Save button

**Deliverables:**
- [ ] Save recipe dialog created
- [ ] Recipe saving to database
- [ ] Recipe loading from database
- [ ] State restored correctly

---

### 4.3 Recipe List & Management

**Create `/app/recipes/page.tsx`:**
```typescript
export default async function RecipesPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  return (
    <div>
      <h1>My Recipes</h1>
      <RecipeList recipes={recipes} />
    </div>
  )
}
```

**Create `/components/recipes/RecipeList.tsx`:**
- Recipe cards grid
- Search/filter
- Sort options
- Pagination
- Delete confirmation

**Create `/components/recipes/RecipeCard.tsx`:**
- Recipe name
- Description preview
- Oil count
- Quality preview
- Created date
- Edit/Delete buttons
- Public/Private badge

**Deliverables:**
- [ ] Recipe list page created
- [ ] Recipe cards displaying
- [ ] Search/filter working
- [ ] Edit recipe functional
- [ ] Delete recipe working

---

### 4.4 Recipe Detail View

**Create `/app/recipes/[id]/page.tsx`:**
```typescript
export default async function RecipePage({ params }) {
  const supabase = createServerClient()
  
  const { data: recipe } = await supabase
    .from('recipes')
    .select('*, profiles(username, avatar_url)')
    .eq('id', params.id)
    .single()
  
  if (!recipe) notFound()
  
  return <RecipeDetailView recipe={recipe} />
}
```

**Create `/components/recipes/RecipeDetailView.tsx`:**
- Recipe header (name, author, date)
- Oil list with percentages
- Calculation results
- Quality metrics
- Instructions
- Print button
- Fork/Copy button
- Share button

**Deliverables:**
- [ ] Recipe detail page created
- [ ] All recipe info displaying
- [ ] Print functionality working
- [ ] Fork recipe working

---

### 4.5 Integrate with Calculator

**Update `/app/page.tsx` (main calculator):**

Add auth awareness:
```typescript
export default async function CalculatorPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <CalculatorProvider user={user}>
      <div className="calculator-layout">
        <InputSection />
        <OilSelector />
        <SelectedOilsList />
        <QualityDisplay />
        <CalculationResults />
        
        {user && <SaveRecipeButton />}
      </div>
    </CalculatorProvider>
  )
}
```

**Deliverables:**
- [ ] Calculator shows save button when logged in
- [ ] Save functionality integrated
- [ ] Load recipe from URL working
- [ ] Auto-save (optional)

---

## Phase 5: Advanced Features
**Duration:** 5-7 days  
**Priority:** Medium

### 5.1 Public Recipe Discovery

**Create `/app/discover/page.tsx`:**
```typescript
export default async function DiscoverPage({ searchParams }) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('recipes')
    .select('*, profiles(username, avatar_url)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
  
  // Apply filters
  if (searchParams.search) {
    query = query.textSearch('name', searchParams.search)
  }
  
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  
  const { data: recipes } = await query
  
  return <DiscoverView recipes={recipes} />
}
```

**Features:**
- Search bar
- Category filter
- Sort options (newest, popular, highest rated)
- Featured recipes
- Infinite scroll/pagination

**Deliverables:**
- [ ] Discover page created
- [ ] Search working
- [ ] Filters working
- [ ] Featured recipes shown

---

### 5.2 Recipe Ratings & Reviews

**Create `/components/recipes/RatingForm.tsx`:**
```typescript
async function submitRating(recipeId: string, rating: number, review?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Must be logged in')
  
  const { data, error } = await supabase
    .from('recipe_ratings')
    .upsert({
      recipe_id: recipeId,
      user_id: user.id,
      rating,
      review,
    })
  
  if (error) throw error
  return data
}
```

**Create `/components/recipes/ReviewsList.tsx`:**
- Display all reviews for a recipe
- Star rating display
- Review text
- Helpful votes
- Report inappropriate button

**Deliverables:**
- [ ] Rating form created
- [ ] Submit rating working
- [ ] Reviews displaying
- [ ] Rating average updating

---

### 5.3 Recipe Comments

**Create `/components/recipes/CommentSection.tsx`:**
```typescript
async function postComment(recipeId: string, content: string, parentId?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Must be logged in')
  
  const { data, error } = await supabase
    .from('recipe_comments')
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      content,
      parent_comment_id: parentId,
    })
  
  if (error) throw error
  return data
}
```

**Features:**
- Comment input
- Threaded replies
- Edit/delete own comments
- Real-time updates (optional)

**Deliverables:**
- [ ] Comment section created
- [ ] Post comment working
- [ ] Threaded replies working
- [ ] Edit/delete working

---

### 5.4 Collections & Organization

**Create `/app/collections/page.tsx`:**
```typescript
export default async function CollectionsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data: collections } = await supabase
    .from('collections')
    .select('*, collection_recipes(count)')
    .eq('user_id', user.id)
  
  return <CollectionsView collections={collections} />
}
```

**Create `/components/collections/CreateCollectionDialog.tsx`:**
- Collection name
- Description
- Color picker
- Icon selector
- Public/private toggle

**Create `/components/collections/AddToCollectionButton.tsx`:**
- Shows on recipe cards
- Dropdown of user's collections
- Add to multiple collections

**Deliverables:**
- [ ] Collections page created
- [ ] Create collection working
- [ ] Add recipe to collection working
- [ ] Collection detail view created

---

### 5.5 Custom Oils

**Create `/app/oils/custom/page.tsx`:**
```typescript
export default async function CustomOilsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data: customOils } = await supabase
    .from('custom_oils')
    .select('*')
    .eq('user_id', user.id)
  
  return <CustomOilsView oils={customOils} />
}
```

**Create `/components/oils/CustomOilForm.tsx`:**
- Oil name
- SAP values (NaOH, KOH)
- Fatty acid profile inputs
- Iodine value
- INS value
- Category selector
- Source/notes

**Update Oil Selector:**
- Show system oils + user's custom oils
- Mark custom oils with badge
- Allow selecting custom oils in calculator

**Deliverables:**
- [ ] Custom oils page created
- [ ] Add custom oil working
- [ ] Custom oils available in calculator
- [ ] Edit/delete custom oils working

---

### 5.6 Recipe Forking/Copying

**Create fork recipe function:**
```typescript
async function forkRecipe(originalRecipeId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Must be logged in')
  
  // Get original recipe
  const { data: original } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', originalRecipeId)
    .single()
  
  // Create new recipe
  const { data: forked, error } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      name: `${original.name} (Copy)`,
      description: original.description,
      inputs: original.inputs,
      selected_oils: original.selected_oils,
      is_public: false,
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Log the fork
  await supabase
    .from('recipe_forks')
    .insert({
      original_recipe_id: originalRecipeId,
      forked_recipe_id: forked.id,
      user_id: user.id,
    })
  
  return forked
}
```

**Add to recipe detail page:**
- Fork button
- Show fork count
- Link to original recipe (if forked)

**Deliverables:**
- [ ] Fork recipe working
- [ ] Fork tracking in database
- [ ] Fork count displaying
- [ ] Attribution to original

---

### 5.7 Saved/Bookmarked Recipes

**Create save recipe function:**
```typescript
async function saveRecipe(recipeId: string, notes?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Must be logged in')
  
  const { data, error } = await supabase
    .from('saved_recipes')
    .insert({
      user_id: user.id,
      recipe_id: recipeId,
      notes,
    })
  
  if (error) throw error
  return data
}
```

**Create `/app/saved/page.tsx`:**
- List of saved recipes
- Personal notes visible
- Remove from saved
- Open recipe

**Add to recipe cards:**
- Bookmark button
- Shows if already saved
- Click to save/unsave

**Deliverables:**
- [ ] Save recipe working
- [ ] Saved recipes page created
- [ ] Bookmark button on cards
- [ ] Personal notes working

---

### 5.8 Activity Feed

**Create `/app/activity/page.tsx`:**
```typescript
export default async function ActivityPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data: activities } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)
  
  return <ActivityFeed activities={activities} />
}
```

**Activity types:**
- Recipe created
- Recipe published
- Recipe rated
- Comment posted
- Recipe forked
- Recipe saved

**Deliverables:**
- [ ] Activity feed page created
- [ ] Activities displaying
- [ ] Activity icons/formatting
- [ ] Links to entities working

---

## Phase 6: Testing & Deployment
**Duration:** 3-4 days  
**Priority:** Critical

### 6.1 Testing

**Unit Tests:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Create tests for:
- [ ] Database queries
- [ ] Authentication flows
- [ ] Recipe calculations
- [ ] RLS policies

**Integration Tests:**
- [ ] End-to-end user flows
- [ ] API routes
- [ ] Database triggers

**Manual Testing Checklist:**
- [ ] Sign up new user
- [ ] Create recipe (private)
- [ ] Edit recipe
- [ ] Delete recipe
- [ ] Publish recipe (make public)
- [ ] View public recipe (logged out)
- [ ] Rate recipe
- [ ] Comment on recipe
- [ ] Fork recipe
- [ ] Save recipe to collection
- [ ] Create custom oil
- [ ] Use custom oil in recipe
- [ ] Search recipes
- [ ] Filter by category
- [ ] Sort by various fields
- [ ] Pagination working
- [ ] Mobile responsiveness

**Deliverables:**
- [ ] Test suite created
- [ ] All tests passing
- [ ] Manual testing complete
- [ ] Bugs documented and fixed

---

### 6.2 Performance Optimization

**Database:**
- [ ] Verify all indexes created
- [ ] Run EXPLAIN ANALYZE on slow queries
- [ ] Add missing indexes
- [ ] Consider materialized views for popular queries

**Frontend:**
- [ ] Implement pagination (not loading all recipes)
- [ ] Add loading states
- [ ] Optimize images
- [ ] Code splitting
- [ ] Lazy loading

**Caching:**
- [ ] Cache public recipe lists
- [ ] Cache user profiles
- [ ] Implement SWR or React Query
- [ ] Set appropriate cache headers

**Deliverables:**
- [ ] Lighthouse score > 90
- [ ] Page load time < 2s
- [ ] No unnecessary re-renders
- [ ] Database queries optimized

---

### 6.3 Security Audit

**Checklist:**
- [ ] All API routes have auth checks
- [ ] RLS policies prevent unauthorized access
- [ ] No secrets in client-side code
- [ ] Input validation on all forms
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting on sensitive endpoints
- [ ] SQL injection prevention (using parameterized queries)

**Tools:**
- [ ] Run `npm audit`
- [ ] Check dependencies for vulnerabilities
- [ ] Review Supabase security settings

**Deliverables:**
- [ ] Security audit complete
- [ ] Vulnerabilities fixed
- [ ] Documentation updated

---

### 6.4 Documentation

**User Documentation:**
- [ ] Update README.md
- [ ] Create USER_GUIDE.md
- [ ] Document all features
- [ ] Add screenshots
- [ ] Create video tutorials (optional)

**Developer Documentation:**
- [ ] API documentation
- [ ] Database schema docs (already done)
- [ ] Component documentation
- [ ] Deployment guide
- [ ] Contributing guidelines

**Deliverables:**
- [ ] All docs updated
- [ ] Clear and comprehensive
- [ ] Examples included

---

### 6.5 Deployment Preparation

**Environment Setup:**
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# Optional
NEXT_PUBLIC_SITE_URL=https://soapcalculator.com
```

**Supabase Production Checklist:**
- [ ] Production database configured
- [ ] RLS policies enabled and tested
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Custom domain configured (optional)
- [ ] Email templates customized
- [ ] Auth redirect URLs updated

**Vercel Setup:**
- [ ] Connect GitHub repository
- [ ] Add environment variables
- [ ] Configure build settings
- [ ] Set up custom domain (optional)
- [ ] Enable analytics

**Deliverables:**
- [ ] Production environment ready
- [ ] Deploy successful
- [ ] Smoke tests passing

---

### 6.6 Post-Deployment

**Monitoring:**
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor Supabase dashboard
- [ ] Set up uptime monitoring
- [ ] Create alerts for errors

**Analytics:**
- [ ] Google Analytics / Plausible
- [ ] Track key metrics (signups, recipes created, etc.)
- [ ] Monitor user behavior

**Backup:**
- [ ] Configure automated backups
- [ ] Test restore procedure
- [ ] Document backup strategy

**Deliverables:**
- [ ] Monitoring active
- [ ] Analytics collecting data
- [ ] Backup verified

---

## Rollback Plan

### If Things Go Wrong

**Option 1: Feature Flag**
- Keep old localStorage-based system
- Feature flag to enable/disable database
- Allow users to migrate gradually

**Option 2: Dual Mode**
- Support both local and cloud modes
- User chooses preference
- Data migration tool

**Option 3: Full Rollback**
- Revert to previous version
- Keep database for future use
- Learn from issues

**Data Migration Safety:**
- Always allow export of user data
- Provide JSON export before major changes
- Never delete data without confirmation
- Keep audit log of deletions

---

## Timeline Summary

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Supabase Setup | 1-2 days | Critical |
| Phase 2: Database Schema | 3-4 days | Critical |
| Phase 3: Authentication | 2-3 days | Critical |
| Phase 4: Core Features | 5-7 days | High |
| Phase 5: Advanced Features | 5-7 days | Medium |
| Phase 6: Testing & Deployment | 3-4 days | Critical |
| **Total** | **19-27 days** | - |

**Realistic Timeline:** 3-4 weeks for full implementation

---

## Resource Requirements

### Development
- 1 full-time developer (you)
- ~20-30 hours/week
- 3-4 weeks total

### Costs
- Supabase: Free tier (up to 500MB database, 50,000 monthly active users)
- Vercel: Free tier (unlimited websites, 100GB bandwidth)
- Domain: ~$10-15/year (optional)

**Total startup cost:** $0-15

### Ongoing
- Scale up Supabase if needed (~$25/month for Pro)
- Scale up Vercel if traffic increases (~$20/month)

---

## Success Criteria

**MVP (Minimum Viable Product):**
- ✅ Users can sign up/login
- ✅ Users can save recipes
- ✅ Users can load recipes
- ✅ Recipes can be made public
- ✅ Public recipes are discoverable

**Full Launch:**
- ✅ All MVP features
- ✅ Collections working
- ✅ Ratings/reviews working
- ✅ Comments working
- ✅ Custom oils working
- ✅ Performance optimized
- ✅ Fully documented

---

## Next Steps

1. **Review this plan** - Adjust timeline/scope as needed
2. **Set up Supabase account** - Create project
3. **Start Phase 1** - Begin setup
4. **Build incrementally** - Test each phase
5. **Deploy MVP** - Get it live
6. **Gather feedback** - Iterate and improve

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Discord:** Community support
- **Stack Overflow:** Technical questions

---

**Ready to begin?** Start with Phase 1! 🚀
