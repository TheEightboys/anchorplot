import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Heart, Settings, Bell, ChevronDown, BarChart2, Check, Zap, Map, Loader2, Plus, Filter } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './Marketplace.css';
import PageHeader from '../components/PageHeader';
import { getMatchScore } from '../services/matchScore';

const Marketplace = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const container = useRef();
    const [lotSizeMinFilter, setLotSizeMinFilter] = useState('2500');
    const [lotSizeMaxFilter, setLotSizeMaxFilter] = useState('15000');
    const [overlayFilters, setOverlayFilters] = useState({
        tod: false,
        historic: false,
        opportunity: false,
        commercial: false,
    });
    const [minCapRateFilter, setMinCapRateFilter] = useState(5.5);
    const [targetIrrFilter, setTargetIrrFilter] = useState(18);

    const resetAllFilters = () => {
        setLotSizeMinFilter('2500');
        setLotSizeMaxFilter('15000');
        setOverlayFilters({
            tod: false,
            historic: false,
            opportunity: false,
            commercial: false,
        });
        setMinCapRateFilter(5.5);
        setTargetIrrFilter(18);
    };

    const toggleOverlayFilter = (filterKey) => {
        setOverlayFilters(previous => ({
            ...previous,
            [filterKey]: !previous[filterKey],
        }));
    };

    const getPropertyLotSize = (property) => {
        const directLotSize = Number(property.lotSize);
        if (Number.isFinite(directLotSize) && directLotSize > 0) return directLotSize;

        const minLotSize = Number(property.lotSizeMin);
        const maxLotSize = Number(property.lotSizeMax);
        if (Number.isFinite(minLotSize) && Number.isFinite(maxLotSize) && minLotSize > 0 && maxLotSize > 0) {
            return Math.round((minLotSize + maxLotSize) / 2);
        }

        const lotSizeRange = String(property.lotSizeRange || '');
        const numericValues = lotSizeRange.match(/\d[\d,]*/g)?.map(value => Number(value.replace(/,/g, ''))) || [];
        if (numericValues.length === 1) return numericValues[0];
        if (numericValues.length >= 2) return Math.round((numericValues[0] + numericValues[1]) / 2);

        return 0;
    };

    const parsePercentValue = (value) => {
        if (value === null || value === undefined) return NaN;
        if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
        const normalized = String(value).replace('%', '').trim();
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : NaN;
    };

    const getPropertyCapRate = (property) => {
        const candidates = [property.capRate, property.minCapRate, property.cap_rate];
        for (const candidate of candidates) {
            const parsed = parsePercentValue(candidate);
            if (Number.isFinite(parsed)) return parsed;
        }
        return NaN;
    };

    const getPropertyTargetIrr = (property) => {
        const candidates = [property.targetIRR, property.targetIrr, property.irr, property.expectedReturn];
        for (const candidate of candidates) {
            const parsed = parsePercentValue(candidate);
            if (Number.isFinite(parsed)) return parsed;
        }
        return NaN;
    };

    const filteredProperties = useMemo(() => {
        const minLotInput = Number(lotSizeMinFilter);
        const maxLotInput = Number(lotSizeMaxFilter);
        const minLotFilter = Number.isFinite(minLotInput) ? minLotInput : 0;
        const maxLotFilter = Number.isFinite(maxLotInput) ? maxLotInput : Number.MAX_SAFE_INTEGER;
        const normalizedMinLot = Math.min(minLotFilter, maxLotFilter);
        const normalizedMaxLot = Math.max(minLotFilter, maxLotFilter);
        const enabledOverlayKeys = Object.entries(overlayFilters)
            .filter(([, isEnabled]) => isEnabled)
            .map(([key]) => key);

        return properties.filter(property => {
            const propertyLotSize = getPropertyLotSize(property);
            if (propertyLotSize > 0 && (propertyLotSize < normalizedMinLot || propertyLotSize > normalizedMaxLot)) {
                return false;
            }

            const propertyCapRate = getPropertyCapRate(property);
            if (Number.isFinite(propertyCapRate) && propertyCapRate < minCapRateFilter) {
                return false;
            }

            const propertyIrr = getPropertyTargetIrr(property);
            if (Number.isFinite(propertyIrr) && propertyIrr < targetIrrFilter) {
                return false;
            }

            const overlayText = [
                ...(Array.isArray(property.overlayFlags) ? property.overlayFlags : []),
                ...(Array.isArray(property.tags) ? property.tags : []),
                property.zoningDistrict,
                property.buildPotential,
            ].join(' ').toLowerCase();

            if (enabledOverlayKeys.length === 0) {
                return true;
            }

            const overlayMatches = {
                tod: overlayText.includes('tod') || overlayText.includes('transit'),
                historic: overlayText.includes('historic'),
                opportunity: overlayText.includes('opportunity'),
                commercial: overlayText.includes('commercial') || overlayText.includes('c1') || overlayText.includes('c2'),
            };

            return enabledOverlayKeys.some(key => overlayMatches[key]);
        });
    }, [properties, lotSizeMinFilter, lotSizeMaxFilter, overlayFilters, minCapRateFilter, targetIrrFilter]);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const listingsSnap = await getDocs(collection(db, 'listings'));
                const parcelsSnap = await getDocs(collection(db, 'parcels'));
                
                const parcelsMap = {};
                parcelsSnap.docs.forEach(doc => {
                    parcelsMap[doc.id] = { id: doc.id, ...doc.data() };
                });

                const propsData = listingsSnap.docs
                    .map(doc => {
                        const listingData = { id: doc.id, ...doc.data() };
                        const parcelData = parcelsMap[listingData.parcelId] || {};
                        const propertyData = { ...parcelData, ...listingData, id: listingData.id, parcelId: parcelData.id };
                        
                        const lotSize = getPropertyLotSize(propertyData);
                        const normalizedTags = Array.isArray(propertyData.tags) && propertyData.tags.length > 0
                            ? propertyData.tags
                            : (Array.isArray(propertyData.overlayFlags) ? propertyData.overlayFlags.slice(0, 2) : []);

                        return {
                            ...propertyData,
                            title: propertyData.title || `${propertyData.city || 'Unknown City'} Opportunity`,
                            zoning: propertyData.zoning || propertyData.zoningDistrict || 'TBD',
                            lotSize,
                            lotSizeLabel: lotSize > 0 ? lotSize.toLocaleString() : (propertyData.lotSizeRange || 'TBD'),
                            tags: normalizedTags,
                            imageGradient: propertyData.imageGradient || 'from-emerald-200 via-emerald-100 to-emerald-50',
                            matchScore: getMatchScore(propertyData),
                        };
                    })
                    .sort((firstProperty, secondProperty) => secondProperty.matchScore - firstProperty.matchScore);
                setProperties(propsData);
            } catch (error) {
                console.error('Error fetching properties:', error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    useGSAP(() => {
        if (properties.length > 0) {
            gsap.from('.opportunity-card', {
                y: 50,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                clearProps: 'all'
            });
        }
    }, { dependencies: [properties], scope: container });

    return (
        <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-background" ref={container}>

            {/* Left Sidebar Filters */}
            <div className="w-[280px] shrink-0 bg-surface border-r border-light flex flex-col h-full overflow-y-auto z-10">
                <div className="p-4 border-b border-light flex justify-between items-center sticky top-0 bg-surface z-10">
                    <h2 className="font-bold">Filters</h2>
                    <button className="text-sm text-primary hover:underline" onClick={resetAllFilters}>Reset All</button>
                </div>

                <div className="p-5 flex flex-col gap-6">

                    {/* Property Specs */}
                    <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">PROPERTY SPECS</p>
                        <label className="text-sm font-medium mb-2 block">Lot Size (sq ft)</label>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="2500" value={lotSizeMinFilter} onChange={(event) => setLotSizeMinFilter(event.target.value)} className="w-full border border-light rounded p-2 text-sm focus:outline-primary bg-surface-hover" />
                            <span className="text-text-secondary">-</span>
                            <input type="number" placeholder="15000" value={lotSizeMaxFilter} onChange={(event) => setLotSizeMaxFilter(event.target.value)} className="w-full border border-light rounded p-2 text-sm focus:outline-primary bg-surface-hover" />
                        </div>
                    </div>

                    {/* Zoning & Overlays */}
                    <div className="border-t border-light pt-6">
                        <div className="flex justify-between items-center mb-4 cursor-pointer">
                            <p className="font-bold text-sm">Zoning & Overlays</p>
                            <ChevronDown size={16} className="text-text-secondary" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <button type="button" onClick={() => toggleOverlayFilter('tod')} className="flex items-center gap-2 text-sm cursor-pointer group text-left">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${overlayFilters.tod ? 'border-primary bg-primary text-white' : 'border-border-medium bg-surface text-transparent group-hover:border-primary'}`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className={overlayFilters.tod ? 'group-hover:text-primary transition-colors' : 'text-text-secondary group-hover:text-text-primary transition-colors'}>Transit Oriented (TOD)</span>
                            </button>
                            <button type="button" onClick={() => toggleOverlayFilter('historic')} className="flex items-center gap-2 text-sm cursor-pointer group text-left">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${overlayFilters.historic ? 'border-primary bg-primary text-white' : 'border-border-medium bg-surface text-transparent group-hover:border-primary'}`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className={overlayFilters.historic ? 'group-hover:text-primary transition-colors' : 'text-text-secondary group-hover:text-text-primary transition-colors'}>Historic District</span>
                            </button>
                            <button type="button" onClick={() => toggleOverlayFilter('opportunity')} className="flex items-center gap-2 text-sm cursor-pointer group text-left">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${overlayFilters.opportunity ? 'border-primary bg-primary text-white' : 'border-border-medium bg-surface text-transparent group-hover:border-primary'}`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className={overlayFilters.opportunity ? 'group-hover:text-primary transition-colors' : 'text-text-secondary group-hover:text-text-primary transition-colors'}>Opportunity Zone</span>
                            </button>
                            <button type="button" onClick={() => toggleOverlayFilter('commercial')} className="flex items-center gap-2 text-sm cursor-pointer group text-left">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${overlayFilters.commercial ? 'border-primary bg-primary text-white' : 'border-border-medium bg-surface text-transparent group-hover:border-primary'}`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className={overlayFilters.commercial ? 'group-hover:text-primary transition-colors' : 'text-text-secondary group-hover:text-text-primary transition-colors'}>Commercial Overlay (C1/C2)</span>
                            </button>
                        </div>
                    </div>

                    {/* Financial Targets */}
                    <div className="border-t border-light pt-6">
                        <div className="flex justify-between items-center mb-4 cursor-pointer">
                            <p className="font-bold text-sm">Financial Targets</p>
                            <ChevronDown size={16} className="text-text-secondary" />
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2 text-text-secondary">
                                <span>Min Cap Rate</span>
                                <span className="font-bold text-text-primary">{minCapRateFilter.toFixed(1)}%</span>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="12"
                                step="0.1"
                                value={minCapRateFilter}
                                onChange={(event) => setMinCapRateFilter(Number(event.target.value))}
                                className="w-full mt-3 accent-primary"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2 text-text-secondary">
                                <span>Target IRR</span>
                                <span className="font-bold text-text-primary">{targetIrrFilter.toFixed(1)}%</span>
                            </div>
                            <input
                                type="range"
                                min="8"
                                max="35"
                                step="0.5"
                                value={targetIrrFilter}
                                onChange={(event) => setTargetIrrFilter(Number(event.target.value))}
                                className="w-full mt-3 accent-primary"
                            />
                        </div>
                    </div>

                    {/* AI Analyst Block */}
                    <div className="card p-4 bg-info-bg border-info border-opacity-20 flex flex-col gap-3 mt-4 shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-info opacity-10 rotate-12">
                            <Zap size={64} fill="currentColor" />
                        </div>
                        <div className="flex items-center gap-2 font-bold text-info">
                            <Zap size={16} className="fill-current" /> AI Analyst
                        </div>
                        <p className="text-sm text-info text-opacity-80">Get custom alerts for off-market deals matching your criteria.</p>
                        <button className="text-info font-bold text-sm text-left hover:underline">Configure Alerts →</button>
                    </div>

                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">

                {/* Top Bar inside content */}
                <div className="p-6 pb-2 flex justify-between items-end sticky top-0 bg-background z-10 backdrop-blur-sm shadow-sm">
                    <div>
                        <h1 className="text-h2 font-bold mb-1">Marketplace Opportunities</h1>
                        <p className="text-text-secondary">
                            {loading
                                ? 'Loading anonymized listings...'
                                : `Showing ${filteredProperties.length} anonymized site${filteredProperties.length === 1 ? '' : 's'} matching your criteria`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="btn btn-secondary flex items-center gap-2 bg-white text-text-secondary font-bold text-sm py-2 px-4 shadow-sm border border-border-light hover:border-border-medium hover:text-text-primary">
                            <Settings size={16} /> Saved Searches
                        </button>
                        <div className="flex bg-white rounded-md shadow-sm border border-light p-1">
                            <button className="p-1 px-2.5 rounded bg-surface-hover shadow-sm"><div className="w-4 h-4 grid grid-cols-2 gap-[2px]"><div className="bg-primary rounded-[1px]"></div><div className="bg-primary rounded-[1px]"></div><div className="bg-primary rounded-[1px]"></div><div className="bg-primary rounded-[1px]"></div></div></button>
                            <button className="p-1 px-2.5 rounded text-light hover:text-text-secondary"><div className="w-4 h-4 flex flex-col gap-[2px]"><div className="h-1 w-full bg-current rounded-[1px]"></div><div className="h-1 w-full bg-current rounded-[1px]"></div><div className="h-1 w-full bg-current rounded-[1px]"></div></div></button>
                        </div>
                        <button className="btn btn-primary flex items-center gap-2 shadow-sm font-bold ml-2">
                            Sort: Match Score <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                {/* Opportunity Cards Grid */}
                <div className="p-6 overflow-y-auto flex-1 h-full">
                    {loading ? (
                        <div className="flex items-center justify-center p-12 text-text-secondary">
                            <Loader2 className="animate-spin mr-2" /> Loading Market Data...
                        </div>
                    ) : filteredProperties.length === 0 ? (
                        <div className="flex items-center justify-center p-12 text-text-secondary">
                            No properties match your current filters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">

                            {filteredProperties.map((prop) => (
                                <div key={prop.id} className="card opportunity-card bg-white flex flex-col border border-border-light shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 opacity-0">

                                    {/* Image/Map Placeholder area */}
                                    <div className={`h-[200px] relative overflow-hidden ${prop.imageGradient?.includes('bg-') ? prop.imageGradient : `bg-gradient-to-br ${prop.imageGradient}`}`}>
                                        {/* Special condition for map SVG simulation if present in data */}
                                        {prop.imageGradient?.includes('bg-') && (
                                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                                <rect width="100%" height="100%" fill="#a7f3d0" />
                                                <path d="M 0 50 Q 80 80 150 40 T 300 20 T 400 90 L 400 200 L 0 200 Z" fill="#bae6fd" opacity="0.8" />
                                                <circle cx="200" cy="120" r="4" fill="#ef4444" />
                                                <circle cx="200" cy="120" r="20" fill="#ef4444" opacity="0.3" />
                                            </svg>
                                        )}

                                        {/* Blurred map simulation for gradients */}
                                        {!prop.imageGradient?.includes('bg-') && (
                                            <div className="absolute inset-0 bg-map-pattern opacity-30 blur-[2px] scale-110"></div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.8)] to-transparent"></div>

                                        {/* Overlay items */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            {prop.tags?.map((tag, idx) => (
                                                <span key={idx} className={`${idx === 0 ? 'bg-white text-info' : 'bg-[#1e293b] text-white'} text-[10px] font-bold px-2 py-1 rounded shadow-sm`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-danger transition-colors border border-white border-opacity-30">
                                            <Heart size={16} />
                                        </button>

                                        <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-60 text-lg font-mono tracking-widest pointer-events-none">
                                            300×300
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-white text-opacity-80 font-bold uppercase tracking-widest mb-1">ANCHORPLOT MATCH</p>
                                                <p className="text-3xl font-bold text-white leading-none">{prop.matchScore}%</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg border-2 border-primary-hover">
                                                <BarChart2 size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{prop.title}</h3>
                                        <p className="text-sm text-text-secondary mb-4 line-clamp-1">Neighborhood Band: {prop.neighborhoodBand}</p>

                                        <div className="flex gap-4 mb-5 pb-4 border-b border-light">
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold text-light tracking-widest mb-1">ZONING</p>
                                                <p className="font-bold text-sm">{prop.zoning}</p>
                                            </div>
                                            <div className="w-px bg-light"></div>
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold text-light tracking-widest mb-1">LOT SIZE</p>
                                                <p className="font-bold text-sm">{prop.lotSizeLabel}{prop.lotSize > 0 ? ' sq ft' : ''}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6 flex-1">
                                            <p className="text-[10px] uppercase font-bold text-light tracking-widest mb-2">BUILD POTENTIAL</p>
                                            <div className="flex items-center gap-2 text-info font-bold text-sm">
                                                <div className="p-1.5 bg-info-bg rounded"><Map size={14} className="text-info" /></div>
                                                {prop.buildPotential}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 justify-between items-center mt-auto">
                                            <button
                                                className="text-text-secondary font-bold text-sm hover:text-primary transition-colors"
                                                onClick={() => navigate(`/app/marketplace/${prop.id}`)}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                className="btn btn-primary bg-primary text-white shadow-sm font-bold w-[120px]"
                                                onClick={() => navigate(`/app/marketplace/${prop.id}`)}
                                            >
                                                Submit Pitch
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mb-8">
                        <button className="w-8 h-8 rounded flex items-center justify-center bg-white border border-light text-text-secondary hover:border-primary hover:text-primary transition-colors"><ChevronDown size={14} className="rotate-90" /></button>
                        <button className="w-8 h-8 rounded flex items-center justify-center bg-primary border border-primary text-white font-bold text-sm shadow-sm">1</button>
                        <button className="w-8 h-8 rounded flex items-center justify-center bg-white border border-light text-text-primary hover:border-primary hover:text-primary transition-colors font-bold text-sm">2</button>
                        <button className="w-8 h-8 rounded flex items-center justify-center bg-white border border-light text-text-primary hover:border-primary hover:text-primary transition-colors font-bold text-sm">3</button>
                        <span className="text-text-secondary tracking-widest">...</span>
                        <button className="w-8 h-8 rounded flex items-center justify-center bg-white border border-light text-text-primary hover:border-primary hover:text-primary transition-colors font-bold text-sm">8</button>
                        <button className="w-8 h-8 rounded flex items-center justify-center bg-white border border-light text-text-secondary hover:border-primary hover:text-primary transition-colors"><ChevronDown size={14} className="-rotate-90" /></button>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Marketplace;
