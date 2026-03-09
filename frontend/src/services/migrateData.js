import { db } from './firebase.js';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export async function migrateRealData() {
    console.log("Starting real data migration to parcels and listings...");
    try {
        const propertiesRef = collection(db, 'properties');
        const parcelsRef = collection(db, 'parcels');
        const listingsRef = collection(db, 'listings');

        const snapshot = await getDocs(propertiesRef);
        console.log(`Found ${snapshot.docs.length} existing properties to migrate.`);

        if (snapshot.docs.length === 0) {
            console.log("No existing properties found. Nothing to migrate.");
            localStorage.setItem('anchorplot_migration_v1', 'true');
            return false;
        }

        let migratedCount = 0;

        for (const propertyDoc of snapshot.docs) {
            const oldData = propertyDoc.data();
            const parcelId = `parcel-${propertyDoc.id}`;

            const parcelData = {
                id: parcelId,
                title: oldData.title || oldData.name || 'Untitled Parcel',
                city: oldData.city || 'Unknown',
                state: oldData.state || '',
                neighborhoodBand: oldData.neighborhoodBand || oldData.neighborhood || '',
                lotSizeRange: oldData.lotSize || oldData.lotSizeRange || '',
                zoningDistrict: oldData.zoning || oldData.zoningDistrict || '',
                overlayFlags: oldData.tags || oldData.overlayFlags || [],
                existingStructure: oldData.existingStructure || '',
                buildPotential: oldData.buildPotential || '',
                ownerUid: oldData.ownerUid || oldData.ownerId || 'migrated-owner',
                ownerId: oldData.ownerId || oldData.ownerUid || 'migrated-owner',
                createdAt: oldData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _legacyPropertyId: propertyDoc.id,
                ...oldData
            };

            await setDoc(doc(parcelsRef, parcelId), parcelData);

            const listingId = `listing-${propertyDoc.id}`;
            const listingData = {
                id: listingId,
                parcelId: parcelId,
                title: parcelData.title,
                city: parcelData.city,
                state: parcelData.state,
                targetOutcomes: oldData.targetOutcomes || [oldData.buildPotential || 'Development Opportunity'],
                matchScore: oldData.matchScore || 85,
                targetAmI: oldData.targetAmI || null,
                affordabilityTerm: oldData.affordabilityTerm || null,
                publicFundingDesired: oldData.publicFundingDesired || false,
                status: oldData.status || 'approved',
                views: oldData.views || 0,
                pitches: oldData.pitches || [],
                imageGradient: oldData.imageGradient || 'from-[#d1d5db] to-[#9ca3af]',
                createdAt: parcelData.createdAt,
                updatedAt: parcelData.updatedAt,
                _legacyPropertyId: propertyDoc.id,
            };

            await setDoc(doc(listingsRef, listingId), listingData);
            migratedCount++;
            console.log(`Migrated property ${propertyDoc.id} -> ${parcelId} & ${listingId}`);
        }

        console.log(`✅ Migration complete! Successfully migrated ${migratedCount} properties into parcels and listings.`);
        localStorage.setItem('anchorplot_migration_v1', 'true');
        return true;

    } catch (error) {
        console.error("Error migrating database:", error);
    }
}
