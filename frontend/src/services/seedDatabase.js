import { addDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase.js';

const mockProperties = [
    {
        title: "West Side - Grade A",
        neighborhoodBand: "Tier 1 • Gentle Slope",
        zoning: "R-6 (Med Density)",
        lotSize: "7,200",
        buildPotential: "12-Unit Multi-family",
        matchScore: 98,
        tags: ["NEW LISTING", "TOD ZONE"],
        imageGradient: "from-[#d1d5db] to-[#9ca3af]"
    },
    {
        title: "Mid-Town Assemblage",
        neighborhoodBand: "Core • Flat Grade",
        zoning: "C4-4A (Mixed)",
        lotSize: "14,500",
        buildPotential: "Mixed Use w/ Retail Base",
        matchScore: 94,
        tags: ["OPPORTUNITY ZONE"],
        imageGradient: "from-[#94a3b8] to-[#475569]"
    },
    {
        title: "East Riverside - Zone B",
        neighborhoodBand: "Developing • Flood Zone X",
        zoning: "M1-1 (Light Ind)",
        lotSize: "22,000",
        buildPotential: "Logistics / Flex Warehouse",
        matchScore: 88,
        tags: ["PRICE DROP"],
        imageGradient: "from-[#cbd5e1] to-[#94a3b8]"
    },
    {
        title: "Suburban Infill",
        neighborhoodBand: "Quiet Zone • Flat",
        zoning: "R-4 (Res)",
        lotSize: "9,100",
        buildPotential: "Townhouse Row (4 Units)",
        matchScore: 79,
        tags: ["HIGH ROI"],
        imageGradient: "bg-[#e2e8f0]" // Special case for the 4th card map svg in the design
    }
];

async function seedFirestore() {
    console.log("Starting database seed...");
    try {
        const propertiesRef = collection(db, 'properties');

        // Optional: clear existing first to avoid duplicates during testing
        const snapshot = await getDocs(propertiesRef);
        console.log(`Found ${snapshot.docs.length} existing properties. Deleting...`);
        for (const doc of snapshot.docs) {
            await deleteDoc(doc.ref);
        }

        console.log("Seeding new mock properties...");
        for (const prop of mockProperties) {
            await addDoc(propertiesRef, prop);
            console.log(`Added: ${prop.title}`);
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedFirestore();
