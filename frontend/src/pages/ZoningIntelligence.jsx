import React, { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, Info, Activity, MapPin, Search, Map as MapIcon, Plus, Loader2, Bell } from 'lucide-react';
import './ZoningIntelligence.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import PageHeader from '../components/PageHeader';
import { getZoningAlertsForUser, formatDateValue, getParcelsForUser } from '../services/dashboardData';


const ZoningIntelligence = () => {
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [trackedProperties, setTrackedProperties] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedTrackedId, setSelectedTrackedId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrackedProperties = async () => {
            try {
                const [trackedSnapshot, zoningAlerts] = await Promise.all([
                    getDocs(userData?.uid
                        ? query(collection(db, 'trackedProperties'), where('userId', '==', userData.uid))
                        : query(collection(db, 'trackedProperties'))),
                    getZoningAlertsForUser(userData),
                ]);

                let propsData = trackedSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    city: doc.data().city || 'Unknown City',
                    state: doc.data().state || '',
                    parcelId: doc.data().parcelId || doc.data().apn || 'N/A',
                }));

                if (propsData.length === 0 && userData?.uid) {
                    const scopedProperties = await getParcelsForUser(userData);
                    propsData = scopedProperties.map(property => ({
                        id: `property-${property.id}`,
                        city: property.city || 'Unknown City',
                        state: property.state || '',
                        parcelId: property.parcelId || property.apn || property.id,
                        sourcePropertyId: property.id,
                    }));
                }

                setTrackedProperties(propsData);
                setSelectedTrackedId(propsData[0]?.id || null);
                setAlerts(zoningAlerts || []);
            } catch (error) {
                console.error('Error fetching tracked properties:', error);
                setTrackedProperties([]);
                setAlerts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrackedProperties();
    }, [userData]);

    const hasTrackedProperties = trackedProperties.length > 0;
    const selectedTrackedProperty = trackedProperties.find(property => property.id === selectedTrackedId) || trackedProperties[0] || null;
    const relevantAlerts = alerts.filter(alert => {
        if (!selectedTrackedProperty) return true;
        const sameCity = String(alert.city || '').toLowerCase() === String(selectedTrackedProperty.city || '').toLowerCase();
        const sameParcel = selectedTrackedProperty.parcelId && String(alert.parcelId || '').toLowerCase() === String(selectedTrackedProperty.parcelId).toLowerCase();
        return sameCity || sameParcel;
    });

    if (loading) {
        return (
            <div className="zoning-container flex h-[calc(100vh-73px)] w-full items-center justify-center">
                <Loader2 className="animate-spin text-primary opacity-50" size={48} />
            </div>
        );
    }

    if (!hasTrackedProperties) {
        return (
            <div className="zoning-container flex h-[calc(100vh-73px)] w-full">
                {/* Left Panel - Empty State */}
                <div className="zoning-sidebar p-6 flex flex-col justify-center items-center text-center overflow-y-auto w-1/3 min-w-[380px] border-r border-border-light bg-surface z-10">
                    <div className="w-20 h-20 bg-surface-hover border border-border-medium rounded-full flex items-center justify-center mb-6 text-primary/30">
                        <MapIcon size={40} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-h2 font-bold mb-3">No Properties Tracked</h2>
                    <p className="text-text-secondary mb-8 leading-relaxed max-w-sm">
                        Monitor specific parcels for zoning changes, new ordinances and development incentives. Add your first property to begin tracking.
                    </p>
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => navigate('/app/marketplace')}>
                        <Plus size={18} /> Add Property to Watchlist
                    </button>

                    <div className="mt-12 text-left bg-surface-hover/50 border border-border-light rounded-lg p-5 w-full">
                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Activity size={16} className="text-info" /> Intelligence Features</h4>
                        <ul className="text-sm text-text-secondary space-y-2">
                            <li className="flex items-center gap-2"><ArrowUpRight size={14} className="text-success" /> Density bonus alerts</li>
                            <li className="flex items-center gap-2"><TrendingUp size={14} className="text-success" /> FAR adjustment tracking</li>
                            <li className="flex items-center gap-2"><Info size={14} className="text-info" /> New transit hub overlays</li>
                        </ul>
                    </div>
                </div>

                {/* Right Panel - Generic Map Placeholder */}
                <div className="zoning-map-area flex-1 relative bg-surface-hover overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-map-pattern opacity-20"></div>
                    <div className="text-center z-10 relative glass p-6 rounded-xl shadow-sm">
                        <MapPin size={32} className="text-text-tertiary mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-text-secondary">Interactive Map</h3>
                        <p className="text-sm text-text-tertiary">Select a property to view zoning overlays</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="zoning-container flex h-[calc(100vh-73px)] w-full">
            <div className="zoning-sidebar p-5 overflow-y-auto w-[420px] min-w-[380px] border-r border-border-light bg-surface z-10">
                <PageHeader
                    title="Zoning Intelligence"
                    subtitle="Track live zoning changes and parcel-specific alerts."
                    badge={`${trackedProperties.length} tracked`}
                />

                <div className="mt-5 space-y-2">
                    {trackedProperties.map(property => (
                        <button
                            key={property.id}
                            onClick={() => setSelectedTrackedId(property.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${selectedTrackedProperty?.id === property.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border-light bg-background hover:bg-surface-hover'
                                }`}
                        >
                            <p className="text-sm font-bold text-text-primary">{property.city}{property.state ? `, ${property.state}` : ''}</p>
                            <p className="text-xs text-text-secondary mt-1">Parcel: {property.parcelId}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Recent Alerts</h3>
                    <div className="space-y-2">
                        {relevantAlerts.length === 0 ? (
                            <div className="p-3 rounded-xl border border-border-light bg-background text-xs text-text-secondary">
                                No zoning alerts yet for this tracked property.
                            </div>
                        ) : relevantAlerts.map(alert => (
                            <div key={alert.id} className="p-3 rounded-xl border border-border-light bg-background">
                                <p className="text-sm font-semibold text-text-primary">{alert.title || alert.changeType || 'Zoning Update'}</p>
                                <p className="text-xs text-text-secondary mt-1">{alert.summary || alert.description || 'No details provided.'}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${String(alert.impact || '').toLowerCase() === 'high'
                                        ? 'bg-danger/10 text-danger'
                                        : String(alert.impact || '').toLowerCase() === 'positive'
                                            ? 'bg-success/10 text-success'
                                            : 'bg-info/10 text-info'
                                        }`}>
                                        {String(alert.impact || 'info').toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-text-tertiary">{formatDateValue(alert.effectiveDate || alert.createdAt, 'Recently')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="zoning-map-area flex-1 relative bg-surface-hover overflow-hidden">
                <div className="absolute inset-0 bg-map-pattern opacity-20"></div>
                <div className="absolute inset-0 p-6">
                    <div className="glass p-5 rounded-2xl shadow-sm max-w-lg">
                        <h3 className="text-lg font-bold text-text-primary mb-2">Property Context</h3>
                        {selectedTrackedProperty ? (
                            <>
                                <p className="text-sm text-text-secondary">
                                    Monitoring <strong className="text-text-primary">{selectedTrackedProperty.city}{selectedTrackedProperty.state ? `, ${selectedTrackedProperty.state}` : ''}</strong>
                                    {' '}for zoning and ordinance impacts.
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="bg-background/60 border border-border-light rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-text-tertiary uppercase">Parcel</p>
                                        <p className="text-xs font-semibold text-text-primary mt-1">{selectedTrackedProperty.parcelId}</p>
                                    </div>
                                    <div className="bg-background/60 border border-border-light rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-text-tertiary uppercase">Active Alerts</p>
                                        <p className="text-xs font-semibold text-text-primary mt-1">{relevantAlerts.length}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-text-secondary">Select a tracked property to view local zoning intelligence.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZoningIntelligence;
