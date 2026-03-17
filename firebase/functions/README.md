# AnchorPlot Firebase Functions

This service implements backend enforcement and automation for:

- Role-based secure operations (signed URLs, document finalization)
- Zoning ingestion and parcel impact detection jobs
- E-sign envelope lifecycle hooks
- KYC session creation + webhook processing
- Stripe checkout/portal + webhook processing
- Audit logging for sensitive actions

## Local setup

```bash
cd firebase/functions
npm install
cp .env.example .env
npm run check
```

## Emulators

```bash
cd ../../
firebase emulators:start
```

## Deploy

```bash
firebase deploy --only functions,firestore:rules,storage
```
