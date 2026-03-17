# AnchorPlot Mobile (Expo)

Mobile starter for owner/developer-first workflows using the same Firebase project.

## 1) Install

```bash
cd mobile
npm install
```

## 2) Configure env

Copy `.env.example` to `.env` and fill in Firebase web app values.

## 3) Run

```bash
npm run start
```

Then scan QR from Expo Go.

## Scope in this scaffold

- Firebase Auth sign-in
- User profile fetch from Firestore `users/{uid}`
- Role-aware welcome shell for owner/developer MVP

Next recommended build-out:
1. Owner listing status + disclosure checkpoints
2. Developer pitch submissions
3. Deal room notifications and messaging
