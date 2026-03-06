function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function includesAnyKeyword(value, keywords) {
    const normalizedValue = String(value || '').toUpperCase();
    return keywords.some(keyword => normalizedValue.includes(keyword));
}

export function calculatePropertyMatchScore(property = {}) {
    let score = 55;

    const zoningValue = property.zoningDistrict || property.zoning;
    if (includesAnyKeyword(zoningValue, ['TOD', 'TRANSIT', 'MX', 'MIXED', 'C-2', 'C2', 'PD', 'R-4', 'R4'])) {
        score += 14;
    } else if (includesAnyKeyword(zoningValue, ['R-3', 'R3', 'C-1', 'C1', 'COMMERCIAL', 'MULTI'])) {
        score += 9;
    } else if (zoningValue) {
        score += 5;
    }

    const maxUnits = toNumber(property.maxUnits);
    if (maxUnits >= 20) score += 10;
    else if (maxUnits >= 8) score += 7;
    else if (maxUnits >= 3) score += 4;
    else if (maxUnits > 0) score += 2;

    const maxFloorAreaRatio = toNumber(property.maxFAR);
    if (maxFloorAreaRatio >= 4) score += 6;
    else if (maxFloorAreaRatio >= 2) score += 4;
    else if (maxFloorAreaRatio > 0) score += 2;

    const targetOutcomeCount = Array.isArray(property.targetOutcomes) ? property.targetOutcomes.length : 0;
    score += Math.min(targetOutcomeCount * 2, 8);

    const overlayFlags = Array.isArray(property.overlayFlags) ? property.overlayFlags.join(' ') : '';
    if (includesAnyKeyword(overlayFlags, ['TRANSIT', 'OPPORTUNITY', 'REDEVELOPMENT'])) {
        score += 5;
    }
    if (includesAnyKeyword(overlayFlags, ['HISTORIC', 'FLOOD', 'COASTAL', 'ENVIRONMENT'])) {
        score -= 3;
    }

    if (property.affordableHousingOptIn) score += 4;
    if (property.publicFundingDesired) score += 2;

    const minimumBudget = toNumber(property.estimatedBudgetMin);
    const maximumBudget = toNumber(property.estimatedBudgetMax);
    if (minimumBudget > 0 && maximumBudget >= minimumBudget) {
        score += 3;
    }

    const targetTimeline = String(property.targetTimeline || '');
    if (['12-18', '18-24', '24-36'].some(range => targetTimeline.includes(range))) {
        score += 2;
    }

    return Math.max(45, Math.min(99, Math.round(score)));
}

export function getMatchScore(property = {}) {
    const existingScore = Number(property.matchScore);
    if (Number.isFinite(existingScore) && existingScore > 0) {
        return Math.max(1, Math.min(99, Math.round(existingScore)));
    }

    return calculatePropertyMatchScore(property);
}
