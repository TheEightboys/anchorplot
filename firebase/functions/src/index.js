import { createHash } from 'node:crypto';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import * as logger from 'firebase-functions/logger';
import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as turf from '@turf/turf';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';

admin.initializeApp();

const db = getFirestore();
const bucket = getStorage().bucket();

const REGION = process.env.DEFAULT_REGION || 'us-central1';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

setGlobalOptions({ region: REGION, maxInstances: 20, timeoutSeconds: 120 });

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function sanitizeFileName(name = '') {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || `file_${Date.now()}`;
}

function getFeatureHash(feature) {
  return createHash('sha256')
    .update(JSON.stringify(feature.geometry || {}))
    .update(JSON.stringify(feature.properties || {}))
    .digest('hex');
}

async function getUserProfile(uid) {
  const snapshot = await db.collection('users').doc(uid).get();
  if (!snapshot.exists) {
    throw new HttpsError('permission-denied', 'User profile not found.');
  }
  return { id: snapshot.id, ...snapshot.data() };
}

function assertApproved(profile) {
  if (!profile || (profile.approvalStatus !== 'approved' && profile.role !== 'admin')) {
    throw new HttpsError('permission-denied', 'Account is not approved.');
  }
}

function assertRole(profile, roles) {
  if (!profile || (!roles.includes(profile.role) && profile.role !== 'admin')) {
    throw new HttpsError('permission-denied', `Role ${profile?.role || 'unknown'} is not authorized.`);
  }
}

async function assertProjectMembership(projectId, uid) {
  const snapshot = await db.collection('projects').doc(projectId).get();
  if (!snapshot.exists) {
    throw new HttpsError('not-found', 'Project not found.');
  }

  const project = snapshot.data() || {};
  const investorIds = Array.isArray(project.investorIds) ? project.investorIds : [];
  const investors = Array.isArray(project.investors) ? project.investors : [];

  const isMember = [
    project.ownerId,
    project.ownerUid,
    project.developerId,
    project.developerUid,
    project.managerId,
    project.managerUid,
    project.attorneyId,
  ].includes(uid) || investorIds.includes(uid) || investors.includes(uid);

  return { project, isMember };
}

async function requireContextAuth(request) {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const profile = await getUserProfile(request.auth.uid);
  assertApproved(profile);
  return { uid: request.auth.uid, profile };
}

async function writeAuditEvent({ action, actor, target, severity = 'info', metadata = {} }) {
  await db.collection('auditLogs').add({
    action,
    actor,
    target,
    severity,
    metadata,
    timestamp: FieldValue.serverTimestamp(),
  });
}

export const createSignedDocumentUploadUrl = onCall({ enforceAppCheck: false }, async (request) => {
  const { uid, profile } = await requireContextAuth(request);
  assertRole(profile, ['owner', 'developer', 'attorney', 'property_manager']);

  const { projectId, fileName, contentType = 'application/pdf' } = request.data || {};
  if (!projectId || !fileName) {
    throw new HttpsError('invalid-argument', 'projectId and fileName are required.');
  }

  const { isMember } = await assertProjectMembership(projectId, uid);
  if (!isMember && profile.role !== 'admin') {
    throw new HttpsError('permission-denied', 'You are not a member of this project.');
  }

  const safeName = sanitizeFileName(fileName);
  const objectPath = `documents/${projectId}/${Date.now()}-${safeName}`;
  const fileRef = bucket.file(objectPath);

  const [uploadUrl] = await fileRef.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });

  await db.collection('documentUploads').add({
    projectId,
    objectPath,
    fileName: safeName,
    contentType,
    createdBy: uid,
    status: 'url_issued',
    createdAt: FieldValue.serverTimestamp(),
  });

  await writeAuditEvent({
    action: 'document_upload_url_created',
    actor: uid,
    target: projectId,
    metadata: { objectPath, contentType },
  });

  return {
    uploadUrl,
    objectPath,
    gsUri: `gs://${bucket.name}/${objectPath}`,
    expiresInSeconds: 900,
  };
});

