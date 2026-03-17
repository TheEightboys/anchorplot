# Parcel-Centric Architecture (AnchorPlot)

## Core Principle

AnchorPlot is designed so the **parcel is the canonical primary record**.

- Not the user
- Not the project
- Not the transaction

All critical workflows are expected to carry `parcelId` and attach history to parcel intelligence records.

## Canonical Data Model

- `parcels/{parcelId}`: canonical property intelligence record
- `parcelEvents/*`: immutable-like timeline of parcel-linked events
- `listings/*`: must include `parcelId`
- `pitches/*`: must include `parcelId`
- `projects/*`: must include `parcelId`
- `investments/*`: must include `parcelId`
- `funding/*`: must include `parcelId`
- `zoningAlerts/*`: includes `parcelId` for impact tracking

## Relationship Diagram

```mermaid
flowchart TD
    Parcel[(Parcel / Canonical Record)]

    Owner[Owner]
    Listing[Opportunity Listing]
    Pitch[Developer Pitch]
    Project[JV Project]
    Invest[Investor Commitment]
    Agreement[JV Agreement]
    Milestones[Milestones]
    Zoning[Zoning Changes]
    Permits[Permits]
    Affordable[Affordable Commitments]
    PM[Property Management Records]
    Timeline[Parcel Events / History]

    Owner --> Parcel
    Listing --> Parcel
    Pitch --> Listing
    Pitch --> Parcel
    Project --> Parcel
    Invest --> Project
    Invest --> Parcel
    Agreement --> Project
    Agreement --> Parcel
    Milestones --> Project
    Milestones --> Parcel
    Zoning --> Parcel
    Permits --> Parcel
    Affordable --> Parcel
    PM --> Parcel
    Timeline --> Parcel
```

## Parcel Intelligence Service

Frontend service: `frontend/src/services/parcelIntelligenceService.js`

Key methods:

- `getParcelLifecycle(parcelId)`
- `getParcelTimeline(parcelId, maxCount)`
- `appendParcelHistory(parcelId, eventType, payload, actorId)`
- `updateCanonicalParcel(parcelId, updates)`

Underlying snapshot helper in `frontend/src/services/firestoreService.js`:

- `getParcelIntelligenceSnapshot(parcelId)`

## Enforcement

Security rules in `firebase/firestore.rules` enforce `parcelId` on creation for:

- listings
- pitches
- projects
- investments
- funding
- parcelEvents

This ensures the full life-of-property view can be reconstructed from one parcel-centric timeline.
