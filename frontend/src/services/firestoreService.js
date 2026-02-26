/**
 * AnchorPlot Firestore Service Layer
 * Provides CRUD operations for all collections.
 */
import {
    collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, increment
} from 'firebase/firestore';
import { db } from './firebase';

// ================================
//  USERS
// ================================
export const usersRef = collection(db, 'users');

export async function getUser(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUser(uid, data) {
    return updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}

export async function listUsers(filters = {}) {
    let q = usersRef;
    if (filters.role) q = query(q, where('role', '==', filters.role));
    if (filters.kycStatus) q = query(q, where('kycStatus', '==', filters.kycStatus));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ================================
//  PROPERTIES (Anonymized Listings)
// ================================
export const propertiesRef = collection(db, 'properties');

export async function createProperty(data) {
    return addDoc(propertiesRef, {
        ...data,
        status: data.status || 'pending_review',
        views: 0,
        pitches: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function getProperty(id) {
    const snap = await getDoc(doc(db, 'properties', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listProperties(filters = {}) {
    let q = propertiesRef;
    if (filters.status) q = query(q, where('status', '==', filters.status));
    if (filters.city) q = query(q, where('city', '==', filters.city));
    if (filters.ownerUid) q = query(q, where('ownerUid', '==', filters.ownerUid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateProperty(id, data) {
    return updateDoc(doc(db, 'properties', id), { ...data, updatedAt: serverTimestamp() });
}

export async function approveProperty(id) {
    return updateProperty(id, { status: 'approved' });
}

export async function rejectProperty(id, reason = '') {
    return updateProperty(id, { status: 'rejected', rejectionReason: reason });
}

export async function incrementPropertyViews(id) {
    return updateDoc(doc(db, 'properties', id), { views: increment(1) });
}

// ================================
//  PITCHES (Developer → Property proposals)
// ================================
export const pitchesRef = collection(db, 'pitches');

export async function createPitch(data) {
    return addDoc(pitchesRef, {
        ...data,
        status: 'submitted',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function listPitchesByProperty(propertyId) {
    const q = query(pitchesRef, where('propertyId', '==', propertyId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listPitchesByDeveloper(developerId) {
    const q = query(pitchesRef, where('developerId', '==', developerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updatePitchStatus(pitchId, status) {
    return updateDoc(doc(db, 'pitches', pitchId), { status, updatedAt: serverTimestamp() });
}

// ================================
//  PROJECTS (JV Deal Room Workspaces)
// ================================
export const projectsRef = collection(db, 'projects');

export async function createProject(data) {
    return addDoc(projectsRef, {
        ...data,
        status: 'draft',
        phase: 'planning',
        milestones: [],
        equityLedger: [],
        totalBudget: 0,
        deployedBudget: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function getProject(id) {
    const snap = await getDoc(doc(db, 'projects', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listProjects(filters = {}) {
    let q = projectsRef;
    if (filters.ownerId) q = query(q, where('ownerId', '==', filters.ownerId));
    if (filters.developerId) q = query(q, where('developerId', '==', filters.developerId));
    if (filters.status) q = query(q, where('status', '==', filters.status));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateProject(id, data) {
    return updateDoc(doc(db, 'projects', id), { ...data, updatedAt: serverTimestamp() });
}

export async function addMilestone(projectId, milestone) {
    return updateDoc(doc(db, 'projects', projectId), {
        milestones: arrayUnion({ ...milestone, createdAt: new Date().toISOString() }),
        updatedAt: serverTimestamp()
    });
}

export async function updateEquityLedger(projectId, ledger) {
    return updateDoc(doc(db, 'projects', projectId), {
        equityLedger: ledger,
        updatedAt: serverTimestamp()
    });
}

// ================================
//  INVESTMENTS
// ================================
export const investmentsRef = collection(db, 'investments');

export async function createInvestment(data) {
    return addDoc(investmentsRef, {
        ...data,
        status: 'active',
        createdAt: serverTimestamp(),
    });
}

export async function listInvestmentsByUser(userId) {
    const q = query(investmentsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listInvestmentsByProject(projectId) {
    const q = query(investmentsRef, where('projectId', '==', projectId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ================================
//  ATTORNEYS
// ================================
export const attorneysRef = collection(db, 'attorneys');

export async function listAttorneys(filters = {}) {
    let q = attorneysRef;
    if (filters.verified !== undefined) q = query(q, where('verified', '==', filters.verified));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAttorney(id) {
    const snap = await getDoc(doc(db, 'attorneys', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ================================
//  ZONING ALERTS
// ================================
export const zoningAlertsRef = collection(db, 'zoningAlerts');

export async function listZoningAlerts(filters = {}) {
    let q = zoningAlertsRef;
    if (filters.userId) q = query(q, where('userId', '==', filters.userId));
    if (filters.city) q = query(q, where('city', '==', filters.city));
    if (filters.status) q = query(q, where('status', '==', filters.status));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markAlertRead(alertId) {
    return updateDoc(doc(db, 'zoningAlerts', alertId), { status: 'read', readAt: serverTimestamp() });
}

// ================================
//  AUDIT LOGS
// ================================
export const auditLogsRef = collection(db, 'auditLogs');

export async function logAuditEvent({ action, actor, target, severity = 'info', metadata = {} }) {
    return addDoc(auditLogsRef, {
        action, actor, target, severity, metadata,
        timestamp: serverTimestamp(),
    });
}

export async function listAuditLogs(maxCount = 50) {
    const q = query(auditLogsRef, orderBy('timestamp', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ================================
//  MESSAGES (In-platform messaging — non-circumvention)
// ================================
export const messagesRef = collection(db, 'messages');

export async function sendMessage({ projectId, senderId, senderName, text, attachments = [] }) {
    return addDoc(messagesRef, {
        projectId, senderId, senderName, text, attachments,
        readBy: [senderId],
        createdAt: serverTimestamp(),
    });
}

export async function subscribeToMessages(projectId, callback) {
    const q = query(messagesRef, where('projectId', '==', projectId), orderBy('createdAt', 'asc'));
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
}

// ================================
//  NOTIFICATIONS
// ================================
export const notificationsRef = collection(db, 'notifications');

export async function createNotification({ userId, type, title, body, link = '' }) {
    return addDoc(notificationsRef, {
        userId, type, title, body, link,
        read: false,
        createdAt: serverTimestamp(),
    });
}

export async function listNotifications(userId, maxCount = 20) {
    const q = query(notificationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markNotificationRead(notifId) {
    return updateDoc(doc(db, 'notifications', notifId), { read: true });
}

// ================================
//  FUNDING TRACKER (Public Funding Programs)
// ================================
export const fundingRef = collection(db, 'funding');

export async function createFundingTracker(data) {
    return addDoc(fundingRef, {
        ...data,
        status: 'not_started',
        createdAt: serverTimestamp(),
    });
}

export async function listFundingByProject(projectId) {
    const q = query(fundingRef, where('projectId', '==', projectId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ================================
//  PLATFORM CONFIG (Admin)
// ================================
export async function getPlatformConfig() {
    const snap = await getDoc(doc(db, 'config', 'platformFees'));
    return snap.exists() ? snap.data() : {
        transactionFee: '1.5%',
        attorneyReferralFee: '5%',
        realtorEquityCap: '1.0%',
        pmSubscription: '$299/mo',
        complianceReport: '$49/report',
    };
}

export async function updatePlatformConfig(data) {
    return setDoc(doc(db, 'config', 'platformFees'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
