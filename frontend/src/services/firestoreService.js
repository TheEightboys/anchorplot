/**
 * AnchorPlot Firestore Service Layer
 * Provides CRUD operations for all collections.
 */
import {
    collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, increment
} from 'firebase/firestore';
import { db } from './firebase';
import { getMatchScore } from './matchScore';

function requireParcelId(data, entityName) {
    const parcelId = String(data?.parcelId || '').trim();
    if (!parcelId) {
        throw new Error(`${entityName} must include parcelId. Parcel is the canonical primary record.`);
    }
    return parcelId;
}

async function resolveProjectParcelId(projectId) {
    if (!projectId) return '';
    const project = await getProject(projectId);
    return String(project?.parcelId || '').trim();
}

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
//  PARCELS (Canonical Land Record)
// ================================
export const parcelsRef = collection(db, 'parcels');
export const parcelEventsRef = collection(db, 'parcelEvents');

export async function createParcel(data) {
    return addDoc(parcelsRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function getParcel(id) {
    const snap = await getDoc(doc(db, 'parcels', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listParcels(filters = {}) {
    let q = parcelsRef;
    if (filters.ownerUid) q = query(q, where('ownerUid', '==', filters.ownerUid));
    if (filters.city) q = query(q, where('city', '==', filters.city));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateParcel(id, data) {
    return updateDoc(doc(db, 'parcels', id), { ...data, updatedAt: serverTimestamp() });
}

export async function createParcelEvent({ parcelId, eventType, source = 'app', actorId = '', payload = {} }) {
    const canonicalParcelId = requireParcelId({ parcelId }, 'Parcel event');
    return addDoc(parcelEventsRef, {
        parcelId: canonicalParcelId,
        eventType,
        source,
        actorId,
        payload,
        createdAt: serverTimestamp(),
    });
}

export async function listParcelEvents(parcelId, maxCount = 200) {
    const canonicalParcelId = requireParcelId({ parcelId }, 'Parcel events query');
    const q = query(parcelEventsRef, where('parcelId', '==', canonicalParcelId), orderBy('createdAt', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ================================
//  LISTINGS (Market Opportunity)
// ================================
export const listingsRef = collection(db, 'listings');

export async function createListing(data) {
    const parcelId = requireParcelId(data, 'Listing');
    const resolvedMatchScore = getMatchScore(data);

    const ref = await addDoc(listingsRef, {
        ...data,
        parcelId,
        matchScore: resolvedMatchScore,
        status: data.status || 'pending_review',
        views: 0,
        pitches: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await createParcelEvent({
        parcelId,
        eventType: 'listing_created',
        source: 'listing',
        actorId: data?.ownerId || data?.ownerUid || '',
        payload: { listingId: ref.id, status: data.status || 'pending_review' },
    });

    return ref;
}

export async function getListing(id) {
    const snap = await getDoc(doc(db, 'listings', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listListings(filters = {}) {
    let q = listingsRef;
    if (filters.status) q = query(q, where('status', '==', filters.status));
    if (filters.parcelId) q = query(q, where('parcelId', '==', filters.parcelId));
    if (filters.city) q = query(q, where('city', '==', filters.city));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateListing(id, data) {
    return updateDoc(doc(db, 'listings', id), { ...data, updatedAt: serverTimestamp() });
}

export async function approveListing(id) {
    return updateListing(id, { status: 'approved' });
}

export async function rejectListing(id, reason = '') {
    return updateListing(id, { status: 'rejected', rejectionReason: reason });
}

export async function incrementListingViews(id) {
    return updateDoc(doc(db, 'listings', id), { views: increment(1) });
}

// ================================
//  PITCHES (Developer → Property proposals)
// ================================
export const pitchesRef = collection(db, 'pitches');

export async function createPitch(data) {
    const parcelId = requireParcelId(data, 'Pitch');
    const ref = await addDoc(pitchesRef, {
        ...data,
        parcelId,
        status: 'submitted',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await createParcelEvent({
        parcelId,
        eventType: 'pitch_submitted',
        source: 'pitch',
        actorId: data?.developerId || '',
        payload: { pitchId: ref.id, listingId: data?.listingId || '' },
    });

    return ref;
}

export async function listPitchesByParcel(parcelId) {
    const q = query(pitchesRef, where('parcelId', '==', parcelId));
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
    const parcelId = requireParcelId(data, 'Project');
    const ref = await addDoc(projectsRef, {
        ...data,
        parcelId,
        status: 'draft',
        phase: 'planning',
        milestones: [],
        equityLedger: [],
        totalBudget: 0,
        deployedBudget: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await createParcelEvent({
        parcelId,
        eventType: 'project_created',
        source: 'project',
        actorId: data?.ownerId || data?.developerId || '',
        payload: { projectId: ref.id, phase: 'planning' },
    });

    return ref;
}

export async function getProject(id) {
    const snap = await getDoc(doc(db, 'projects', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listProjects(filters = {}) {
    let q = projectsRef;
    if (filters.ownerId) q = query(q, where('ownerId', '==', filters.ownerId));
    if (filters.developerId) q = query(q, where('developerId', '==', filters.developerId));
    if (filters.parcelId) q = query(q, where('parcelId', '==', filters.parcelId));
    if (filters.status) q = query(q, where('status', '==', filters.status));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listProjectsByParcel(parcelId) {
    const canonicalParcelId = requireParcelId({ parcelId }, 'Projects by parcel query');
    const q = query(projectsRef, where('parcelId', '==', canonicalParcelId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateProject(id, data) {
    return updateDoc(doc(db, 'projects', id), { ...data, updatedAt: serverTimestamp() });
}

export async function addMilestone(projectId, milestone) {
    const derivedParcelId = String(milestone?.parcelId || await resolveProjectParcelId(projectId) || '').trim();
    return updateDoc(doc(db, 'projects', projectId), {
        milestones: arrayUnion({ ...milestone, parcelId: derivedParcelId || null, createdAt: new Date().toISOString() }),
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
    const derivedParcelId = String(data?.parcelId || await resolveProjectParcelId(data?.projectId) || '').trim();
    const parcelId = requireParcelId({ parcelId: derivedParcelId }, 'Investment');

    const ref = await addDoc(investmentsRef, {
        ...data,
        parcelId,
        status: 'active',
        createdAt: serverTimestamp(),
    });

    await createParcelEvent({
        parcelId,
        eventType: 'investment_committed',
        source: 'investment',
        actorId: data?.userId || '',
        payload: { investmentId: ref.id, projectId: data?.projectId || '' },
    });

    return ref;
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

export async function listInvestmentsByParcel(parcelId) {
    const canonicalParcelId = requireParcelId({ parcelId }, 'Investments by parcel query');
    const q = query(investmentsRef, where('parcelId', '==', canonicalParcelId));
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
//  DISCLOSURE + TERMS CHECKPOINTS
// ================================
export const disclosureCheckpointsRef = collection(db, 'disclosureCheckpoints');
export const termsCheckpointsRef = collection(db, 'termsCheckpoints');

export async function recordDisclosureCheckpoint({
    listingId,
    userId,
    role,
    action,
    stage,
    metadata = {},
}) {
    const payload = {
        listingId,
        userId,
        role: role || 'unknown',
        action,
        stage,
        metadata,
        createdAt: serverTimestamp(),
    };

    await logAuditEvent({
        action: `disclosure:${action}`,
        actor: userId || 'unknown',
        target: listingId || 'unknown-listing',
        severity: 'info',
        metadata: { stage, ...metadata },
    });

    return addDoc(disclosureCheckpointsRef, payload);
}

export async function listDisclosureCheckpoints(listingId) {
    const q = query(disclosureCheckpointsRef, where('listingId', '==', listingId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function acknowledgeTermsCheckpoint({
    userId,
    checkpoint,
    accepted,
    listingId = '',
    projectId = '',
    metadata = {},
}) {
    const payload = {
        userId,
        checkpoint,
        accepted: Boolean(accepted),
        listingId,
        projectId,
        metadata,
        createdAt: serverTimestamp(),
    };

    await logAuditEvent({
        action: `terms:${checkpoint}`,
        actor: userId || 'unknown',
        target: listingId || projectId || 'terms-checkpoint',
        severity: 'info',
        metadata: { accepted: Boolean(accepted), ...metadata },
    });

    return addDoc(termsCheckpointsRef, payload);
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
//  PROJECT DOCUMENT SIGNATURES + PAYMENTS
// ================================
export async function addProjectDocument(projectId, documentEntry) {
    return updateDoc(doc(db, 'projects', projectId), {
        documents: arrayUnion({
            ...documentEntry,
            id: documentEntry.id || `doc_${Date.now()}`,
            uploadedAt: documentEntry.uploadedAt || new Date().toISOString(),
        }),
        updatedAt: serverTimestamp(),
    });
}

export async function recordDocumentSignature(projectId, signatureEntry) {
    return updateDoc(doc(db, 'projects', projectId), {
        documentSignatures: arrayUnion({
            ...signatureEntry,
            signedAt: signatureEntry.signedAt || new Date().toISOString(),
        }),
        updatedAt: serverTimestamp(),
    });
}

export async function appendProjectPaymentLog(projectId, paymentLog) {
    const parcelId = String(paymentLog?.parcelId || await resolveProjectParcelId(projectId) || '').trim() || null;
    return updateDoc(doc(db, 'projects', projectId), {
        paymentLogs: arrayUnion({
            ...paymentLog,
            parcelId,
            txId: paymentLog.txId || `tx_${Date.now()}`,
            createdAt: paymentLog.createdAt || new Date().toISOString(),
        }),
        updatedAt: serverTimestamp(),
    });
}

export async function appendProjectDistributionLog(projectId, distributionLog) {
    const parcelId = String(distributionLog?.parcelId || await resolveProjectParcelId(projectId) || '').trim() || null;
    return updateDoc(doc(db, 'projects', projectId), {
        distributionLogs: arrayUnion({
            ...distributionLog,
            parcelId,
            txId: distributionLog.txId || `dist_${Date.now()}`,
            createdAt: distributionLog.createdAt || new Date().toISOString(),
        }),
        updatedAt: serverTimestamp(),
    });
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

export async function listFundingByParcel(parcelId) {
    const canonicalParcelId = requireParcelId({ parcelId }, 'Funding by parcel query');
    const q = query(fundingRef, where('parcelId', '==', canonicalParcelId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getParcelIntelligenceSnapshot(parcelId) {
    const canonicalParcelId = requireParcelId({ parcelId }, 'Parcel intelligence snapshot');

    const parcel = await getParcel(canonicalParcelId);

    const [
        listings,
        pitches,
        projects,
        directInvestments,
        zoningAlerts,
        funding,
        events,
    ] = await Promise.all([
        listListings({ parcelId: canonicalParcelId }),
        listPitchesByParcel(canonicalParcelId),
        listProjectsByParcel(canonicalParcelId),
        listInvestmentsByParcel(canonicalParcelId),
        listZoningAlerts({}),
        listFundingByParcel(canonicalParcelId),
        listParcelEvents(canonicalParcelId),
    ]);

    const projectIds = projects.map(project => project.id);
    const investmentsByProjectArrays = await Promise.all(projectIds.map(projectId => listInvestmentsByProject(projectId)));
    const byProjectInvestments = investmentsByProjectArrays.flat();

    const investmentMap = new Map();
    [...directInvestments, ...byProjectInvestments].forEach(investment => {
        if (investment?.id) investmentMap.set(investment.id, investment);
    });

    return {
        parcel,
        listings,
        pitches,
        projects,
        investments: Array.from(investmentMap.values()),
        funding,
        zoningAlerts: zoningAlerts.filter(alert => alert.parcelId === canonicalParcelId),
        events,
    };
}

// ================================
//  DISPUTES (Admin)
// ================================
export const disputesRef = collection(db, 'disputes');

export async function createDispute(data) {
    return addDoc(disputesRef, {
        ...data,
        status: data.status || 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function listDisputes(filters = {}) {
    let q = disputesRef;
    if (filters.status) q = query(q, where('status', '==', filters.status));
    if (filters.projectId) q = query(q, where('projectId', '==', filters.projectId));
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
