# 🔒 Security Guide - AnchorPlot

## ⚠️ CRITICAL: Never Commit Secrets to Git

### What NOT to Commit:
- ❌ `.env` files
- ❌ Firebase API keys
- ❌ Firebase config objects with real values
- ❌ Database credentials
- ❌ Any authentication tokens

### What IS Safe to Commit:
- ✅ `.env.example` (with placeholder values)
- ✅ Code that reads from environment variables
- ✅ Documentation without real credentials

## 🔑 Environment Variables Setup

### Step 1: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → Project Settings
4. Scroll to "Your apps" section
5. Click "Config" under SDK setup
6. Copy the config values

### Step 2: Create .env File

Create `frontend/.env` file (this file is git-ignored):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 3: Verify .gitignore

Ensure `frontend/.gitignore` contains:

```
.env
.env.local
.env.production
.env.development
```

## 🚨 If You Accidentally Committed Secrets

### Option 1: Delete and Recreate Repository (Recommended)

1. **Delete the compromised repository** on GitHub
2. **Create a new repository** with a different name
3. **Remove git history** locally:
   ```bash
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit - clean"
   ```
4. **Push to new repository**:
   ```bash
   git remote add origin https://github.com/yourusername/new-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Option 2: Rotate All Secrets (Required Either Way)

Even after cleaning git history, you MUST rotate all exposed secrets:

1. **Create a new Firebase project** (safest option)
   - Go to Firebase Console
   - Create new project
   - Migrate your data
   - Update .env with new credentials

2. **Or restrict the existing API key**:
   - Go to Google Cloud Console
   - APIs & Services → Credentials
   - Click your API key
   - Add application restrictions (HTTP referrers)
   - Add API restrictions (only enable needed APIs)

## 🛡️ Best Practices

### 1. Use Environment Variables
```javascript
// ✅ GOOD
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// ❌ BAD
const apiKey = "your_exposed_api_key_here";
```

### 2. Never Log Secrets
```javascript
// ❌ BAD
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY);

// ✅ GOOD
console.log('Firebase initialized');
```

### 3. Use .env.example for Documentation
```env
# .env.example (safe to commit)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

### 4. Verify Before Committing
```bash
# Check what will be committed
git status

# Make sure .env is NOT listed
# If it is, add it to .gitignore immediately
```

### 5. Use Git Hooks (Optional)
Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
if git diff --cached --name-only | grep -q "\.env$"; then
    echo "Error: Attempting to commit .env file!"
    exit 1
fi
```

## 🔐 Firebase Security Rules

Deploy these rules to protect your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isApproved() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approvalStatus == 'approved';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isAdmin() || request.auth.uid == userId;
      allow delete: if isAdmin();
    }
    
    // Properties collection
    match /properties/{propertyId} {
      allow read: if isApproved();
      allow create: if isApproved();
      allow update: if isApproved() && 
                      (resource.data.ownerId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 📋 Security Checklist

Before deploying to production:

- [ ] All secrets are in environment variables
- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded credentials in code
- [ ] Firebase security rules deployed
- [ ] API key restrictions configured
- [ ] Authorized domains configured in Firebase
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Security headers configured (in vercel.json)
- [ ] Error messages don't expose sensitive info
- [ ] Git history doesn't contain secrets

## 🆘 Emergency Response

If GitHub alerts you about leaked secrets:

1. **Immediately rotate the secret** (create new API key/project)
2. **Delete the compromised repository**
3. **Create new repository with clean history**
4. **Update all deployment environments** with new secrets
5. **Review access logs** for unauthorized access
6. **Enable 2FA** on all accounts

## 📞 Resources

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Remember**: Security is not optional. Always protect your secrets!
