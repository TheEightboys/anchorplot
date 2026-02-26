import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, Settings, Bell, ChevronDown, BarChart2, Check, Zap, Map, Loader2, Plus, Filter } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './Marketplace.css';
import PageHeader from '../components/PageHeader';

const Marketplace = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const container = useRef();

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const q = query(collection(db, 'properties'), orderBy('matchScore', 'desc'));
                const querySnapshot = await getDocs(q);
                const propsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
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
                    <button className="text-sm text-primary hover:underline">Reset All</button>
                </div>

                <div className="p-5 flex flex-col gap-6">

                    {/* Property Specs */}
                    <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">PROPERTY SPECS</p>
                        <label className="text-sm font-medium mb-2 block">Lot Size (sq ft)</label>
                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="2500" defaultValue="2500" className="w-full border border-light rounded p-2 text-sm focus:outline-primary bg-surface-hover" />
                            <span className="text-text-secondary">-</span>
                            <input type="text" placeholder="15000" defaultValue="15000" className="w-full border border-light rounded p-2 text-sm focus:outline-primary bg-surface-hover" />
                        </div>
                    </div>

                    {/* Zoning & Overlays */}
                    <div className="border-t border-light pt-6">
                        <div className="flex justify-between items-center mb-4 cursor-pointer">
                            <p className="font-bold text-sm">Zoning & Overlays</p>
                            <ChevronDown size={16} className="text-text-secondary" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-primary bg-primary text-white flex items-center justify-center">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="group-hover:text-primary transition-colors">Transit Oriented (TOD)</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-border-medium bg-surface text-transparent flex items-center justify-center group-hover:border-primary">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-text-secondary group-hover:text-text-primary transition-colors">Historic District</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-border-medium bg-surface text-transparent flex items-center justify-center group-hover:border-primary">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-text-secondary group-hover:text-text-primary transition-colors">Opportunity Zone</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-border-medium bg-surface text-transparent flex items-center justify-center group-hover:border-primary">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-text-secondary group-hover:text-text-primary transition-colors">Commercial Overlay (C1/C2)</span>
                            </label>
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
                                <span className="font-bold text-text-primary">5.5%</span>
                            </div>
                            <div className="h-1 bg-border-light rounded-full relative mt-3">
                                <div className="absolute left-0 w-[40%] h-full bg-primary rounded-full"></div>
                                <div className="absolute left-[40%] top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-white rounded-full shadow cursor-grab"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2 text-text-secondary">
                                <span>Target IRR</span>
                                <span className="font-bold text-text-primary">18%</span>
                            </div>
                            <div className="h-1 bg-border-light rounded-full relative mt-3">
                                <div className="absolute left-0 w-[60%] h-full bg-primary rounded-full"></div>
                                <div className="absolute left-[60%] top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-white rounded-full shadow cursor-grab"></div>
                            </div>
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
                        <p className="text-text-secondary">Showing 42 anonymized sites matching your criteria</p>
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
                    ) : properties.length === 0 ? (
                        <div className="flex items-center justify-center p-12 text-text-secondary">
                            No matching properties found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">

                            {properties.map((prop) => (
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
                                                <p className="font-bold text-sm">{prop.lotSize} sq ft</p>
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
                                            <button className="text-text-secondary font-bold text-sm hover:text-primary transition-colors">View Details</button>
                                            <button className="btn btn-primary bg-primary text-white shadow-sm font-bold w-[120px]">Submit Pitch</button>
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
