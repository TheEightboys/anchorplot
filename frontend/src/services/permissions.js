/**
 * AnchorPlot Permissions Service
 * Central permissions matrix for role-based access control.
 */

export const ROLES = {
    OWNER: 'owner',
    DEVELOPER: 'developer',
    INVESTOR: 'investor',
    REALTOR: 'realtor',
    ATTORNEY: 'attorney',
    PROPERTY_MANAGER: 'property_manager',
    ADMIN: 'admin',
};

export const ROLE_LABELS = {
    [ROLES.OWNER]: 'Landowner',
    [ROLES.DEVELOPER]: 'Developer',
    [ROLES.INVESTOR]: 'Investor',
    [ROLES.REALTOR]: 'Realtor Partner',
    [ROLES.ATTORNEY]: 'Attorney',
    [ROLES.PROPERTY_MANAGER]: 'Property Manager',
    [ROLES.ADMIN]: 'Administrator',
};

export const ROLE_COLORS = {
    [ROLES.OWNER]: '#22c55e',
    [ROLES.DEVELOPER]: '#3b82f6',
    [ROLES.INVESTOR]: '#8b5cf6',
    [ROLES.REALTOR]: '#f59e0b',
    [ROLES.ATTORNEY]: '#ef4444',
    [ROLES.PROPERTY_MANAGER]: '#06b6d4',
    [ROLES.ADMIN]: '#f43f5e',
};

/**
 * Permissions matrix: maps actions to allowed roles.
 */
const PERMISSIONS = {
    // Marketplace & Listings
    'listing:create': [ROLES.OWNER],
    'listing:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.REALTOR, ROLES.ADMIN],
    'listing:edit': [ROLES.OWNER, ROLES.ADMIN],
    'listing:delete': [ROLES.OWNER, ROLES.ADMIN],

    // Pitches
    'pitch:create': [ROLES.DEVELOPER],
    'pitch:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.ADMIN],
    'pitch:accept': [ROLES.OWNER],
    'pitch:reject': [ROLES.OWNER],

    // Investments
    'investment:commit': [ROLES.INVESTOR],
    'investment:view': [ROLES.INVESTOR, ROLES.OWNER, ROLES.DEVELOPER, ROLES.ADMIN],

    // Deal Room & Projects
    'project:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.ATTORNEY, ROLES.REALTOR, ROLES.ADMIN],
    'project:manage': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.ADMIN],
    'project:milestone': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.ADMIN],

    // Contracts & Documents
    'contract:generate': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.ADMIN],
    'contract:sign': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.ATTORNEY],
    'document:upload': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.ATTORNEY, ROLES.ADMIN],
    'document:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.ATTORNEY, ROLES.REALTOR, ROLES.ADMIN],

    // Equity & Payments
    'equity:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.REALTOR, ROLES.ADMIN],
    'equity:manage': [ROLES.ADMIN],
    'payment:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.ADMIN],

    // Zoning
    'zoning:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.REALTOR, ROLES.ADMIN],

    // Compliance & Attorneys
    'compliance:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.ATTORNEY, ROLES.ADMIN],
    'attorney:marketplace': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.ADMIN],
    'attorney:profile': [ROLES.ATTORNEY],

    // Property Management
    'propmanage:dashboard': [ROLES.PROPERTY_MANAGER, ROLES.OWNER, ROLES.ADMIN],
    'propmanage:rentroll': [ROLES.PROPERTY_MANAGER, ROLES.OWNER, ROLES.ADMIN],
    'propmanage:maintenance': [ROLES.PROPERTY_MANAGER, ROLES.OWNER, ROLES.ADMIN],
    'propmanage:compliance': [ROLES.PROPERTY_MANAGER, ROLES.OWNER, ROLES.ADMIN],

    // Affordable Housing
    'affordable:manage': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.ADMIN],
    'affordable:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.ADMIN],

    // Investor Portfolio
    'portfolio:view': [ROLES.INVESTOR, ROLES.ADMIN],

    // Realtor
    'realtor:referrals': [ROLES.REALTOR, ROLES.ADMIN],
    'realtor:equity': [ROLES.REALTOR, ROLES.ADMIN],

    // Messaging
    'messaging:send': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.ATTORNEY, ROLES.REALTOR, ROLES.PROPERTY_MANAGER],
    'messaging:view': [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.ATTORNEY, ROLES.REALTOR, ROLES.PROPERTY_MANAGER, ROLES.ADMIN],

    // Admin
    'admin:console': [ROLES.ADMIN],
    'admin:approve_users': [ROLES.ADMIN],
    'admin:fee_config': [ROLES.ADMIN],
    'admin:disputes': [ROLES.ADMIN],
    'admin:reports': [ROLES.ADMIN],
};