export const createSignedDocumentDownloadUrl = onCall({ enforceAppCheck: false }, async (request) => {
  const { uid, profile } = await requireContextAuth(request);
  const { projectId, objectPath } = request.data || {};

  if (!projectId || !objectPath) {
    throw new HttpsError('invalid-argument', 'projectId and objectPath are required.');
  }

  const { isMember } = await assertProjectMembership(projectId, uid);
  if (!isMember && profile.role !== 'admin') {
    throw new HttpsError('permission-denied', 'You are not a member of this project.');
  }

  const [downloadUrl] = await bucket.file(objectPath).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000,
  });

  await writeAuditEvent({
    action: 'document_download_url_created',
    actor: uid,
    target: projectId,
    metadata: { objectPath },
  });

  return { downloadUrl, expiresInSeconds: 900 };
});

export const finalizeUploadedDocument = onCall({ enforceAppCheck: false }, async (request) => {
  const { uid, profile } = await requireContextAuth(request);
  assertRole(profile, ['owner', 'developer', 'attorney', 'property_manager']);

  const {
    projectId,
    objectPath,
    documentName,
    version = 'v1',
    type = 'agreement',
    watermarked = true,
  } = request.data || {};

  if (!projectId || !objectPath || !documentName) {
    throw new HttpsError('invalid-argument', 'projectId, objectPath and documentName are required.');
  }

  const { isMember } = await assertProjectMembership(projectId, uid);
  if (!isMember && profile.role !== 'admin') {
    throw new HttpsError('permission-denied', 'You are not a member of this project.');
  }

  const fileRef = bucket.file(objectPath);
  const [exists] = await fileRef.exists();
  if (!exists) {
    throw new HttpsError('not-found', 'Uploaded file not found in storage.');
  }

  const documentEntry = {
    id: `doc_${nanoid(10)}`,
    objectPath,
    name: documentName,
    version,
    type,
    watermarked: Boolean(watermarked),
    status: 'uploaded',
    uploadedBy: uid,
    uploadedAt: new Date().toISOString(),
  };

  await db.collection('projects').doc(projectId).set(
    {
      documents: FieldValue.arrayUnion(documentEntry),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.collection('documentUploads').add({
    projectId,
    objectPath,
    finalizedBy: uid,
    status: 'finalized',
    createdAt: FieldValue.serverTimestamp(),
  });

  await writeAuditEvent({
    action: 'document_finalized',
    actor: uid,
    target: projectId,
    metadata: { documentId: documentEntry.id, objectPath, type, version },
  });

  return { success: true, document: documentEntry };
});

export const createEsignEnvelope = onCall({ enforceAppCheck: false }, async (request) => {
  const { uid, profile } = await requireContextAuth(request);
  assertRole(profile, ['owner', 'developer', 'attorney']);

  const { projectId, documentId, title, signers = [] } = request.data || {};
  if (!projectId || !documentId || !title || !Array.isArray(signers) || signers.length === 0) {
    throw new HttpsError('invalid-argument', 'projectId, documentId, title and signers[] are required.');
  }

  const { isMember } = await assertProjectMembership(projectId, uid);
  if (!isMember && profile.role !== 'admin') {
    throw new HttpsError('permission-denied', 'You are not a member of this project.');
  }

  const envelopeRef = db.collection('esignEnvelopes').doc();
  const provider = process.env.ESIGN_PROVIDER || 'mock';
  let providerResponse = null;

  if (provider !== 'mock' && process.env.ESIGN_CREATE_ENVELOPE_URL && process.env.ESIGN_API_KEY) {
    const response = await fetch(process.env.ESIGN_CREATE_ENVELOPE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ESIGN_API_KEY}`,
      },
      body: JSON.stringify({ projectId, documentId, title, signers }),
    });

    if (!response.ok) {
      throw new HttpsError('internal', `E-sign provider returned ${response.status}.`);
    }

    providerResponse = await response.json();
  }

  const envelopeData = {
    projectId,
    documentId,
    title,
    signers,
    createdBy: uid,
    provider,
    providerEnvelopeId: providerResponse?.envelopeId || `mock_${nanoid(12)}`,
    signUrl: providerResponse?.signUrl || `${FRONTEND_BASE_URL}/app/deal-room/${projectId}`,
    status: 'sent',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await envelopeRef.set(envelopeData);

  await writeAuditEvent({
    action: 'esign_envelope_created',
    actor: uid,
    target: projectId,
    metadata: {
      envelopeId: envelopeRef.id,
      provider: envelopeData.provider,
      signerCount: signers.length,
    },
  });

  return { envelopeId: envelopeRef.id, ...envelopeData };
});

export const esignWebhook = onRequest(async (request, response) => {
  try {
    if (process.env.ESIGN_WEBHOOK_SECRET) {
      const supplied = request.get('x-anchorplot-webhook-secret');
      if (supplied !== process.env.ESIGN_WEBHOOK_SECRET) {
        response.status(401).json({ error: 'Invalid webhook secret.' });
        return;
      }
    }

    const payload = request.body || {};
    const providerEnvelopeId = payload.envelopeId || payload.providerEnvelopeId;
    const status = String(payload.status || '').toLowerCase();
    const signatures = Array.isArray(payload.signatures) ? payload.signatures : [];

    if (!providerEnvelopeId) {
      response.status(400).json({ error: 'Missing envelope identifier.' });
      return;
    }

    const snapshot = await db
      .collection('esignEnvelopes')
      .where('providerEnvelopeId', '==', providerEnvelopeId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      response.status(404).json({ error: 'Envelope not found.' });
      return;
    }

    const docRef = snapshot.docs[0].ref;
    const envelope = snapshot.docs[0].data();

    await docRef.set(
      {
        status: status || 'updated',
        providerPayload: payload,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (status === 'completed' && envelope.projectId) {
      const mappedSignatures = signatures.map((item) => ({
        documentId: envelope.documentId,
        signerId: item.signerId || item.email || `external_${nanoid(8)}`,
        signerName: item.signerName || item.name || item.email || 'External Signer',
        signerRole: item.signerRole || item.role || 'signer',
        signedAt: item.signedAt || new Date().toISOString(),
        providerEnvelopeId,
      }));

      if (mappedSignatures.length) {
        await db.collection('projects').doc(envelope.projectId).set(
          {
            documentSignatures: FieldValue.arrayUnion(...mappedSignatures),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    }

    await writeAuditEvent({
      action: 'esign_webhook_processed',
      actor: 'esign_provider',
      target: envelope.projectId || providerEnvelopeId,
      metadata: { providerEnvelopeId, status },
    });

    response.status(200).json({ ok: true });
  } catch (error) {
    logger.error('esignWebhook failed', error);
    response.status(500).json({ error: 'Failed to process e-sign webhook.' });
  }
});

export const createKycVerificationSession = onCall({ enforceAppCheck: false }, async (request) => {
  const { uid, profile } = await requireContextAuth(request);
  assertRole(profile, ['owner', 'developer', 'investor', 'property_manager']);

  const provider = process.env.KYC_PROVIDER || 'mock';
  let sessionResult = null;

  if (provider === 'stripe_identity' && stripe) {
    const stripeSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        uid,
        role: profile.role || 'unknown',
      },
    });

    sessionResult = {
      provider: 'stripe_identity',
      sessionId: stripeSession.id,
      url: stripeSession.url,
      status: stripeSession.status,
    };
  } else {
    sessionResult = {
      provider: provider || 'mock',
      sessionId: `mock_kyc_${nanoid(10)}`,
      url: `${FRONTEND_BASE_URL}/app/compliance?mockKyc=1`,
      status: 'requires_input',
    };
  }

  await db.collection('kycSessions').add({
    userId: uid,
    role: profile.role,
    provider: sessionResult.provider,
    providerSessionId: sessionResult.sessionId,
    status: sessionResult.status,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditEvent({
    action: 'kyc_session_created',
    actor: uid,
    target: uid,
    metadata: {
      provider: sessionResult.provider,
      providerSessionId: sessionResult.sessionId,
    },
  });

  return sessionResult;
});

export const kycWebhook = onRequest(async (request, response) => {
  try {
    if (process.env.KYC_WEBHOOK_SECRET) {
      const supplied = request.get('x-anchorplot-webhook-secret');
      if (supplied !== process.env.KYC_WEBHOOK_SECRET) {
        response.status(401).json({ error: 'Invalid webhook secret.' });
        return;
      }
    }

    const payload = request.body || {};
    const uid = payload.uid || payload.userId;
    const providerSessionId = payload.providerSessionId || payload.sessionId;
    const normalized = String(payload.status || '').toLowerCase();

    if (!uid) {
      response.status(400).json({ error: 'Missing uid.' });
      return;
    }

    const mappedStatus = ['verified', 'approved', 'completed'].includes(normalized)
      ? 'verified'
      : ['failed', 'rejected', 'canceled'].includes(normalized)
        ? 'rejected'
        : 'pending';

    await db.collection('users').doc(uid).set(
      {
        kycStatus: mappedStatus,
        kycProviderSessionId: providerSessionId || null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await writeAuditEvent({
      action: 'kyc_webhook_processed',
      actor: 'kyc_provider',
      target: uid,
      metadata: { providerSessionId, providerStatus: normalized, mappedStatus },
    });

    response.status(200).json({ ok: true });
  } catch (error) {
    logger.error('kycWebhook failed', error);
    response.status(500).json({ error: 'Failed to process KYC webhook.' });
  }
});

export const createStripeCheckoutSession = onCall({ enforceAppCheck: false }, async (request) => {
  const { uid, profile } = await requireContextAuth(request);
  assertRole(profile, ['property_manager', 'owner', 'admin']);

  const { priceId, feature = 'pm_subscription' } = request.data || {};
  if (!priceId && stripe) {
    throw new HttpsError('invalid-argument', 'priceId is required when Stripe is enabled.');
  }

  let sessionData;
  if (stripe) {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${FRONTEND_BASE_URL}/app/property-management?billing=success`,
      cancel_url: `${FRONTEND_BASE_URL}/app/property-management?billing=cancel`,
      customer_email: profile.email,
      metadata: { uid, feature },
    });

    sessionData = {
      provider: 'stripe',
      sessionId: checkout.id,
      url: checkout.url,
      status: checkout.status || 'open',
    };
  } else {
    sessionData = {
      provider: 'mock',
      sessionId: `mock_checkout_${nanoid(10)}`,
      url: `${FRONTEND_BASE_URL}/app/property-management?billing=mock`,
      status: 'open',
    };
  }

  await db.collection('billingSessions').add({
    userId: uid,
    feature,
    provider: sessionData.provider,
    providerSessionId: sessionData.sessionId,
    status: sessionData.status,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditEvent({
    action: 'billing_checkout_created',
    actor: uid,
    target: uid,
    metadata: {
      feature,
      provider: sessionData.provider,
      providerSessionId: sessionData.sessionId,
    },
  });

  return sessionData;
});

export const createStripeBillingPortalSession = onCall({ enforceAppCheck: false }, async (request) => {
  const { uid, profile } = await requireContextAuth(request);

  if (!stripe) {
    return {
      provider: 'mock',
      url: `${FRONTEND_BASE_URL}/app/property-management?portal=mock`,
    };
  }

  const customerId = request.data?.customerId || profile.stripeCustomerId;
  if (!customerId) {
    throw new HttpsError('failed-precondition', 'No Stripe customer ID found.');
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${FRONTEND_BASE_URL}/app/property-management`,
  });

  await writeAuditEvent({
    action: 'billing_portal_created',
    actor: uid,
    target: uid,
    metadata: { customerId },
  });

  return {
    provider: 'stripe',
    url: portal.url,
  };
});

export const stripeWebhook = onRequest(async (request, response) => {
  try {
    if (!stripe) {
      response.status(200).json({ ok: true, skipped: true });
      return;
    }

    let event;
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      const signature = request.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(request.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = request.body;
    }

    const eventType = event.type;
    const eventData = event.data?.object || {};

    if (eventType === 'checkout.session.completed') {
      const uid = eventData.metadata?.uid;
      if (uid) {
        await db.collection('users').doc(uid).set(
          {
            subscriptionStatus: 'active',
            stripeCustomerId: eventData.customer || null,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    }

    if (eventType === 'customer.subscription.deleted') {
      const customerId = eventData.customer;
      const users = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(10).get();
      for (const userDoc of users.docs) {
        await userDoc.ref.set({ subscriptionStatus: 'canceled', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
    }

    await writeAuditEvent({
      action: 'stripe_webhook_processed',
      actor: 'stripe',
      target: eventType,
      metadata: { eventType },
    });

    response.status(200).json({ received: true });
  } catch (error) {
    logger.error('stripeWebhook failed', error);
    response.status(400).json({ error: 'Webhook processing failed.' });
  }
});

function normalizeFeatureId(feature, index) {
  return (
    feature?.id ||
    feature?.properties?.id ||
    feature?.properties?.zone_id ||
    feature?.properties?.code ||
    `feature_${index}`
  );
}

function asFeatureCollection(input) {
  if (!input) return { type: 'FeatureCollection', features: [] };
  if (input.type === 'FeatureCollection' && Array.isArray(input.features)) return input;
  if (Array.isArray(input.features)) return { type: 'FeatureCollection', features: input.features };
  return { type: 'FeatureCollection', features: [] };
}

function parseParcelGeometry(parcel) {
  const geometryCandidate = parcel?.geometry || parcel?.geojson || parcel?.shape;
  if (!geometryCandidate) return null;

  try {
    const geometry = typeof geometryCandidate === 'string'
      ? JSON.parse(geometryCandidate)
      : geometryCandidate;

    if (geometry?.type === 'Feature') {
      return geometry;
    }

    if (geometry?.type && geometry?.coordinates) {
      return turf.feature(geometry, parcel);
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function createZoningAlertsForFeature(connector, changedFeature, previousFeature = null) {
  const connectorCity = connector.city || connector.cityName || null;

  let parcelsQuery = db.collection('parcels').limit(500);
  if (connectorCity) {
    parcelsQuery = db.collection('parcels').where('city', '==', connectorCity).limit(500);
  }

  const parcelsSnapshot = await parcelsQuery.get();
  const changedGeometry = changedFeature?.geometry ? turf.feature(changedFeature.geometry, changedFeature.properties || {}) : null;
  if (!changedGeometry) return 0;

  let impactedCount = 0;

  for (const parcelDoc of parcelsSnapshot.docs) {
    const parcel = { id: parcelDoc.id, ...parcelDoc.data() };
    const parcelFeature = parseParcelGeometry(parcel);
    if (!parcelFeature) continue;

    let intersects = false;
    try {
      intersects = turf.booleanIntersects(changedGeometry, parcelFeature);
    } catch (error) {
      intersects = false;
    }

    if (!intersects) continue;

    impactedCount += 1;

    await db.collection('zoningAlerts').add({
      userId: parcel.ownerId || parcel.ownerUid || null,
      parcelId: parcel.id,
      city: parcel.city || connectorCity || 'Unknown City',
      state: parcel.state || connector.state || null,
      connectorId: connector.id,
      status: 'unread',
      sourceUrl: connector.feedUrl || null,
      effectiveDate: changedFeature?.properties?.effectiveDate || changedFeature?.properties?.effective_date || null,
      before: previousFeature?.properties || null,
      after: changedFeature?.properties || null,
      summary: changedFeature?.properties?.summary || 'Zoning update may impact your parcel.',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return impactedCount;
}

export const syncCityZoningFeeds = onSchedule('every 6 hours', async () => {
  const connectorsSnapshot = await db.collection('cityConnectors').where('active', '==', true).get();
  let connectorProcessed = 0;
  let totalChangedFeatures = 0;
  let totalImpactedParcels = 0;

  for (const connectorDoc of connectorsSnapshot.docs) {
    const connector = { id: connectorDoc.id, ...connectorDoc.data() };
    if (!connector.feedUrl) continue;

    try {
      const response = await fetch(connector.feedUrl);
      if (!response.ok) {
        logger.warn('Connector fetch failed', { connectorId: connector.id, status: response.status });
        continue;
      }

      const geojson = asFeatureCollection(await response.json());
      const nextFeatures = Array.isArray(geojson.features) ? geojson.features : [];

      const previousSnapshot = await db
        .collection('zoningSnapshots')
        .where('connectorId', '==', connector.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      const previousHashes = previousSnapshot.empty
        ? {}
        : (previousSnapshot.docs[0].data()?.featureHashes || {});

      const nextHashes = {};
      const nextFeaturesById = {};
      const changedFeatures = [];

      nextFeatures.forEach((feature, index) => {
        const featureId = normalizeFeatureId(feature, index);
        const hash = getFeatureHash(feature);
        nextHashes[featureId] = hash;
        nextFeaturesById[featureId] = feature;
        if (!previousHashes[featureId] || previousHashes[featureId] !== hash) {
          changedFeatures.push({ featureId, feature });
        }
      });

      await db.collection('zoningSnapshots').add({
        connectorId: connector.id,
        city: connector.city || null,
        state: connector.state || null,
        feedUrl: connector.feedUrl,
        featureCount: nextFeatures.length,
        changedCount: changedFeatures.length,
        featureHashes: nextHashes,
        featuresById: nextFeaturesById,
        createdAt: FieldValue.serverTimestamp(),
      });

      connectorProcessed += 1;
      totalChangedFeatures += changedFeatures.length;

      const previousFeaturesById = {};
      if (!previousSnapshot.empty) {
        const payload = previousSnapshot.docs[0].data()?.featuresById || {};
        Object.assign(previousFeaturesById, payload);
      }

      let impactedForConnector = 0;
      for (const changed of changedFeatures) {
        const impacted = await createZoningAlertsForFeature(
          connector,
          changed.feature,
          previousFeaturesById[changed.featureId] || null
        );
        impactedForConnector += impacted;
      }

      totalImpactedParcels += impactedForConnector;

      await writeAuditEvent({
        action: 'zoning_connector_synced',
        actor: 'system_scheduler',
        target: connector.id,
        metadata: {
          changedFeatures: changedFeatures.length,
          impactedParcels: impactedForConnector,
        },
      });
    } catch (error) {
      logger.error('Connector sync failed', { connectorId: connector.id, error: error.message });
    }
  }

  logger.info('Zoning sync completed', {
    connectorProcessed,
    totalChangedFeatures,
    totalImpactedParcels,
  });
});

export const runParcelImpactDiff = onSchedule('every day 02:00', async () => {
  const latestAlerts = await db.collection('zoningAlerts').where('status', '==', 'unread').limit(500).get();
  let refreshed = 0;

  for (const docSnapshot of latestAlerts.docs) {
    await docSnapshot.ref.set(
      {
        impactRefreshedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    refreshed += 1;
  }

  await writeAuditEvent({
    action: 'parcel_impact_refresh_completed',
    actor: 'system_scheduler',
    target: 'zoningAlerts',
    metadata: { refreshed },
  });

  logger.info('Parcel impact refresh completed', { refreshed });
});
