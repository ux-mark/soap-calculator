# Deployment Guide

## Deploying to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications and is created by the same team.

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Soap Calculator"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy with Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Configure Environment Variables** (if adding Supabase later)
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add any necessary environment variables
   - Redeploy if needed

### Custom Domain

1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

## Alternative: Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

## Alternative: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Build and run**
   ```bash
   docker build -t soap-calculator .
   docker run -p 3000:3000 soap-calculator
   ```

## Environment Variables

If you add Supabase or other services, create a `.env.local` file:

```env
# Supabase (when implemented)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

**Important**: Never commit `.env.local` to version control!

## Build Optimization

The application is already optimized with:
- ✅ Server-side rendering (SSR) disabled for client components
- ✅ Automatic code splitting
- ✅ Image optimization (when images are added)
- ✅ CSS optimization via Tailwind
- ✅ Bundle size optimization

## Performance Monitoring

After deployment, consider adding:
- Vercel Analytics (built-in)
- Google Analytics
- Sentry for error tracking

## Post-Deployment Checklist

- [ ] Test all calculator functions
- [ ] Verify responsive design on mobile
- [ ] Test print functionality
- [ ] Check oil selection and recommendations
- [ ] Validate calculations against known recipes
- [ ] Test export/download features
- [ ] Verify accessibility features
- [ ] Check page load speed
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)

## Updating the Application

```bash
# Make changes to code
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically redeploy on push to main branch.

## Rollback

If something breaks:
1. Go to Vercel dashboard
2. Click on "Deployments"
3. Find the last working deployment
4. Click "Promote to Production"

## Support

For deployment issues:
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs
- GitHub: Check repository issues

---

**Happy Deploying! 🚀**
