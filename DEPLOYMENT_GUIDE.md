# Deployment Guide: Vercel

## Prerequisites ✅
- [x] GitHub account
- [x] Vercel account (free)
- [x] Application code ready
- [x] Supabase project configured

---

## Step 1: Prepare Your Code

### 1.1 Create .gitignore (if not exists)
Make sure you have a `.gitignore` file in `c:\Users\hp\Downloads\FP\frontend\`:

```
node_modules/
.next/
.env.local
.env*.local
.vercel
```

### 1.2 Verify Environment Variables
Your `.env.local` should have:
```
NEXT_PUBLIC_SUPABASE_URL=https://spwlnpeilznsvlscityo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not done)
Open terminal in `c:\Users\hp\Downloads\FP\frontend\`:

```bash
git init
git add .
git commit -m "Initial commit - Networking app ready for deployment"
```

### 2.2 Create GitHub Repository
1. Go to [github.com](https://github.com/new)
2. Create new repository: `networking-app` (or any name)
3. **DO NOT** initialize with README

### 2.3 Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/networking-app.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up/Login
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import your `networking-app` repository
3. Click "Import"

### 3.3 Configure Project
**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (auto-filled)

**Output Directory:** `.next` (auto-filled)
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a live URL: `https://networking-app-xyz.vercel.app`

---

## Step 4: Update Google OAuth

### 4.1 Add Production URL to Google Cloud
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth Client "Web client 1"
3. Under **Authorized redirect URIs**, add:
   ```
   https://spwlnpeilznsvlscityo.supabase.co/auth/v1/callback
   ```
   (This should already be there, just verify)

### 4.2 Update Supabase Site URL
1. Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/spwlnpeilznsvlscityo/auth/url-configuration)
2. Set **Site URL** to your Vercel URL: `https://networking-app-xyz.vercel.app`
3. Add to **Redirect URLs**:
   - `https://networking-app-xyz.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

---

## Step 5: Test Production

1. Visit your Vercel URL
2. Click "Login" or "Get Started"
3. Sign in with Google
4. Verify Dashboard loads correctly

---

## Troubleshooting

### Build Fails
- Check for TypeScript errors in Vercel logs
- Verify all dependencies are in `package.json`

### Authentication Fails
- Verify environment variables in Vercel
- Check Supabase Site URL matches Vercel URL
- Ensure Google OAuth redirect URI includes Supabase callback

### Styles Missing
- Clear Vercel cache: Deployments → ⋮ → Redeploy

---

## Post-Deployment

### Custom Domain (Optional)
1. In Vercel: Settings → Domains
2. Add your domain (e.g., `myapp.com`)
3. Update DNS records as instructed
4. Update Supabase Site URL to custom domain

### Monitoring
- View logs: [Vercel Dashboard](https://vercel.com/dashboard)
- Analytics: Enabled by default in Vercel

---

## Next Steps

1. Share the URL with friends to test multi-user features
2. Create connections and test chat
3. Test video calls with another user

**Your app is LIVE!** 🎉
