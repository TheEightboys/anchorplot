# AnchorPlot Feature Coverage (vs `anchorplot.txt`)

Last updated: March 17, 2026

## Legend
- ✅ Implemented in current frontend
- 🟨 Partially implemented (UI/data model exists, backend automation still needed)
- ⛔ Not implemented yet

## Core Product Behavior

1. **Three-sided marketplace with controlled disclosure**
   - ✅ Multi-role marketplace pages and routing (`owner`, `developer`, `investor`, `realtor`, `attorney`, `property_manager`, `admin`)
   - ✅ Anonymized listing creation (`CreateListing`) with hidden full address / parcel details
   - ✅ Structured pitch submission (`PropertyDetail`)
   - ✅ New disclosure checkpoints + audit trail logging (terms, fee acknowledgment, non-circumvention, attorney gate)
   - 🟨 Automatic stage transitions tied to owner acceptance and contract state still need stronger backend rules

2. **Zoning and redevelopment intelligence**
   - 🟨 Zoning alerts UI and storage model are present
   - ⛔ City connectors, GIS intersection, zoning diff engine, and legislative feed ingestion jobs not implemented in this frontend

3. **JV deal room, agreement automation, execution**
   - ✅ Deal room messaging and project workspace
   - ✅ Milestone tracker and added milestone+payment trigger entry flow
   - ✅ Equity ledger display
   - ✅ New agreement generation/versioning + e-sign capture checkpoints
   - ✅ New payment/distribution logs with transaction IDs in workspace
   - 🟨 True immutable ledger and server-side signing workflow still require backend implementation

4. **Affordable housing + public funding + relocation**
   - ✅ Affordable housing opt-in fields on listing creation
   - ✅ Affordable housing dashboard and compliance summary
   - ✅ Public funding intent fields
   - 🟨 Full funding application lifecycle automation and relocation vendor/payment workflows need backend services

5. **Attorney and compliance safeguards**
   - ✅ Attorney marketplace and legal disclaimer
   - ✅ Compliance gateway with attorney assignment flow
   - ✅ Jurisdiction-aware attorney requirement check (frontend gate)
   - ✅ Terms/checkpoint logging in disclosure flow
   - 🟨 Hard enforcement at API/database level still required

6. **Property management module**
   - ✅ Property management dashboard (rent roll, maintenance, compliance)
   - ✅ Role-aware access in navigation/permissions
   - 🟨 External city/state compliance visibility interfaces not yet implemented

## Engineering Requirements

- ✅ Role model and role-based navigation/permissions
- ✅ Auth + user profile data with KYC status fields
- ✅ Firestore service layer for listings/projects/pitches/investments/attorneys/zoning/notifications/audit
- ✅ Internal messaging and notifications models
- ✅ Admin user approval workflow
- ✅ New admin fee configuration panel
- ✅ New disputes + reporting export section in admin

### Still Needed for “Full Build Complete”

These are outside what the current frontend-only repo can fully provide:

- ⛔ Dedicated backend API with strict authorization middleware and enforcement rules
- ⛔ Background jobs (zoning ingestion, change detection, billing events, report generation)
- ⛔ Object storage + signed URL document pipeline
- ⛔ Real e-sign provider integration and document immutability guarantees
- ⛔ KYC/identity verification provider integrations
- ⛔ Billing/subscription engine for PM and compliance add-ons
- ⛔ Mobile apps for owner/developer

## Recommended Next Implementation Order
1. Backend API + authz + audit enforcement
2. Agreement/e-sign service integration
3. Zoning ingestion and parcel impact engine
4. Billing/subscriptions and payout/distribution services
5. Reporting/export API for city/HUD style schemas
