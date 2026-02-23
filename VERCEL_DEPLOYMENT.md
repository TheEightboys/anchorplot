# 🚀 Deploy AnchorPlot to Vercel

## ✅ Pre-Deployment Checklist

- [x] API keys are NOT in GitHub (checked - only .env.example is pushed)
- [x] .gitignore protects .env files
- [x] Code is pushed to GitHub
- [x] Firebase is configured

## 📦 Step-by-Step Vercel Deployment

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com

2. **Sign in** with GitHub

3. **Import Project**:
   - Click "Add New" → "Project"
   - Select your GitHub repository: `TheEightboys/anchorplot`
   - Click "Import"

4. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Add Environment Variables**:
   Click "Environment Variables" and add these (get values from your Firebase project):

   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   **Important**: 
   - Get these values from your Firebase Console → Project Settings → General
   - Add these for all environments (Production, Preview, Development)
   - Never commit these values to GitHub

6. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at: `https://anchorplot.vercel.app`

### Step 3: Configure Custom Domain (Optional)

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain (e.g., `anchorplot.com`)
4. Follow DNS configuration instructions

### Step 4: Update Firebase Settings

1. **Add Vercel Domain to Firebase**:
   - Go to: Firebase Console → Authentication → Settings → Authorized domains
   - Scroll to "Authorized domains"
   - Click "Add domain"
   - Add: `anchorplot.vercel.app` (or your custom domain)
   - Click "Add"

2. **Update Firestore Rules** (if needed):
   - Already configured for production
   - No changes needed

## 🔧 Alternative: Deploy via CLI

```bash
# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: anchorplot
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

## 📝 Vercel Configuration File

Create `vercel.json` in the `frontend` directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit .env files
- ✅ Use Vercel's environment variables
- ✅ Different keys for dev/staging/prod (if needed)

### 2. Firebase Security
- ✅ Firestore security rules deployed
- ✅ Authorized domains configured
- ✅ API key restrictions (optional but recommended)

### 3. API Key Restrictions (Recommended)

1. Go to: Google Cloud Console → APIs & Services → Credentials
2. Click on your API key
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add:
     - `http://localhost:5173/*` (development)
     - `https://anchorplot.vercel.app/*` (production)
     - `https://*.vercel.app/*` (preview deployments)
     - Your custom domain if you have one

## 🎯 Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Login/Signup works
- [ ] Firebase connection works
- [ ] Admin panel accessible
- [ ] All routes work (no 404s)
- [ ] Environment variables loaded
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Analytics working (if configured)

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically deploys!
```

### Branch Deployments
- `main` branch → Production
- Other branches → Preview deployments
- Pull requests → Preview deployments

## 📊 Monitoring

### Vercel Dashboard
- View deployments: https://vercel.com/dashboard
- Check logs
- Monitor performance
- View analytics

### Firebase Console
- Monitor auth: Firebase Console → Authentication
- Check Firestore: Firebase Console → Firestore Database
- View analytics: Firebase Console → Analytics

## 🐛 Troubleshooting

### Issue: Build fails
**Solution**: Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Check for TypeScript errors
- Verify environment variables

### Issue: White screen after deployment
**Solution**: 
- Check browser console for errors
- Verify environment variables are set
- Check Firebase authorized domains

### Issue: Firebase connection fails
**Solution**:
- Verify environment variables in Vercel
- Check Firebase authorized domains
- Ensure Firestore rules are deployed

### Issue: Routes return 404
**Solution**: 
- Ensure `vercel.json` has rewrites configured
- Check that SPA routing is enabled

## 🎉 Success!

Your AnchorPlot application is now live on Vercel!

**Production URL**: https://anchorplot.vercel.app

### Next Steps:
1. Test all features in production
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up backup strategy
5. Document deployment process for team

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- GitHub Issues: https://github.com/TheEightboys/anchorplot/issues

---

**Deployment Time**: ~3 minutes
**Automatic Deployments**: ✅ Enabled
**SSL Certificate**: ✅ Automatic
**CDN**: ✅ Global Edge Network
