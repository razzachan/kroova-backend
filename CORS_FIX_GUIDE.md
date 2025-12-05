# 🔧 CORS Fix Guide - Supabase Auth Configuration

## Problem Diagnosis

**Error:** `Access to fetch at 'https://mmcytphoeyxeylvaqjgr.supabase.co/auth/v1/token?grant_type=password' has been blocked by CORS policy`

**Root Cause:** Your Vercel production deployment URLs are not configured in Supabase Auth allowed origins.

**Status:** ✅ SQL migration `20251204_add_mystery_box_booster_bonus.sql` is NOT the cause (no auth/RLS changes)

---

## 🎯 Immediate Fix Steps

### 1. Supabase Dashboard Configuration

Go to: **Supabase Dashboard** → Project `mmcytphoeyxeylvaqjgr` → **Authentication** → **URL Configuration**

#### Add these URLs:

**Site URL (Primary):**
```
https://frontend-razzachans-projects.vercel.app
```

**Redirect URLs (Add all):**
```
https://frontend-razzachans-projects.vercel.app/**
https://frontend-razzachans-projects.vercel.app
https://frontend-cyan-nine-hl1m0yayym.vercel.app/**
https://frontend-cyan-nine-hl1m0yayym.vercel.app
https://frontend-razzachan-razzachans-projects.vercel.app/**
https://frontend-razzachan-razzachans-projects.vercel.app
```

**For Development (optional but recommended):**
```
http://localhost:3000/**
http://localhost:3000
```

#### If wildcards are supported in your Supabase plan:
```
https://*.vercel.app
https://frontend-*-razzachans-projects.vercel.app
```

---

## 🔍 Verify Environment Variables

### Vercel Project Settings → Environment Variables

Confirm these match your Supabase project:

| Variable | Expected Value | Where to Find |
|----------|---------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mmcytphoeyxeylvaqjgr.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (long token) | Supabase Dashboard → Settings → API → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (admin token) | Supabase Dashboard → Settings → API → `service_role` `secret` |

**Important:** Set these for **Production**, **Preview**, and **Development** environments in Vercel.

---

## 🚀 After Configuration

1. **Save** all changes in Supabase Dashboard
2. Wait **30-60 seconds** for propagation
3. **Test login** at: `https://frontend-razzachans-projects.vercel.app/login`
4. Check browser console (F12) - CORS error should be gone

If still failing after 2 minutes:
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Clear browser cache
- Try incognito/private window

---

## 🔄 Production Aliases Detected

Your current production deployment has these aliases:
- ✅ `https://frontend-razzachans-projects.vercel.app` (Main)
- ✅ `https://frontend-cyan-nine-hl1m0yayym.vercel.app`
- ✅ `https://frontend-razzachan-razzachans-projects.vercel.app`

Each unique deployment hash (like `luivqazkv`, `786dddf4e`, etc.) generates a new preview URL. If you want **all preview deployments** to work without manual updates, use wildcards in Supabase (if available in your plan).

---

## 📋 Prevention Checklist

Add to your deployment workflow:

- [ ] Use Vercel **Production Domain** setting (stable URL)
- [ ] Add wildcard patterns in Supabase for preview deploys
- [ ] Document this in `DEPLOYMENT_CHECKLIST.md`
- [ ] Create a custom domain and use it as primary (e.g., `app.kroova.io`)

---

## 🧪 Quick Test Command

After fixing, test auth from browser console on your deployed site:

```javascript
// Open https://frontend-razzachans-projects.vercel.app
// Press F12 → Console
const { createClient } = window.supabaseAuth;
const supabase = createClient(
  'https://mmcytphoeyxeylvaqjgr.supabase.co',
  'YOUR_ANON_KEY'
);

await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'testpass123'
});
// Should return user object or clear error (not CORS)
```

---

## 📞 Support

If still failing after following all steps:
1. Check Supabase Status: https://status.supabase.com
2. Verify project `mmcytphoeyxeylvaqjgr` is active
3. Try creating a new anon key in Supabase and update Vercel
4. Check Supabase logs: Dashboard → Logs → Auth

---

**Generated:** December 5, 2025  
**Issue Tracker:** This is NOT caused by `20251204_add_mystery_box_booster_bonus.sql` migration
