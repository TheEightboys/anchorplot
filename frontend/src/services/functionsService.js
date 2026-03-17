import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export async function startKycSession() {
    const fn = httpsCallable(functions, 'createKycVerificationSession');
    const result = await fn({});
    return result.data;
}

export async function startBillingCheckout(priceId) {
    const fn = httpsCallable(functions, 'createStripeCheckoutSession');
    const result = await fn({ priceId, feature: 'pm_subscription' });
    return result.data;
}

export async function openBillingPortal(customerId) {
    const fn = httpsCallable(functions, 'createStripeBillingPortalSession');
    const result = await fn({ customerId });
    return result.data;
}

export async function createEsignEnvelope(payload) {
    const fn = httpsCallable(functions, 'createEsignEnvelope');
    const result = await fn(payload);
    return result.data;
}
