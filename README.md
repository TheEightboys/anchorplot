# 🏗️ AnchorPlot - Real Estate Development Platform

A comprehensive platform connecting property owners, developers, investors, and service providers in the real estate development ecosystem.

## 🚀 Features

- **User Authentication** - Secure Firebase authentication with role-based access
- **Admin Approval System** - All users require admin approval before platform access
- **Property Marketplace** - Browse and list development opportunities
- **Zoning Intelligence** - AI-powered zoning analysis
- **Deal Room** - Collaborative workspace for projects
- **Investor Portfolio** - Track investments and returns
- **Compliance Gateway** - Legal and regulatory compliance tools
- **Material Design 3 UI** - Modern, beautiful interface

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Material Design 3
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Hosting**: Vercel
- **Animations**: GSAP

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/TheEightboys/anchorplot.git
cd anchorplot/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Get your Firebase credentials:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings → General
   - Scroll to "Your apps" → SDK setup and configuration
   - Copy the config values

3. Update `frontend/.env` with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 4: Configure Firebase

1. **Enable Authentication**:
   - Go to Firebase Console → Authentication
   - Enable Email/Password sign-in method

2. **Create Firestore Database**:
   - Go to Firebase Console → Firestore Database
   - Create database in production mode
   - Choose your region

3. **Deploy Security Rules**:
   - Copy rules from `FIRESTORE_SECURITY_RULES.txt`
   - Go to Firestore → Rules
   - Paste and publish

4. **Enable Storage** (optional):
   - Go to Firebase Console → Storage
   - Get started with default rules

### Step 5: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🔐 Security

**IMPORTANT**: Never commit sensitive credentials to Git!

- All secrets are in `.env` files (git-ignored)
- See `SECURITY_GUIDE.md` for detailed security practices
- Firebase security rules protect your database
- Environment variables are used for all configuration

## 👤 User Roles

- **Admin** - Platform management and user approval
- **Owner** - Property listing and management
- **Developer** - Submit development pitches
- **Investor** - Browse deals and invest
- **Attorney** - Legal services
- **Property Manager** - Post-completion management

## 🎯 Admin Setup

### First Time Setup

1. Sign up for an account at `/signup`
2. Go to Firebase Console → Firestore → `users` collection
3. Find your user document
4. Update fields:
   ```json
   {
     "role": "admin",
     "approvalStatus": "approved"
   }
   ```
5. Refresh the page
6. Access admin panel at `/admin`

See `ADMIN_ACCESS_GUIDE.md` for detailed instructions.

## 📁 Project Structure

```
anchorplot/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── pages/          # Page components
│   │   ├── services/       # Firebase services
│   │   └── assets/         # Images, icons
│   ├── public/             # Static assets
│   ├── .env.example        # Environment template
│   └── package.json        # Dependencies
├── SECURITY_GUIDE.md       # Security best practices
├── ADMIN_ACCESS_GUIDE.md   # Admin setup guide
├── VERCEL_DEPLOYMENT.md    # Deployment instructions
└── README.md               # This file
```

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Import your repository
4. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables (same as .env)
6. Deploy!

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

### Post-Deployment

1. Add Vercel domain to Firebase authorized domains:
   - Firebase Console → Authentication → Settings
   - Add your Vercel domain (e.g., `anchorplot.vercel.app`)

2. Test all features:
   - [ ] Login/Signup works
   - [ ] Firebase connection works
   - [ ] Admin panel accessible
   - [ ] All routes work

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Material Design 3 principles
- 32px rounded corners for cards
- Smooth animations with GSAP

## 📊 Features in Detail

### Dashboard
- Real-time statistics
- Project analytics
- Team collaboration
- Time tracking
- Material Design 3 UI

### Marketplace
- Browse properties
- Filter by location, type, price
- Detailed property pages
- Save favorites

### Admin Panel
- User approval workflow
- Pending/Approved/Rejected tabs
- User search and filtering
- Role management
- Platform statistics

### Zoning Intelligence
- AI-powered zoning analysis
- Regulatory compliance checks
- Development feasibility

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Delete `node_modules` and reinstall
- Clear Vite cache: `rm -rf node_modules/.vite`

### Firebase Connection Issues
- Verify environment variables are set
- Check Firebase authorized domains
- Ensure security rules are deployed

### White Screen After Deployment
- Check browser console for errors
- Verify environment variables in Vercel
- Check Firebase configuration

## 📞 Support

- **Documentation**: See guides in repository
- **Issues**: [GitHub Issues](https://github.com/TheEightboys/anchorplot/issues)
- **Firebase**: [Firebase Documentation](https://firebase.google.com/docs)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)

## 📄 License

Private project - All rights reserved

## 🙏 Acknowledgments

- Firebase for backend services
- Vercel for hosting
- Tailwind CSS for styling
- GSAP for animations
- Material Design 3 for design system

---

**Built with ❤️ for the real estate development community**
