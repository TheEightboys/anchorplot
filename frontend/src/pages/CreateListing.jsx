import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Home, Layers, ArrowRight, ArrowLeft, Check, Info,
    Building2, Ruler, Trees, DollarSign, Target, Heart, Truck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createProperty } from '../services/firestoreService';
import PageHeader from '../components/PageHeader';

const STEPS = ['Location & Basics', 'Zoning & Structure', 'Build Potential', 'Affordable Housing', 'Review & Submit'];

const ZONING_DISTRICTS = [
    'R-1 Single Family', 'R-2 Two Family', 'R-3 Multi-Family', 'R-4 High Density',
    'C-1 Local Commercial', 'C-2 General Commercial', 'MX Mixed Use',
    'I-1 Light Industrial', 'PD Planned Development', 'TOD Transit Oriented'
];

const OVERLAY_FLAGS = [
    'Historic District', 'Flood Zone', 'Coastal Zone', 'Environmental Sensitive',
    'Opportunity Zone', 'Transit Corridor', 'Redevelopment Area', 'Community Plan'
];

const TARGET_OUTCOMES = [
    'ADU Addition', 'Lot Split', 'Multi-Family Development', 'Mixed-Use Development',
    'Renovation & Rehab', 'Ground-Up Construction', 'Affordable Housing', 'Joint Venture Partnership'
];

const AMI_LEVELS = ['30% AMI', '50% AMI', '60% AMI', '80% AMI', '100% AMI', '120% AMI'];

