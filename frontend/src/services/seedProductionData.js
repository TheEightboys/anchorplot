/**
 * Production-Ready Seed Data for AnchorPlot
 * Run this once to populate Firestore with realistic data
 */

import { collection, doc, setDoc, serverTimestamp, writeBatch, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Generate realistic data
const generateSeedData = () => {
  const users = [
    {
      id: 'user-owner-1',
      email: 'sarah.chen@example.com',
      name: 'Sarah Chen',
      role: 'owner',
      kycStatus: 'verified',
      approvalStatus: 'approved',
      phone: '+1 (415) 555-0142',
      createdAt: '2026-01-15T10:30:00Z'
    },
    {
      id: 'user-dev-1',
      email: 'marcus.williams@devco.com',
      name: 'Marcus Williams',
      role: 'developer',
      kycStatus: 'verified',
      approvalStatus: 'approved',
      company: 'Williams Development Co.',
      phone: '+1 (212) 555-0199',
      createdAt: '2026-01-20T14:15:00Z'
    },
    {
      id: 'user-inv-1',
      email: 'diana.reyes@capital.com',
      name: 'Diana Reyes',
      role: 'investor',
      kycStatus: 'verified',
      approvalStatus: 'approved',
      accreditedInvestor: true,
      phone: '+1 (512) 555-0177',
      createdAt: '2026-02-01T09:00:00Z'
    },
    {
      id: 'user-admin-1',
      email: 'admin@anchorplot.com',
      name: 'Admin User',
      role: 'admin',
      kycStatus: 'verified',
      approvalStatus: 'approved',
      createdAt: '2025-12-01T08:00:00Z'
    }
  ];

  const properties = [
    {
      id: 'prop-sf-001',
      ownerUid: 'user-owner-1',
      city: 'San Francisco',
      state: 'CA',
      neighborhoodBand: 'SoMa / Mission Edge',
      lotSizeRange: '5,000–7,500 sqft',
      zoningDistrict: 'MUO',
      buildPotential: 'High-Density Residential (8–12 units)',
      targetOutcomes: ['Condo conversion', 'Mixed-income overlay'],
      targetAMI: 80,
      affordabilityTerm: 55,
      overlayFlags: ['Inclusionary Housing', 'TOD'],
      status: 'approved',
      views: 142,
      matchScore: 98,
      estimatedValue: 2500000,
      createdAt: '2026-02-18T11:00:00Z'
    },
    {
      id: 'prop-austin-001',
      ownerUid: 'user-owner-1',
      city: 'Austin',
      state: 'TX',
      neighborhoodBand: 'East Austin',
      lotSizeRange: '8,000–10,000 sqft',
      zoningDistrict: 'SF-3',
      buildPotential: 'ADU + Accessory Units',
      targetOutcomes: ['Long-term rental'],
      targetAMI: 60,
      affordabilityTerm: 30,
      overlayFlags: ['VMU', 'Transit Corridor'],
      status: 'approved',
      views: 89,
      matchScore: 92,
      estimatedValue: 1800000,
      createdAt: '2026-02-12T15:30:00Z'
    },
    {
      id: 'prop-ny-001',
      ownerUid: 'user-owner-1',
      city: 'New York',
      state: 'NY',
      neighborhoodBand: 'Bed-Stuy, Brooklyn',
      lotSizeRange: '3,000–4,500 sqft',
      zoningDistrict: 'R6A',
      buildPotential: '6-story residential + retail',
      targetOutcomes: ['Affordable housing credit', 'New market tax credit'],
      targetAMI: 50,
      affordabilityTerm: 40,
      overlayFlags: ['MIH', 'C1-3'],
      status: 'approved',
      views: 211,
      matchScore: 87,
      estimatedValue: 3200000,
      createdAt: '2026-02-20T09:45:00Z'
    }
  ];

  const projects = [
    {
      id: 'proj-001',
      name: 'SoMa Mixed-Income Development',
      propertyId: 'prop-sf-001',
      ownerId: 'user-owner-1',
      developerId: 'user-dev-1',
      investors: ['user-inv-1'],
      status: 'active',
      phase: 'permitting',
      propertyCity: 'San Francisco',
      propertyState: 'CA',
      totalBudget: 4200000,
      deployedBudget: 1050000,
      milestones: [
        { title: 'Feasibility Study', status: 'completed', date: '2026-01-15', completedAt: '2026-01-15T16:00:00Z' },
        { title: 'Zoning Approval', status: 'completed', date: '2026-02-01', completedAt: '2026-02-01T14:30:00Z' },
        { title: 'Permit Filing', status: 'in_progress', date: '2026-02-20', startedAt: '2026-02-20T10:00:00Z' },
        { title: 'Construction Start', status: 'upcoming', date: '2026-04-01' }
      ],
      equityLedger: [
        { party: 'Owner', partyId: 'user-owner-1', pct: 40, color: '#4ec878' },
        { party: 'Developer', partyId: 'user-dev-1', pct: 49, color: '#60a5fa' },
        { party: 'Investor Pool', partyId: 'user-inv-1', pct: 11, color: '#c084fc' }
      ],
      createdAt: '2026-01-10T12:00:00Z'
    }
  ];

  const investments = [
    {
      id: 'inv-001',
      userId: 'user-inv-1',
      projectId: 'proj-001',
      projectName: 'SoMa Mixed-Income Development',
      amount: 250000,
      currentValue: 267500,
      equityPct: 11,
      status: 'active',
      investedAt: '2026-01-10T14:00:00Z',
      expectedReturn: 18.5,
      term: 36
    }
  ];

  const attorneys = [
    {
      id: 'atty-001',
      name: 'Sarah L. Chen',
      firm: 'Chen & Associates PLLC',
      jurisdiction: ['California', 'Federal'],
      rating: 4.9,
      deals: 47,
      specialty: 'Real Estate JV & Zoning',
      phone: '+1 (415) 555-0142',
      email: 'schen@chenlaw.example.com',
      website: 'chenlaw.example.com',
      verified: true,
      barNumber: 'CA-287456',
      fee: '$350/hr',
      createdAt: '2025-11-01T10:00:00Z'
    },
    {
      id: 'atty-002',
      name: 'Marcus T. Williams',
      firm: 'Williams Legal Group',
      jurisdiction: ['New York', 'New Jersey'],
      rating: 4.7,
      deals: 31,
      specialty: 'Development Finance & Land Use',
      phone: '+1 (212) 555-0199',
      email: 'mwilliams@williamslegal.example.com',
      website: 'williamslegal.example.com',
      verified: true,
      barNumber: 'NY-445789',
      fee: '$400/hr',
      createdAt: '2025-11-15T11:30:00Z'
    },
    {
      id: 'atty-003',
      name: 'Diana Reyes',
      firm: 'Reyes Property Law',
      jurisdiction: ['Texas', 'Arizona'],
      rating: 4.8,
      deals: 53,
      specialty: 'Mixed-Income & Affordable Housing',
      phone: '+1 (512) 555-0177',
      email: 'dreyes@reyesproplaw.example.com',
      website: 'reyesproplaw.example.com',
      verified: true,
      barNumber: 'TX-556234',
      fee: '$320/hr',
      createdAt: '2025-10-20T09:15:00Z'
    }
  ];

  const zoningAlerts = [
    {
      id: 'alert-001',
      userId: 'user-owner-1',
      propertyId: 'prop-sf-001',
      city: 'San Francisco',
      state: 'CA',
      type: 'zoning_change',
      title: 'Zoning District Update: MUO Expansion',
      description: 'The MUO (Mixed-Use Office) district has been expanded to include additional height allowances for residential projects with affordable housing components.',
      impact: 'positive',
      beforeValue: 'Max 8 stories',
      afterValue: 'Max 12 stories with 20% affordable units',
      effectiveDate: '2026-03-01',
      status: 'unread',
      createdAt: '2026-02-22T08:30:00Z'
    }
  ];

  const notifications = [
    {
      id: 'notif-001',
      userId: 'user-inv-1',
      type: 'investment_update',
      title: 'Project Milestone Completed',
      body: 'SoMa Mixed-Income Development has completed the Zoning Approval milestone.',
      link: '/app/deal-room',
      read: false,
      createdAt: '2026-02-01T15:00:00Z'
    },
    {
      id: 'notif-002',
      userId: 'user-owner-1',
      type: 'pitch_received',
      title: 'New Pitch Received',
      body: 'You have received a new pitch for your Austin property listing.',
      link: '/app/marketplace',
      read: false,
      createdAt: '2026-02-21T10:30:00Z'
    }
  ];

  const platformConfig = {
    id: 'platformFees',
    transactionFee: '1.5%',
    attorneyReferralFee: '5%',
    realtorEquityCap: '1.0%',
    pmSubscription: '$299/mo',
    complianceReport: '$49/report',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  return {
    users,
    properties,
    projects,
    investments,
    attorneys,
    zoningAlerts,
    notifications,
    platformConfig
  };
};

// Seed function
export const seedProductionData = async () => {
  try {
    console.log('🌱 Starting production data seed...');
    
    const data = generateSeedData();
    const batch = writeBatch(db);

    // Seed users
    data.users.forEach(user => {
      const userRef = doc(db, 'users', user.id);
      batch.set(userRef, { ...user, createdAt: serverTimestamp() });
    });

    // Seed properties
    data.properties.forEach(property => {
      const propRef = doc(db, 'properties', property.id);
      batch.set(propRef, { ...property, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });

    // Seed projects
    data.projects.forEach(project => {
      const projRef = doc(db, 'projects', project.id);
      batch.set(projRef, { ...project, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });

    // Seed investments
    data.investments.forEach(investment => {
      const invRef = doc(db, 'investments', investment.id);
      batch.set(invRef, { ...investment, createdAt: serverTimestamp() });
    });

    // Seed attorneys
    data.attorneys.forEach(attorney => {
      const attyRef = doc(db, 'attorneys', attorney.id);
      batch.set(attyRef, { ...attorney, createdAt: serverTimestamp() });
    });

    // Seed zoning alerts
    data.zoningAlerts.forEach(alert => {
      const alertRef = doc(db, 'zoningAlerts', alert.id);
      batch.set(alertRef, { ...alert, createdAt: serverTimestamp() });
    });

    // Seed notifications
    data.notifications.forEach(notif => {
      const notifRef = doc(db, 'notifications', notif.id);
      batch.set(notifRef, { ...notif, createdAt: serverTimestamp() });
    });

    // Seed platform config
    const configRef = doc(db, 'config', data.platformConfig.id);
    batch.set(configRef, { ...data.platformConfig, updatedAt: serverTimestamp() });

    await batch.commit();
    
    console.log('✅ Production data seeded successfully!');
    return { success: true, message: 'Database seeded with production data' };
  } catch (error) {
    console.error('❌ Error seeding production data:', error);
    return { success: false, error: error.message };
  }
};

// Check if database is empty
export const isDatabaseEmpty = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.empty;
  } catch (error) {
    console.error('Error checking database:', error);
    return true;
  }
};
