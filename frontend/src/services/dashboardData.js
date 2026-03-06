import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

function dedupeById(items) {
    const map = new Map();
    items.forEach(item => {
        if (item?.id) map.set(item.id, item);
    });
    return Array.from(map.values());
}

async function fetchAll(collectionName) {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fetchEquals(collectionName, field, value) {
    const snapshot = await getDocs(query(collection(db, collectionName), where(field, '==', value)));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fetchArrayContains(collectionName, field, value) {
    const snapshot = await getDocs(query(collection(db, collectionName), where(field, 'array-contains', value)));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function safeFetch(fetcher) {
    try {
        return await fetcher();
    } catch (error) {
        console.error('Dashboard query failed:', error);
        return [];
    }
}

export async function getProjectsForUser(userData) {
    if (!userData?.uid) return [];

    const userId = userData.uid;
    const role = userData.role;

    if (role === 'admin') {
        return safeFetch(() => fetchAll('projects'));
    }

    if (role === 'owner') {
        const [ownerIdProjects, ownerUidProjects] = await Promise.all([
            safeFetch(() => fetchEquals('projects', 'ownerId', userId)),
            safeFetch(() => fetchEquals('projects', 'ownerUid', userId)),
        ]);
        return dedupeById([...ownerIdProjects, ...ownerUidProjects]);
    }

    if (role === 'developer') {
        const [developerIdProjects, developerUidProjects] = await Promise.all([
            safeFetch(() => fetchEquals('projects', 'developerId', userId)),
            safeFetch(() => fetchEquals('projects', 'developerUid', userId)),
        ]);
        return dedupeById([...developerIdProjects, ...developerUidProjects]);
    }

    if (role === 'investor') {
        const [investorArrayProjects, investorIdsProjects] = await Promise.all([
            safeFetch(() => fetchArrayContains('projects', 'investors', userId)),
            safeFetch(() => fetchArrayContains('projects', 'investorIds', userId)),
        ]);
        return dedupeById([...investorArrayProjects, ...investorIdsProjects]);
    }

    if (role === 'realtor') {
        return safeFetch(() => fetchEquals('projects', 'realtorId', userId));
    }

    if (role === 'property_manager') {
        const [managerIdProjects, managerUidProjects] = await Promise.all([
            safeFetch(() => fetchEquals('projects', 'managerId', userId)),
            safeFetch(() => fetchEquals('projects', 'managerUid', userId)),
        ]);
        return dedupeById([...managerIdProjects, ...managerUidProjects]);
    }

    return safeFetch(() => fetchAll('projects'));
}

export async function getPropertiesForUser(userData) {
    if (!userData?.uid) return [];

    const userId = userData.uid;
    const role = userData.role;

    if (role === 'admin') {
        return safeFetch(() => fetchAll('properties'));
    }

    if (role === 'owner') {
        const [ownerIdProperties, ownerUidProperties] = await Promise.all([
            safeFetch(() => fetchEquals('properties', 'ownerId', userId)),
            safeFetch(() => fetchEquals('properties', 'ownerUid', userId)),
        ]);
        return dedupeById([...ownerIdProperties, ...ownerUidProperties]);
    }

    if (role === 'property_manager') {
        const [managerIdProperties, managerUidProperties] = await Promise.all([
            safeFetch(() => fetchEquals('properties', 'managerId', userId)),
            safeFetch(() => fetchEquals('properties', 'managerUid', userId)),
        ]);
        return dedupeById([...managerIdProperties, ...managerUidProperties]);
    }

    return safeFetch(() => fetchAll('properties'));
}

export async function getZoningAlertsForUser(userData) {
    if (!userData?.uid) return [];

    const role = userData.role;
    if (role === 'admin') {
        return safeFetch(() => fetchAll('zoningAlerts'));
    }

    return safeFetch(() => fetchEquals('zoningAlerts', 'userId', userData.uid));
}

export function toSafeNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatDateValue(value, fallback = '—') {
    if (!value) return fallback;

    if (typeof value === 'object' && typeof value.toDate === 'function') {
        return value.toDate().toLocaleDateString();
    }

    if (typeof value === 'object' && Number.isFinite(value.seconds)) {
        return new Date(value.seconds * 1000).toLocaleDateString();
    }

    if (value instanceof Date) {
        return value.toLocaleDateString();
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString();
        }
        return String(value);
    }

    return fallback;
}
