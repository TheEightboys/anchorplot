# Firebase Backend Setup (AnchorPlot)

This guide configures the backend stack added under `firebase/`:

- Firestore and Storage security rules
- Cloud Functions v2 (zoning jobs, e-sign, KYC, billing, signed URLs)
- Scheduled automation for zoning change detection

## 1) Prerequisites

- Node.js 20+
- Firebase CLI (`npm i -g firebase-tools`)
- A Firebase project with Firestore + Storage + Auth enabled

## 2) Link Firebase project

From repo root:

```bash
firebase login
firebase use --add
```

Update `.firebaserc` default project ID if needed.

## 3) Install Functions dependencies

```bash
npm run backend:install
```

## 4) Configure backend env vars

Create `firebase/functions/.env` from `firebase/functions/.env.example`.

Minimum recommended values for initial deployment:

```env
DEFAULT_REGION=us-central1
FRONTEND_BASE_URL=https://your-frontend-domain
WEBHOOK_SHARED_SECRET=replace_me
ESIGN_PROVIDER=mock
KYC_PROVIDER=mock
```

For production Stripe/e-sign/KYC integrations, set the provider keys in that same file.

## 5) Deploy rules + functions

```bash
npm run backend:deploy
```

This deploys:

- `firebase/firestore.rules`
- `firebase/storage.rules`
- `firebase/functions/src/index.js`

## 6) Local emulators

```bash
npm run backend:serve
```

Open Emulator UI at `http://127.0.0.1:4000`.

## 7) Frontend callable integration

To point frontend callable SDK to emulators in development, add this to `frontend/.env`:

```env
VITE_USE_FIREBASE_EMULATORS=true
```

## 8) Required Firestore seed/config

Create or seed these collections/documents in Firebase Console:

- `users` (role + approvalStatus per user)
- `cityConnectors` (for zoning sync jobs)
  - fields: `active`, `feedUrl`, `city`, `state`
- `config/platformFees` (optional; defaults are auto-applied)

## Implemented callable/HTTP endpoints

- Callable: `createSignedDocumentUploadUrl`
- Callable: `createSignedDocumentDownloadUrl`
- Callable: `finalizeUploadedDocument`
- Callable: `createEsignEnvelope`
- Callable: `createKycVerificationSession`
- Callable: `createStripeCheckoutSession`
- Callable: `createStripeBillingPortalSession`
- HTTP: `esignWebhook`
- HTTP: `kycWebhook`
- HTTP: `stripeWebhook`
- Scheduler: `syncCityZoningFeeds` (every 6 hours)
- Scheduler: `runParcelImpactDiff` (daily)
