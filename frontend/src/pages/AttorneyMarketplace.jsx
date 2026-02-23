import React, { useState, useEffect } from 'react';
import { Scale, Star, MapPin, Search, Filter, Check, ChevronRight, Shield, Phone, Mail, Briefcase } from 'lucide-react';
import { listAttorneys } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

export default function AttorneyMarketplace() {
    const { userData } = useAuth();
    const [attorneys, setAttorneys] = useState([]);
    const [search, setSearch] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [selectedAttorney, setSelectedAttorney] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttorneys = async () => {
            try {
                const data = await listAttorneys();
                // Map Firestore structure or use default fallback structure
                const mappedData = data.map(att => ({
                    id: att.id,
                    name: att.name || 'Unknown Attorney',
                    firm: att.firm || 'Independent Practice',
                    barNumber: att.barNumber || 'N/A',
                    barState: att.barState || 'Unknown',
                    specialties: att.specialties || [],
                    rating: att.rating || 0.0,
                    completedDeals: att.completedDeals || 0,
                    location: att.location || 'Unknown Location',
                    verified: att.verified || false,
                    hourlyRate: att.hourlyRate || 0
                }));
                setAttorneys(mappedData);
            } catch (error) {
                console.error('Error fetching attorneys:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttorneys();
    }, []);

    const filtered = attorneys.filter(a => {
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.firm.toLowerCase().includes(search.toLowerCase())) return false;
        if (stateFilter && a.barState !== stateFilter) return false;
        return true;
    });

    const states = [...new Set(attorneys.map(a => a.barState))];

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 lg:p-8">
                <PageHeader
                    title="Attorney Marketplace"
                    subtitle="Vetted attorneys with verified ratings tied to completed transactions. AnchorPlot never provides legal advice."
                />

                {/* Disclaimer */}
                <div className="bg-danger/5 border border-danger/10 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <Shield size={16} className="text-danger mt-0.5 shrink-0" />
                    <p className="text-xs text-text-secondary">
                        <strong className="text-danger">Legal Disclaimer:</strong> AnchorPlot provides access to vetted attorney services but does not provide legal advice. All attorneys are independently licensed professionals. Ratings are based on completed platform transactions.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or firm..."
                            className="w-full bg-surface border border-border-light rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
                        className="bg-surface border border-border-light rounded-xl py-2.5 px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <option value="">All States</option>
                        {states.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>

                {/* Loading State or Attorney Cards */}
                {loading ? (
                    <div className="text-center py-12 text-text-secondary">
                        Loading vetted attorneys...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <Scale size={40} className="text-text-tertiary mx-auto mb-3" />
                        <p className="text-text-secondary">No attorneys match your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filtered.map(att => (
                            <div key={att.id}
                                onClick={() => setSelectedAttorney(att)}
                                className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
                                            <Scale size={22} className="text-danger" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{att.name}</p>
                                            <p className="text-xs text-text-secondary">{att.firm}</p>
                                        </div>
                                    </div>
                                    {att.verified && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
                                            <Check size={10} /> Verified
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-3 text-xs text-text-secondary">
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {att.location}</span>
                                    <span className="flex items-center gap-1"><Briefcase size={12} /> Bar #{att.barNumber}</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {att.specialties.map(s => (
                                        <span key={s} className="px-2 py-0.5 rounded-full bg-surface-element text-text-secondary text-[10px] font-medium">{s}</span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Star size={13} className="text-warning fill-warning" />
                                            <span className="text-sm font-bold text-text-primary">{att.rating}</span>
                                        </div>
                                        <span className="text-xs text-text-tertiary">{att.completedDeals} deals</span>
                                    </div>
                                    <span className="text-sm font-bold text-text-primary">${att.hourlyRate}/hr</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Attorney Detail Modal */}
                {selectedAttorney && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedAttorney(null)}>
                        <div className="bg-surface border border-border-light rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-border-light">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-danger/10 flex items-center justify-center">
                                        <Scale size={28} className="text-danger" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-text-primary">{selectedAttorney.name}</h2>
                                        <p className="text-sm text-text-secondary">{selectedAttorney.firm}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        ['Rating', `${selectedAttorney.rating}/5.0`],
                                        ['Deals', selectedAttorney.completedDeals],
                                        ['Rate', `$${selectedAttorney.hourlyRate}/hr`],
                                    ].map(([k, v]) => (
                                        <div key={k} className="bg-surface-element rounded-lg p-3 text-center">
                                            <p className="text-[10px] font-bold text-text-tertiary uppercase">{k}</p>
                                            <p className="text-lg font-bold text-text-primary">{v}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-tertiary uppercase mb-2">Bar Information</p>
                                    <p className="text-sm text-text-primary">Bar #{selectedAttorney.barNumber} · {selectedAttorney.barState}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-tertiary uppercase mb-2">Specialties</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAttorney.specialties.map(s => (
                                            <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-border-light flex justify-end gap-3">
                                <button onClick={() => setSelectedAttorney(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-hover">Close</button>
                                <button className="btn btn-primary px-6 py-2.5 text-sm font-bold">Select Attorney</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
