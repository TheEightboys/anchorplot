import { db } from './firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

/**
 * Seed Firestore with sample AnchorPlot data.
 * Safe to run multiple times — checks for existing data first.
 * Call from browser console: import('/src/services/seedFirestore.js').then(m => m.seedAll())
 */

const SAMPLE_PROPERTIES = [
    {
        id: 'prop-001',
        city: 'San Francisco',
        state: 'CA',
        neighborhoodBand: 'SoMa / Mission Edge',
        lotSizeRange: '5,000–7,500 sqft',
        zoningDistrict: 'MUO (Mixed Use Office)',
        overlayFlags: ['Homeownership Assistance', 'Inclusionary Housing'],
        existingStructure: 'Single-story light industrial, partially vacant',
        buildPotential: 'High-Density Residential (8–12 units)',
        targetOutcomes: ['Condo conversion', 'Market rate rental', 'Mixed-income overlay'],
        matchScore: 98,
        targetAmI: 80,
        affordabilityTerm: 55,
        publicFundingDesired: true,
        ownerUid: 'seed-owner-001',
        status: 'approved',
        createdAt: '2026-02-10',
        views: 142,
    },
    {
        id: 'prop-002',
        city: 'Austin',
        state: 'TX',
        neighborhoodBand: 'East Austin — Near East Side',
        lotSizeRange: '8,000–10,000 sqft',
        zoningDistrict: 'SF-3 (Family Residence)',
        overlayFlags: ['Vertical Mixed Use (VMU)', 'Transit Corridor Overlay'],
        existingStructure: 'Single-family home, 1970s construction',
        buildPotential: 'ADU + Accessory Units (up to 4 units)',
        targetOutcomes: ['Long-term rental portfolio', 'ADU income stream'],
        matchScore: 92,
        targetAmI: 60,
        affordabilityTerm: 30,
        publicFundingDesired: false,
        ownerUid: 'seed-owner-002',
        status: 'approved',
        createdAt: '2026-02-12',
        views: 89,
    },
    {
        id: 'prop-003',
        city: 'New York',
        state: 'NY',
        neighborhoodBand: 'Bed-Stuy, Brooklyn',
        lotSizeRange: '3,000–4,500 sqft',
        zoningDistrict: 'R6A (Contextual Residential)',
        overlayFlags: ['Mandatory Inclusionary Housing (MIH)', 'Commercial Overlay C1-3'],
        existingStructure: '3-story rowhouse, partially occupied',
        buildPotential: 'Up to 6-story residential with ground-floor retail',
        targetOutcomes: ['Affordable housing credit', 'New market tax credit'],
        matchScore: 87,
        targetAmI: 50,
        affordabilityTerm: 40,
        publicFundingDesired: true,
        ownerUid: 'seed-owner-003',
        status: 'approved',
        createdAt: '2026-02-15',
        views: 211,
    },
    {
        id: 'prop-004',
        city: 'Denver',
        state: 'CO',
        neighborhoodBand: 'Five Points / RiNo',
        lotSizeRange: '6,000–8,000 sqft',
        zoningDistrict: 'C-MX-5 (Commercial Mixed Use)',
        overlayFlags: ['Income-Qualified Housing (IQ)', 'Design Review Required'],
        existingStructure: 'Vacant lot (former automotive)',
        buildPotential: 'Up to 8-story mixed-use tower',
        targetOutcomes: ['Market rate + affordable split', 'Opportunity Zone investment'],
        matchScore: 95,
        targetAmI: 70,
        affordabilityTerm: 55,
        publicFundingDesired: true,
        ownerUid: 'seed-owner-004',
        status: 'pending_review',
        createdAt: '2026-02-19',
        views: 58,
    },
    {
        id: 'prop-005',
        city: 'Chicago',
        state: 'IL',
        neighborhoodBand: 'Pilsen / Lower West Side',
        lotSizeRange: '10,000–12,000 sqft',
        zoningDistrict: 'B3-1 (Community Shopping)',
        overlayFlags: ['Affordable Requirements Ordinance (ARO)', 'Pilot Neighborhood'],
        existingStructure: 'Two-story commercial strip, 60% vacant',
        buildPotential: 'Mixed-income residential above retail (5–7 stories)',
        targetOutcomes: ['Community land trust structure', 'Section 8 HAP contract'],
        matchScore: 83,
        targetAmI: 30,
        affordabilityTerm: 99,
        publicFundingDesired: true,
        ownerUid: 'seed-owner-005',
        status: 'approved',
        createdAt: '2026-02-08',
        views: 176,
    },
];

const SAMPLE_ATTORNEYS = [
    {
        id: 'atty-001',
        name: 'Sarah L. Chen',
        firm: 'Chen & Associates PLLC',
        jurisdiction: ['California', 'Federal'],
        rating: 4.9,
        deals: 47,
        specialty: 'Real Estate JV & Zoning Law',
        phone: '+1 (415) 555-0142',
        website: 'chenlaw.example.com',
        verified: true,
        fee: '$350/hr',
        bio: 'Specializes in complex JV structuring, zoning appeals and affordable housing finance.',
    },
    {
        id: 'atty-002',
        name: 'Marcus T. Williams',
        firm: 'Williams Legal Group',
        jurisdiction: ['New York', 'New Jersey', 'Federal'],
        rating: 4.7,
        deals: 31,
        specialty: 'Development Finance & Land Use',
        phone: '+1 (212) 555-0199',
        website: 'williamslegal.example.com',
        verified: true,
        fee: '$400/hr',
        bio: 'Former NYC DCP attorney. Expert in land use approvals, ULURP and MIH compliance.',
    },
    {
        id: 'atty-003',
        name: 'Diana Reyes',
        firm: 'Reyes Property Law',
        jurisdiction: ['Texas', 'Arizona', 'Colorado'],
        rating: 4.8,
        deals: 53,
        specialty: 'Mixed-Income & Affordable Housing',
        phone: '+1 (512) 555-0177',
        website: 'reyesproplaw.example.com',
        verified: true,
        fee: '$320/hr',
        bio: 'Extensive experience with LIHTC, HOME programs and mixed-income overlay structures.',
    },
    {
        id: 'atty-004',
        name: "James K. O'Brien",
        firm: "O'Brien & Partners",
        jurisdiction: ['Illinois', 'Indiana', 'Wisconsin'],
        rating: 4.6,
        deals: 28,
        specialty: 'JV Agreements & Title',
        phone: '+1 (312) 555-0133',
        website: 'obrienpartners.example.com',
        verified: true,
        fee: '$375/hr',
        bio: 'Focuses on JV waterfall structures, title insurance and developer equity negotiations.',
    },
];

