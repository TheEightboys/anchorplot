import React, { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, Info, Activity, MapPin, Search, Map as MapIcon, Plus, Loader2, Bell } from 'lucide-react';
import './ZoningIntelligence.css';
import { useAuth } from '../contexts/AuthContext';
import { NavLink } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import PageHeader from '../components/PageHeader';


const ZoningIntelligence = () => {
    const { userData } = useAuth();
    const [trackedProperties, setTrackedProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrackedProperties = async () => {
            try {
                const q = userData?.uid
                    ? query(collection(db, 'trackedProperties'), where('userId', '==', userData.uid))
                    : query(collection(db, 'trackedProperties'));
                const querySnapshot = await getDocs(q);
                const propsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTrackedProperties(propsData);
            } catch (error) {
                console.error('Error fetching tracked properties:', error);
                setTrackedProperties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrackedProperties();
    }, [userData]);

    const hasTrackedProperties = trackedProperties.length > 0;

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
                    <button className="btn btn-primary flex items-center gap-2">
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
        <div className="zoning-container flex h-full w-full">
            {/* Future populated state */}
        </div>
    );
};

export default ZoningIntelligence;
