import {
    createParcelEvent,
    getParcelIntelligenceSnapshot,
    listParcelEvents,
    updateParcel,
} from './firestoreService';

export async function appendParcelHistory(parcelId, eventType, payload = {}, actorId = '') {
    return createParcelEvent({
        parcelId,
        eventType,
        payload,
        actorId,
        source: 'parcel_intelligence',
    });
}

export async function getParcelLifecycle(parcelId) {
    return getParcelIntelligenceSnapshot(parcelId);
}

export async function getParcelTimeline(parcelId, maxCount = 200) {
    return listParcelEvents(parcelId, maxCount);
}

export async function updateCanonicalParcel(parcelId, updates = {}) {
    return updateParcel(parcelId, updates);
}