const SAMPLE_ZONING_ALERTS = [
    {
        id: 'alert-001',
        city: 'San Francisco',
        parcelId: 'seed-parcel-001',
        userId: 'seed-owner-001',
        changeType: 'Height Limit Increase',
        summary: 'Maximum building height in MUO zones along Market St. Corridor increased from 35 ft to 50 ft effective March 1, 2026.',
        beforeValues: { heightLimit: '35 ft', FAR: '2.5', allowedUses: 'Office, Retail' },
        afterValues: { heightLimit: '50 ft', FAR: '4.0', allowedUses: 'Office, Retail, Residential' },
        impact: 'high',
        effectiveDate: '2026-03-01',
        sourceLink: 'https://sfplanning.org/ordinances/2026-001',
        createdAt: '2026-02-15',
        status: 'unread',
    },
    {
        id: 'alert-002',
        city: 'Austin',
        parcelId: 'seed-parcel-002',
        userId: 'seed-owner-002',
        changeType: 'Overlay Added',
        summary: 'A new Transit Corridor Overlay (TCO) has been applied to properties within 1/4 mile of the Red Line MetroRail, enabling increased density by-right.',
        beforeValues: { overlay: 'None', maxUnits: '1', parkingRequired: '2 spaces/unit' },
        afterValues: { overlay: 'Transit Corridor Overlay (TCO)', maxUnits: '4', parkingRequired: '0 spaces/unit' },
        impact: 'high',
        effectiveDate: '2026-02-20',
        sourceLink: 'https://austintexas.gov/zoning/tco-2026',
        createdAt: '2026-02-18',
        status: 'unread',
    },
];

const SAMPLE_INVESTMENTS = [
    {
        id: 'inv-001',
        userId: 'seed-investor-001',
        projectId: 'proj-001',
        amount: 250000,
        equityPct: 11,
        currentValue: 267500,
        status: 'active',
        investedAt: '2026-01-10',
        vestingStart: '2026-01-10',
        vestingEnd: '2029-01-10',
    },
];

const SAMPLE_PROJECTS = [
    {
        id: 'proj-001',
        name: 'SoMa Mixed-Income Residential',
        propertyId: 'prop-001',
        ownerId: 'seed-owner-001',
        developerId: 'seed-dev-001',
        investors: ['seed-investor-001'],
        status: 'funding_closed',
        phase: 'permitting',
        equityLedger: [
            { party: 'Owner', pct: 40, color: '#4ec878' },
            { party: 'Developer', pct: 49, color: '#60a5fa' },
            { party: 'Investor Pool', pct: 11, color: '#c084fc' },
        ],
        totalBudget: 4200000,
        deployedBudget: 1800000,
        milestones: [
            { label: 'JV Agreement Signed', status: 'complete', date: '2026-01-15' },
            { label: 'Planning Permit Filed', status: 'complete', date: '2026-02-01' },
            { label: 'Building Permit', status: 'in_progress', date: '2026-04-01' },
            { label: 'Construction Start', status: 'pending', date: '2026-06-01' },
            { label: 'Certificate of Occupancy', status: 'pending', date: '2027-08-01' },
        ],
        createdAt: '2026-01-05',
    },
];

export async function seedAll() {
    console.log('🌱 AnchorPlot Firestore seed starting...');

    // Only seed if empty
    const existingCheck = await getDocs(collection(db, 'properties'));
    if (existingCheck.docs.length > 0) {
        console.log('✅ Database already has data — skipping seed.');
        return { skipped: true };
    }

    const writes = [];

    for (const prop of SAMPLE_PROPERTIES) {
        const { id, ...data } = prop;
        writes.push(setDoc(doc(db, 'properties', id), data));
    }
    for (const atty of SAMPLE_ATTORNEYS) {
        const { id, ...data } = atty;
        writes.push(setDoc(doc(db, 'attorneys', id), data));
    }
    for (const alert of SAMPLE_ZONING_ALERTS) {
        const { id, ...data } = alert;
        writes.push(setDoc(doc(db, 'zoningAlerts', id), data));
    }
    for (const inv of SAMPLE_INVESTMENTS) {
        const { id, ...data } = inv;
        writes.push(setDoc(doc(db, 'investments', id), data));
    }
    for (const proj of SAMPLE_PROJECTS) {
        const { id, ...data } = proj;
        writes.push(setDoc(doc(db, 'projects', id), data));
    }

    await Promise.all(writes);

    console.log(`✅ Seeded: ${SAMPLE_PROPERTIES.length} properties, ${SAMPLE_ATTORNEYS.length} attorneys, ${SAMPLE_ZONING_ALERTS.length} zoning alerts, ${SAMPLE_INVESTMENTS.length} investments, ${SAMPLE_PROJECTS.length} projects.`);
    return { success: true };
}

export default seedAll;