export default function CreateListing() {
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        // Location (stored, never publicly shown)
        fullAddress: '',
        parcelId: '',
        // Anonymized attributes (shown to marketplace)
        city: '',
        state: '',
        neighborhoodBand: '',
        lotSizeRange: '',
        lotSizeMin: '',
        lotSizeMax: '',
        zoningDistrict: '',
        overlayFlags: [],
        // Structure
        existingStructure: '',
        existingUnits: '',
        existingSquareFeet: '',
        yearBuilt: '',
        condition: 'fair',
        // Build potential
        buildPotential: '',
        maxUnits: '',
        maxHeight: '',
        maxFAR: '',
        targetOutcomes: [],
        estimatedBudgetMin: '',
        estimatedBudgetMax: '',
        targetTimeline: '12-18 months',
        // Affordable housing
        affordableHousingOptIn: false,
        amiLevel: '',
        affordabilityTerm: '',
        publicFundingDesired: false,
        // Relocation
        relocationSupport: false,
        relocationHousing: false,
        relocationStorage: false,
        // Description
        ownerNotes: '',
    });

    const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
    const toggleArray = (key, val) => {
        setForm(prev => ({
            ...prev,
            [key]: prev[key].includes(val)
                ? prev[key].filter(v => v !== val)
                : [...prev[key], val]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await createProperty({
                ...form,
                ownerId: currentUser.uid,
                ownerName: userData?.name || 'Owner',
                status: 'pending',
                disclosureStage: 'browse',
                views: 0,
                pitchCount: 0,
            });
            navigate('/app/marketplace');
        } catch (err) {
            setError(err.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    const canAdvance = () => {
        if (step === 0) return form.city && form.state && form.fullAddress;
        if (step === 1) return form.zoningDistrict;
        if (step === 2) return form.targetOutcomes.length > 0;
        return true;
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6 lg:p-8">
                <PageHeader title="Create Anonymized Listing" subtitle="Your address and identity are never shown to developers or investors until deal stage." />

                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-8">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={i}>
                            <button
                                onClick={() => i < step && setStep(i)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${i === step ? 'bg-primary text-white shadow-md' :
                                        i < step ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20' :
                                            'bg-surface-element text-text-tertiary'
                                    }`}
                            >
                                {i < step ? <Check size={12} /> : <span className="w-4 text-center">{i + 1}</span>}
                                <span className="hidden sm:inline">{s}</span>
                            </button>
                            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-primary' : 'bg-border-light'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {error && (
                    <div className="bg-danger/8 border border-danger/15 text-danger text-sm p-4 rounded-xl mb-5">
                        {error}
                    </div>
                )}

                <div className="bg-surface border border-border-light rounded-2xl p-6 lg:p-8 shadow-sm">

                    {/* Step 0: Location & Basics */}
                    {step === 0 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <MapPin size={20} className="text-primary" /> Location & Basics
                            </h2>
                            <div className="bg-info/5 border border-info/10 rounded-xl p-4 flex items-start gap-3">
                                <Info size={16} className="text-info mt-0.5 shrink-0" />
                                <p className="text-xs text-text-secondary">Your exact address and parcel ID are stored securely and <strong>never shown</strong> until a gated stage is reached. Marketplace visitors see only city, neighborhood band, and lot size range.</p>
                            </div>
                            <fieldset className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Full Address <span className="text-danger">*</span> <span className="text-xs text-text-tertiary font-normal">(private)</span></label>
                                    <input type="text" value={form.fullAddress} onChange={e => update('fullAddress', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="123 Main Street, Suite 4" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-text-primary mb-1.5 block">City <span className="text-danger">*</span></label>
                                        <input type="text" value={form.city} onChange={e => update('city', e.target.value)}
                                            className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="San Francisco" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-text-primary mb-1.5 block">State <span className="text-danger">*</span></label>
                                        <input type="text" value={form.state} onChange={e => update('state', e.target.value)}
                                            className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="CA" maxLength={2} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Parcel ID <span className="text-xs text-text-tertiary font-normal">(private, optional)</span></label>
                                    <input type="text" value={form.parcelId} onChange={e => update('parcelId', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="APN or Parcel ID" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Neighborhood Band <span className="text-xs text-text-tertiary font-normal">(public)</span></label>
                                    <input type="text" value={form.neighborhoodBand} onChange={e => update('neighborhoodBand', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="e.g. SoMa / Mission / Westside" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-text-primary mb-1.5 block">Lot Size Min (sq ft)</label>
                                        <input type="number" value={form.lotSizeMin} onChange={e => update('lotSizeMin', e.target.value)}
                                            className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="3000" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-text-primary mb-1.5 block">Lot Size Max (sq ft)</label>
                                        <input type="number" value={form.lotSizeMax} onChange={e => update('lotSizeMax', e.target.value)}
                                            className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="5000" />
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    )}

                    {/* Step 1: Zoning & Structure */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <Layers size={20} className="text-primary" /> Zoning & Structure
                            </h2>
                            <div>
                                <label className="text-sm font-semibold text-text-primary mb-2 block">Zoning District <span className="text-danger">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ZONING_DISTRICTS.map(z => (
                                        <button key={z} type="button" onClick={() => update('zoningDistrict', z)}
                                            className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${form.zoningDistrict === z ? 'border-primary bg-primary/5 text-primary' : 'border-border-light bg-surface hover:bg-surface-hover text-text-secondary'
                                                }`}>
                                            {z}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-text-primary mb-2 block">Overlay Flags</label>
                                <div className="flex flex-wrap gap-2">
                                    {OVERLAY_FLAGS.map(f => (
                                        <button key={f} type="button" onClick={() => toggleArray('overlayFlags', f)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${form.overlayFlags.includes(f) ? 'border-warning bg-warning/10 text-warning' : 'border-border-light bg-surface hover:bg-surface-hover text-text-secondary'
                                                }`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Existing Structure</label>
                                    <select value={form.existingStructure} onChange={e => update('existingStructure', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                        <option value="">Select...</option>
                                        <option>Single Family Home</option>
                                        <option>Duplex</option>
                                        <option>Multi-Family</option>
                                        <option>Commercial Building</option>
                                        <option>Vacant Lot</option>
                                        <option>Mixed Use</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Condition</label>
                                    <select value={form.condition} onChange={e => update('condition', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                        <option value="vacant">Vacant Land</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Units</label>
                                    <input type="number" value={form.existingUnits} onChange={e => update('existingUnits', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="1" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Sq Ft</label>
                                    <input type="number" value={form.existingSquareFeet} onChange={e => update('existingSquareFeet', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="1200" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Year Built</label>
                                    <input type="number" value={form.yearBuilt} onChange={e => update('yearBuilt', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="1965" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Build Potential */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <Target size={20} className="text-primary" /> Build Potential & Targets
                            </h2>
                            <div>
                                <label className="text-sm font-semibold text-text-primary mb-2 block">Target Outcomes <span className="text-danger">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TARGET_OUTCOMES.map(t => (
                                        <button key={t} type="button" onClick={() => toggleArray('targetOutcomes', t)}
                                            className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${form.targetOutcomes.includes(t) ? 'border-primary bg-primary/5 text-primary' : 'border-border-light bg-surface hover:bg-surface-hover text-text-secondary'
                                                }`}>
                                            {form.targetOutcomes.includes(t) && <Check size={12} className="inline mr-1" />}
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Max Units</label>
                                    <input type="number" value={form.maxUnits} onChange={e => update('maxUnits', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="4" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Max Height (ft)</label>
                                    <input type="number" value={form.maxHeight} onChange={e => update('maxHeight', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="40" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Max FAR</label>
                                    <input type="text" value={form.maxFAR} onChange={e => update('maxFAR', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="2.5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Budget Range Min ($)</label>
                                    <input type="number" value={form.estimatedBudgetMin} onChange={e => update('estimatedBudgetMin', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="500000" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-primary mb-1.5 block">Budget Range Max ($)</label>
                                    <input type="number" value={form.estimatedBudgetMax} onChange={e => update('estimatedBudgetMax', e.target.value)}
                                        className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="2000000" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-text-primary mb-1.5 block">Target Timeline</label>
                                <select value={form.targetTimeline} onChange={e => update('targetTimeline', e.target.value)}
                                    className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option>6-12 months</option>
                                    <option>12-18 months</option>
                                    <option>18-24 months</option>
                                    <option>24-36 months</option>
                                    <option>36+ months</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Affordable Housing */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <Heart size={20} className="text-primary" /> Affordable Housing & Relocation
                            </h2>
                            <label className="flex items-center gap-3 p-4 rounded-xl border border-border-light hover:bg-surface-hover cursor-pointer transition-all">
                                <input type="checkbox" checked={form.affordableHousingOptIn} onChange={e => update('affordableHousingOptIn', e.target.checked)}
                                    className="w-5 h-5 rounded text-primary focus:ring-primary/20" />
                                <div>
                                    <p className="text-sm font-bold text-text-primary">Opt into affordable / mixed-income units</p>
                                    <p className="text-xs text-text-secondary">Enable matching with developers experienced in affordable housing</p>
                                </div>
                            </label>
                            {form.affordableHousingOptIn && (
                                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                    <div>
                                        <label className="text-sm font-semibold text-text-primary mb-2 block">Target AMI Level</label>
                                        <div className="flex flex-wrap gap-2">
                                            {AMI_LEVELS.map(a => (
                                                <button key={a} type="button" onClick={() => update('amiLevel', a)}
                                                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${form.amiLevel === a ? 'border-primary bg-primary/10 text-primary' : 'border-border-light bg-surface text-text-secondary'
                                                        }`}>
                                                    {a}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-text-primary mb-1.5 block">Affordability Term (years)</label>
                                        <input type="number" value={form.affordabilityTerm} onChange={e => update('affordabilityTerm', e.target.value)}
                                            className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="15" />
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={form.publicFundingDesired} onChange={e => update('publicFundingDesired', e.target.checked)}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary/20" />
                                        <span className="text-sm text-text-primary">Interested in public funding programs</span>
                                    </label>
                                </div>
                            )}
                            <div className="border-t border-border-light pt-5 mt-2">
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-border-light hover:bg-surface-hover cursor-pointer transition-all">
                                    <input type="checkbox" checked={form.relocationSupport} onChange={e => update('relocationSupport', e.target.checked)}
                                        className="w-5 h-5 rounded text-primary focus:ring-primary/20" />
                                    <div>
                                        <p className="text-sm font-bold text-text-primary flex items-center gap-2"><Truck size={16} /> Request temporary relocation support</p>
                                        <p className="text-xs text-text-secondary">Temporary housing and storage during construction</p>
                                    </div>
                                </label>
                                {form.relocationSupport && (
                                    <div className="flex gap-4 mt-3 pl-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={form.relocationHousing} onChange={e => update('relocationHousing', e.target.checked)}
                                                className="w-4 h-4 rounded" />
                                            <span className="text-sm text-text-secondary">Temporary housing</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={form.relocationStorage} onChange={e => update('relocationStorage', e.target.checked)}
                                                className="w-4 h-4 rounded" />
                                            <span className="text-sm text-text-secondary">Storage</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <Check size={20} className="text-primary" /> Review & Submit
                            </h2>
                            <div className="bg-info/5 border border-info/10 rounded-xl p-4 text-xs text-text-secondary">
                                <strong>What developers & investors will see:</strong> City, neighborhood band, lot size range, zoning district, overlays, structure summary, build potential, and target outcomes. Your address, parcel ID, and name are <strong>never</strong> shown.
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ['City', form.city || '—'],
                                    ['State', form.state || '—'],
                                    ['Neighborhood', form.neighborhoodBand || '—'],
                                    ['Lot Size', form.lotSizeMin && form.lotSizeMax ? `${Number(form.lotSizeMin).toLocaleString()}–${Number(form.lotSizeMax).toLocaleString()} sq ft` : '—'],
                                    ['Zoning', form.zoningDistrict || '—'],
                                    ['Structure', form.existingStructure || '—'],
                                    ['Condition', form.condition],
                                    ['Timeline', form.targetTimeline],
                                ].map(([k, v]) => (
                                    <div key={k} className="bg-surface-element rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">{k}</p>
                                        <p className="text-sm font-semibold text-text-primary mt-0.5">{v}</p>
                                    </div>
                                ))}
                            </div>
                            {form.overlayFlags.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-text-tertiary uppercase mb-2">Overlay Flags</p>
                                    <div className="flex flex-wrap gap-1.5">{form.overlayFlags.map(f => (
                                        <span key={f} className="px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">{f}</span>
                                    ))}</div>
                                </div>
                            )}
                            {form.targetOutcomes.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-text-tertiary uppercase mb-2">Target Outcomes</p>
                                    <div className="flex flex-wrap gap-1.5">{form.targetOutcomes.map(t => (
                                        <span key={t} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{t}</span>
                                    ))}</div>
                                </div>
                            )}
                            {form.affordableHousingOptIn && (
                                <div className="bg-success/5 border border-success/10 rounded-xl p-4">
                                    <p className="text-xs font-bold text-success mb-1">♥ Affordable Housing Enabled</p>
                                    <p className="text-xs text-text-secondary">AMI: {form.amiLevel || '—'} · Term: {form.affordabilityTerm ? `${form.affordabilityTerm} years` : '—'} · Public Funding: {form.publicFundingDesired ? 'Yes' : 'No'}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-semibold text-text-primary mb-1.5 block">Notes for developers (optional)</label>
                                <textarea value={form.ownerNotes} onChange={e => update('ownerNotes', e.target.value)} rows={3}
                                    className="w-full bg-surface border border-border-light rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="Anything else developers should know..." />
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-border-light">
                        <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <ArrowLeft size={16} /> Back
                        </button>
                        {step < STEPS.length - 1 ? (
                            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
                                className="btn btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                                Next <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={loading}
                                className="btn btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-bold shadow-md disabled:opacity-60">
                                {loading ? (
                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                                ) : (
                                    <>Submit Listing <Check size={16} /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