/**
 * Check if a given role has permission for an action.
 */
export function hasPermission(role, action) {
    if (role === ROLES.ADMIN) return true; // Admin has all permissions
    const allowed = PERMISSIONS[action];
    if (!allowed) return false;
    return allowed.includes(role);
}

/**
 * Get all navigation items visible to a specific role.
 */
export function getNavigationForRole(role) {
    const allNav = [
        { to: '/app', label: 'Dashboard', icon: 'BarChart2', section: 'main', end: true, roles: 'all' },
        { to: '/app/marketplace', label: 'Marketplace', icon: 'Search', section: 'main', roles: 'all' },
        { to: '/app/create-listing', label: 'Create Listing', icon: 'Plus', section: 'main', roles: [ROLES.OWNER] },
        { to: '/app/zoning', label: 'Zoning Intelligence', icon: 'Map', section: 'main', roles: [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.REALTOR] },
        { to: '/app/deal-room', label: 'JV Deal Room', icon: 'Briefcase', section: 'deals', roles: [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR] },
        { to: '/app/compliance', label: 'Legal & Compliance', icon: 'ShieldCheck', section: 'deals', roles: [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR, ROLES.ATTORNEY] },
        { to: '/app/attorneys', label: 'Attorney Marketplace', icon: 'Scale', section: 'deals', roles: [ROLES.OWNER, ROLES.DEVELOPER] },
        { to: '/app/affordable-housing', label: 'Affordable Housing', icon: 'Heart', section: 'deals', roles: [ROLES.OWNER, ROLES.DEVELOPER, ROLES.INVESTOR] },
        { to: '/app/portfolio', label: 'My Portfolio', icon: 'PieChart', section: 'finance', roles: [ROLES.INVESTOR] },
        { to: '/app/referrals', label: 'Referrals & Equity', icon: 'Users', section: 'finance', roles: [ROLES.REALTOR] },
        { to: '/app/property-management', label: 'Property Management', icon: 'Home', section: 'operations', roles: [ROLES.PROPERTY_MANAGER, ROLES.OWNER] },
    ];

    return allNav.filter(item => {
        if (role === ROLES.ADMIN) return true;
        if (item.roles === 'all') return true;
        return item.roles.includes(role);
    });
}

/**
 * Get sections for grouping nav items in sidebar.
 */
export const NAV_SECTIONS = {
    main: 'Navigation',
    deals: 'Deals & Compliance',
    finance: 'Finance',
    operations: 'Operations',
};

/**
 * Role signup metadata — defines what extra fields each role needs.
 */
export const ROLE_SIGNUP_FIELDS = {
    [ROLES.OWNER]: [],
    [ROLES.DEVELOPER]: [
        { key: 'company', label: 'Company Name', type: 'text', placeholder: 'Your development firm', required: true },
        { key: 'experience', label: 'Years of Experience', type: 'number', placeholder: '5', required: false },
    ],
    [ROLES.INVESTOR]: [
        { key: 'company', label: 'Fund / Company', type: 'text', placeholder: 'Your investment entity', required: false },
        { key: 'accreditedInvestor', label: 'Accredited Investor', type: 'checkbox', required: false },
    ],
    [ROLES.REALTOR]: [
        { key: 'licenseNumber', label: 'License Number', type: 'text', placeholder: 'DRE-12345', required: true },
        { key: 'brokerage', label: 'Brokerage', type: 'text', placeholder: 'Your brokerage name', required: true },
        { key: 'licenseState', label: 'License State', type: 'text', placeholder: 'CA', required: true },
    ],
    [ROLES.ATTORNEY]: [
        { key: 'barNumber', label: 'Bar Number', type: 'text', placeholder: 'BAR-78901', required: true },
        { key: 'barState', label: 'Bar State', type: 'text', placeholder: 'CA', required: true },
        { key: 'firm', label: 'Law Firm', type: 'text', placeholder: 'Your firm name', required: false },
        { key: 'specialties', label: 'Specialties', type: 'text', placeholder: 'Real estate, zoning, JV agreements', required: false },
    ],
    [ROLES.PROPERTY_MANAGER]: [
        { key: 'company', label: 'Management Company', type: 'text', placeholder: 'Your management company', required: true },
        { key: 'licenseNumber', label: 'License Number', type: 'text', placeholder: 'PM-12345', required: false },
        { key: 'portfolioSize', label: 'Portfolio Size (units)', type: 'number', placeholder: '50', required: false },
    ],
};
