import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Layers, Building2, Ruler, Target, Heart, Clock, Eye, Send,
    Lock, Unlock, Shield, ChevronRight, ArrowLeft, DollarSign, Users, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProperty, incrementPropertyViews, createPitch } from '../services/firestoreService';

const DISCLOSURE_STAGES = [
    { key: 'browse', label: 'Browse', icon: Eye, desc: 'Anonymized view' },
    { key: 'interest', label: 'Interest', icon: Heart, desc: 'Express interest' },
    { key: 'pitch', label: 'Pitch', icon: Send, desc: 'Submit pitch' },
    { key: 'accepted', label: 'Accepted', icon: Shield, desc: 'Pitch accepted' },
    { key: 'attorney', label: 'Attorney', icon: Users, desc: 'Attorney selected' },
    { key: 'fee_ack', label: 'Fee Ack', icon: DollarSign, desc: 'Fee acknowledged' },
    { key: 'revealed', label: 'Full Reveal', icon: Unlock, desc: 'Property revealed' },
];

export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPitchForm, setShowPitchForm] = useState(false);
    const [pitchData, setPitchData] = useState({ proposal: '', budget: '', timeline: '', experience: '', affordableCapability: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const p = await getProperty(id);
                if (p) {
                    setProperty(p);
                    incrementPropertyViews(id);
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        load();
    }, [id]);

    const handlePitchSubmit = async () => {
        setSubmitting(true);
        try {
            await createPitch({
                propertyId: id,
                developerId: userData?.uid,
                developerName: userData?.name || 'Developer',
                ...pitchData,
                status: 'pending',
            });
            setShowPitchForm(false);
            setPitchData({ proposal: '', budget: '', timeline: '', experience: '', affordableCapability: '' });
        } catch (e) { console.error(e); }
        setSubmitting(false);
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!property) return (
        <div className="h-full flex flex-col items-center justify-center gap-4">
            <Lock size={48} className="text-text-tertiary" />
            <p className="text-text-secondary">Property not found.</p>
            <button onClick={() => navigate('/app/marketplace')} className="btn btn-primary px-6 py-2 text-sm">Back to Marketplace</button>
        </div>
    );

    const currentStageIndex = DISCLOSURE_STAGES.findIndex(s => s.key === (property.disclosureStage || 'browse'));
    const isOwner = userData?.role === 'owner' && property.ownerId === userData?.uid;
    const isDeveloper = userData?.role === 'developer';
    const isInvestor = userData?.role === 'investor';

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 lg:p-8">

                {/* Back button */}
                <button onClick={() => navigate('/app/marketplace')}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-medium mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to Marketplace
                </button>

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{property.zoningDistrict || 'Zoning TBD'}</span>
                            {property.affordableHousingOptIn && <span className="px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-bold">♥ Affordable</span>}
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-element text-text-tertiary text-xs font-medium"><Eye size={10} className="inline mr-1" />{property.views || 0} views</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-text-primary">
                            {property.city || 'Unknown City'}, {property.state || ''}
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {property.neighborhoodBand || 'Neighborhood'} · {property.existingStructure || 'Property'} · {property.lotSizeMin && property.lotSizeMax ? `${Number(property.lotSizeMin).toLocaleString()}–${Number(property.lotSizeMax).toLocaleString()} sq ft` : 'Size TBD'}
                        </p>
                    </div>
                </div>

                {/* Disclosure Stage Progress */}
                <div className="bg-surface border border-border-light rounded-2xl p-5 mb-6 shadow-sm">
                    <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Disclosure Stage</p>
                    <div className="flex items-center gap-1">
                        {DISCLOSURE_STAGES.map((stage, i) => {
                            const Icon = stage.icon;
                            const isActive = i === currentStageIndex;
                            const isComplete = i < currentStageIndex;
                            return (
                                <React.Fragment key={stage.key}>
                                    <div className={`flex flex-col items-center gap-1 ${isActive ? '' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isComplete ? 'bg-primary text-white' :
                                                isActive ? 'bg-primary/10 text-primary ring-2 ring-primary/30' :
                                                    'bg-surface-element text-text-tertiary'
                                            }`}>
                                            <Icon size={14} />
                                        </div>
                                        <span className={`text-[9px] font-bold text-center leading-tight ${isActive ? 'text-primary' : 'text-text-tertiary'}`}>{stage.label}</span>
                                    </div>
                                    {i < DISCLOSURE_STAGES.length - 1 && (
                                        <div className={`flex-1 h-0.5 rounded mb-4 ${isComplete ? 'bg-primary' : 'bg-border-light'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className="mt-3 bg-info/5 border border-info/10 rounded-lg p-3 flex items-start gap-2">
                        <Info size={14} className="text-info mt-0.5 shrink-0" />
                        <p className="text-[11px] text-text-secondary">
                            Full property details including address and parcel ID are revealed only after pitch acceptance, attorney selection (where required) and platform fee acknowledgment.
                        </p>
                    </div>
                </div>

                {/* Property Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Main attributes */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2"><Layers size={16} className="text-primary" /> Property Attributes</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    ['Zoning District', property.zoningDistrict || '—'],
                                    ['Structure', property.existingStructure || '—'],
                                    ['Units', property.existingUnits || '—'],
                                    ['Sq Ft', property.existingSquareFeet ? Number(property.existingSquareFeet).toLocaleString() : '—'],
                                    ['Year Built', property.yearBuilt || '—'],
                                    ['Condition', property.condition || '—'],
                                ].map(([k, v]) => (
                                    <div key={k} className="bg-surface-element/50 rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">{k}</p>
                                        <p className="text-sm font-semibold text-text-primary mt-0.5 capitalize">{v}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Overlays */}
                        {property.overlayFlags?.length > 0 && (
                            <div className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-text-primary mb-3">Overlay Flags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {property.overlayFlags.map(f => (
                                        <span key={f} className="px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-medium">{f}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Build Potential */}
                        <div className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2"><Target size={16} className="text-primary" /> Build Potential</h3>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[
                                    ['Max Units', property.maxUnits || '—'],
                                    ['Max Height', property.maxHeight ? `${property.maxHeight} ft` : '—'],
                                    ['Max FAR', property.maxFAR || '—'],
                                ].map(([k, v]) => (
                                    <div key={k} className="bg-surface-element/50 rounded-lg p-3 text-center">
                                        <p className="text-[10px] font-bold text-text-tertiary uppercase">{k}</p>
                                        <p className="text-lg font-bold text-text-primary mt-0.5">{v}</p>
                                    </div>
                                ))}
                            </div>
                            {property.targetOutcomes?.length > 0 && (
                                <>
                                    <p className="text-xs font-bold text-text-tertiary uppercase mb-2">Target Outcomes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {property.targetOutcomes.map(t => (
                                            <span key={t} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{t}</span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Budget & Timeline */}
                        <div className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2"><DollarSign size={16} className="text-primary" /> Budget & Timeline</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-bold text-text-tertiary uppercase">Budget Range</p>
                                    <p className="text-lg font-bold text-text-primary">
                                        {property.estimatedBudgetMin && property.estimatedBudgetMax
                                            ? `$${Number(property.estimatedBudgetMin).toLocaleString()} – $${Number(property.estimatedBudgetMax).toLocaleString()}`
                                            : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-tertiary uppercase">Timeline</p>
                                    <p className="text-sm font-semibold text-text-primary flex items-center gap-1"><Clock size={13} /> {property.targetTimeline || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Affordable Housing Badge */}
                        {property.affordableHousingOptIn && (
                            <div className="bg-gradient-to-br from-success/5 to-primary/5 border border-success/15 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-success mb-2 flex items-center gap-2"><Heart size={16} /> Affordable Housing</h3>
                                <div className="space-y-1.5 text-xs text-text-secondary">
                                    <p>AMI Level: <strong>{property.amiLevel || '—'}</strong></p>
                                    <p>Term: <strong>{property.affordabilityTerm ? `${property.affordabilityTerm} years` : '—'}</strong></p>
                                    <p>Public Funding: <strong>{property.publicFundingDesired ? 'Desired' : 'No'}</strong></p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm space-y-3">
                            {isDeveloper && (
                                <button onClick={() => setShowPitchForm(true)}
                                    className="btn btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
                                    <Send size={15} /> Submit Pitch
                                </button>
                            )}
                            {isInvestor && (
                                <button className="btn btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
                                    <DollarSign size={15} /> Express Investment Interest
                                </button>
                            )}
                            {isOwner && (
                                <div className="text-center text-xs text-text-secondary py-2">This is your listing</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pitch Form Modal */}
                {showPitchForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-surface border border-border-light rounded-2xl w-full max-w-lg shadow-2xl">
                            <div className="p-6 border-b border-border-light">
                                <h2 className="text-lg font-bold text-text-primary">Submit Structured Pitch</h2>
                                <p className="text-xs text-text-secondary mt-1">Your pitch will be reviewed by the property owner.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary block mb-1">Development Proposal <span className="text-danger">*</span></label>
                                    <textarea value={pitchData.proposal} onChange={e => setPitchData(p => ({ ...p, proposal: e.target.value }))} rows={3}
                                        className="w-full bg-surface border border-border-light rounded-xl py-2.5 px-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Describe your development vision..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary block mb-1">Proposed Budget ($)</label>
                                        <input type="number" value={pitchData.budget} onChange={e => setPitchData(p => ({ ...p, budget: e.target.value }))}
                                            className="w-full bg-surface border border-border-light rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="1500000" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary block mb-1">Proposed Timeline</label>
                                        <input type="text" value={pitchData.timeline} onChange={e => setPitchData(p => ({ ...p, timeline: e.target.value }))}
                                            className="w-full bg-surface border border-border-light rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="18 months" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary block mb-1">Relevant Experience</label>
                                    <textarea value={pitchData.experience} onChange={e => setPitchData(p => ({ ...p, experience: e.target.value }))} rows={2}
                                        className="w-full bg-surface border border-border-light rounded-xl py-2.5 px-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Past projects, certifications..." />
                                </div>
                                {property.affordableHousingOptIn && (
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary block mb-1">Affordable Housing Capability</label>
                                        <textarea value={pitchData.affordableCapability} onChange={e => setPitchData(p => ({ ...p, affordableCapability: e.target.value }))} rows={2}
                                            className="w-full bg-surface border border-border-light rounded-xl py-2.5 px-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="Your experience with affordable housing programs..." />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-border-light flex justify-end gap-3">
                                <button onClick={() => setShowPitchForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-hover">Cancel</button>
                                <button onClick={handlePitchSubmit} disabled={submitting || !pitchData.proposal}
                                    className="btn btn-primary px-6 py-2.5 text-sm font-bold disabled:opacity-50">
                                    {submitting ? 'Submitting...' : 'Submit Pitch'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
