# Vercel Environment Variables Setup Guide

## Quick Reference

Your Soap Calculator app uses **Supabase** for the database, and these credentials need to be configured in Vercel for deployment.

---

## ✅ What You Have (Local)

Your `.env.local` file contains:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tztutumdgxbpqwavkxxm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

This works perfectly for local development. ✨

---

## 🚀 What You Need to Do for Vercel

### Step 1: Access Vercel Environment Variables

1. Go to [vercel.com](https://vercel.com)
2. Select your **Soap Calculator** project
3. Click **Settings** tab
4. Click **Environment Variables** in the sidebar

### Step 2: Add Required Variables

Add these **2 required variables**:

#### Variable 1: Supabase URL
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://tztutumdgxbpqwavkxxm.supabase.co`
- **Environments:** Select all (Production, Preview, Development)

#### Variable 2: Supabase Anon Key
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** (Copy from your `.env.local` file - the long JWT token)
- **Environments:** Select all (Production, Preview, Development)

### Step 3: Save and Redeploy

1. Click **Save** after adding each variable
2. Go to **Deployments** tab
3. Click **Redeploy** on your latest deployment
4. Wait for deployment to complete

---

## 🔍 Verification

After deployment, verify the connection works:

1. Visit your deployed URL (e.g., `your-app.vercel.app`)
2. Open browser DevTools → Console
3. Check for any Supabase connection errors
4. Try features that use the database (oil selection, calculations)

---

## 📋 Environment Variables Reference

| Variable | Type | Required | Purpose | Safe to Expose? |
|----------|------|----------|---------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ Yes | Supabase project URL | ✅ Yes (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✅ Yes | Anonymous/public API key | ✅ Yes (RLS protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | ❌ No | Admin access (future use) | ❌ NO! Server-only |

### Why NEXT_PUBLIC_* is Safe

Variables prefixed with `NEXT_PUBLIC_` are:
- Embedded in the client-side JavaScript bundle
- Visible to anyone using the app
- **This is by design!** Supabase's anon key is meant to be public
- Security is handled by Row Level Security (RLS) policies in your database

---

## 🆘 Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:** Check that:
- Environment variables are set correctly in Vercel
- You redeployed after adding variables
- No typos in variable names (case-sensitive!)

### Issue: "Invalid API key"

**Solution:**
- Verify you copied the full anon key (it's very long!)
- Check there are no extra spaces or line breaks
- Regenerate the key in Supabase if needed

### Issue: Variables not showing in production

**Solution:**
- Ensure you selected "Production" environment when adding
- Redeploy the application
- Clear Vercel's build cache (Settings → General → Clear cache)

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env.local` in `.gitignore` (already done!)
- Use `NEXT_PUBLIC_` prefix for client-exposed variables
- Store service role key (if added) without `NEXT_PUBLIC_` prefix
- Commit `.env.example` to git as a template

### ❌ DON'T:
- Commit `.env.local` to version control
- Share your service role key publicly
- Prefix secret keys with `NEXT_PUBLIC_`
- Use environment variables for truly sensitive data (use Vercel's encrypted secrets)

---

## 📝 Quick Copy-Paste for Vercel

When adding variables in Vercel, copy-paste these exactly:

**Variable 1 Name:**
```
NEXT_PUBLIC_SUPABASE_URL
```

**Variable 1 Value:**
```
https://tztutumdgxbpqwavkxxm.supabase.co
```

**Variable 2 Name:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Variable 2 Value:**
```
(Copy from your .env.local file)
```

---

## 🎯 Deployment Checklist

Before deploying to Vercel:

- [x] `.env.local` exists locally with Supabase credentials
- [x] `.env.local` is in `.gitignore`
- [x] `.env.example` committed to repo (template for others)
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Selected all environments for each variable
- [ ] Saved variables in Vercel
- [ ] Redeployed application
- [ ] Tested deployed app functionality
- [ ] Verified database connection works

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Client Libraries](https://supabase.com/docs/reference/javascript/installing)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Last Updated:** November 10, 2025  
**Status:** ✅ Ready for deployment
