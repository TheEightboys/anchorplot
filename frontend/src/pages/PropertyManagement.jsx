import React, { useState, useEffect } from 'react';
import {
    Home, DollarSign, Users, Wrench, FileText, Check, Clock, AlertCircle,
    Building2, TrendingUp, Plus, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function PropertyManagement() {
    const { userData } = useAuth();
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');

    useEffect(() => {
        const fetchProperties = async () => {
            if (!userData?.uid) return;
            try {
                // Fetch properties owned or managed by this user
                let q;
                if (userData.role === 'owner') {
                    q = query(collection(db, 'properties'), where('ownerUid', '==', userData.uid));
                } else if (userData.role === 'property_manager') {
                    q = query(collection(db, 'properties'), where('managerId', '==', userData.uid));
                } else {
                    // Admin or other role fallback
                    q = query(collection(db, 'properties'), where('status', '==', 'approved'));
                }

                const snapshot = await getDocs(q);
                const propsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Provide safe defaults for missing arrays/numbers to avoid crashes
                    return {
                        id: doc.id,
                        name: data.name || 'Unnamed Property',
                        address: data.address || 'Address unlisted',
                        units: data.units || 0,
                        occupied: data.occupied || 0,
                        vacancyRate: data.units ? (((data.units - (data.occupied || 0)) / data.units) * 100).toFixed(1) : 0,
                        monthlyRevenue: data.monthlyRevenue || 0,
                        status: data.status || 'unknown',
                        manager: data.managerName || 'Owner Managed',
                        affordable: data.affordable || false,
                        affordableUnits: data.affordableUnits || 0,
                        maintenance: data.maintenance || [],
                        rentRoll: data.rentRoll || []
                    };
                });

                setProperties(propsData);
                if (propsData.length > 0) {
                    setSelectedProperty(propsData[0]);
                }
            } catch (error) {
                console.error('Error fetching managed properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [userData]);

    const prop = selectedProperty;

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center text-text-secondary">
                Loading property dashboard...
            </div>
        );
    }

    if (!prop) {
        return (
            <div className="h-full overflow-y-auto p-6 lg:p-8">
                <PageHeader title="Property Management" subtitle="Manage stabilized properties, rent rolls, maintenance, and compliance reporting." />
                <div className="bg-surface border border-border-light rounded-2xl p-12 text-center text-text-secondary mt-12 shadow-sm">
                    <Building2 size={48} className="mx-auto mb-4 text-text-tertiary" />
                    <h3 className="text-xl font-bold text-text-primary mb-2">No Properties Found</h3>
                    <p>You don't have any properties currently assigned for management.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 lg:p-8">
                <PageHeader title="Property Management" subtitle="Manage stabilized properties, rent rolls, maintenance, and compliance reporting." />

                {/* Property Selector */}
                <div className="flex gap-3 mb-6 overflow-x-auto">
                    {properties.map(p => (
                        <button key={p.id} onClick={() => setSelectedProperty(p)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border whitespace-nowrap transition-all ${selectedProperty?.id === p.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border-light bg-surface hover:bg-surface-hover'
                                }`}>
                            <Building2 size={18} className={selectedProperty?.id === p.id ? 'text-primary' : 'text-text-tertiary'} />
                            <div className="text-left">
                                <p className={`text-sm font-bold ${selectedProperty?.id === p.id ? 'text-primary' : 'text-text-primary'}`}>{p.name}</p>
                                <p className="text-[10px] text-text-tertiary">{p.units} units</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        ['Units', `${prop.occupied}/${prop.units}`, Users, 'primary'],
                        ['Vacancy', `${prop.vacancyRate}%`, Home, prop.vacancyRate > 10 ? 'danger' : 'success'],
                        ['Revenue', `$${prop.monthlyRevenue.toLocaleString()}/mo`, DollarSign, 'info'],
                        ['Maintenance', String(prop.maintenance.length), Wrench, 'warning'],
                    ].map(([label, value, Icon, color]) => (
                        <div key={label} className={`bg-${color}/5 border border-${color}/10 rounded-xl p-4`}>
                            <Icon size={18} className={`text-${color} mb-2`} />
                            <p className="text-xs text-text-tertiary font-bold uppercase">{label}</p>
                            <p className="text-xl font-bold text-text-primary">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border-light mb-6">
                    {[['overview', 'Overview'], ['rentroll', 'Rent Roll'], ['maintenance', 'Maintenance'], ['compliance', 'Compliance']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${tab === key ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}>
                            {label}
                        </button>
                    ))}
                </div>

                <div className="bg-surface border border-border-light rounded-2xl p-6 shadow-sm">

                    {/* Overview Tab */}
                    {tab === 'overview' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ['Property', prop.name],
                                    ['Address', prop.address],
                                    ['Manager', prop.manager],
                                    ['Status', prop.status],
                                ].map(([k, v]) => (
                                    <div key={k} className="bg-surface-element/50 rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-text-tertiary uppercase">{k}</p>
                                        <p className="text-sm font-semibold text-text-primary mt-0.5 capitalize">{v}</p>
                                    </div>
                                ))}
                            </div>
                            {prop.affordable && (
                                <div className="bg-success/5 border border-success/10 rounded-xl p-4">
                                    <p className="text-xs font-bold text-success mb-1">♥ Affordable Housing Units</p>
                                    <p className="text-xs text-text-secondary">{prop.affordableUnits} of {prop.units} units are designated affordable. Compliance reporting is active.</p>
                                </div>
                            )}
                            {/* Occupancy bar */}
                            <div>
                                <div className="flex justify-between text-xs text-text-tertiary mb-1">
                                    <span>Occupancy Rate</span>
                                    <span>{Math.round((prop.occupied / prop.units) * 100)}%</span>
                                </div>
                                <div className="h-2.5 bg-surface-element rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-success rounded-full" style={{ width: `${(prop.occupied / prop.units) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rent Roll Tab */}
                    {tab === 'rentroll' && (
                        <div>
                            <h3 className="text-sm font-bold text-text-primary mb-4">Unit Rent Roll</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light">
                                            <th className="text-left p-3 text-xs font-bold text-text-tertiary uppercase">Unit</th>
                                            <th className="text-left p-3 text-xs font-bold text-text-tertiary uppercase">Tenant</th>
                                            <th className="text-left p-3 text-xs font-bold text-text-tertiary uppercase">Type</th>
                                            <th className="text-right p-3 text-xs font-bold text-text-tertiary uppercase">Rent</th>
                                            <th className="text-right p-3 text-xs font-bold text-text-tertiary uppercase">Lease End</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prop.rentRoll.map((row, i) => (
                                            <tr key={i} className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
                                                <td className="p-3 font-bold text-text-primary">{row.unit}</td>
                                                <td className="p-3 text-text-secondary">{row.tenant}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.type === 'affordable' ? 'bg-success/10 text-success' : 'bg-surface-element text-text-tertiary'
                                                        }`}>{row.type}</span>
                                                </td>
                                                <td className="p-3 text-right font-semibold text-text-primary">{row.rent ? `$${row.rent.toLocaleString()}` : '—'}</td>
                                                <td className="p-3 text-right text-text-secondary">{row.lease}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {tab === 'maintenance' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-text-primary">Maintenance Log</h3>
                                <button className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"><Plus size={13} /> New Request</button>
                            </div>
                            {prop.maintenance.map(m => (
                                <div key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border ${m.priority === 'high' ? 'border-danger/15 bg-danger/3' : 'border-border-light'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                                        m.status === 'completed' ? 'bg-success/10 text-success' :
                                            'bg-surface-element text-text-tertiary'
                                        }`}>
                                        {m.status === 'completed' ? <Check size={14} /> : <Wrench size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-text-primary">{m.title}</p>
                                        <p className="text-[10px] text-text-tertiary">{m.date} · Priority: {m.priority}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${m.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                                        m.status === 'completed' ? 'bg-success/10 text-success' :
                                            'bg-info/10 text-info'
                                        }`}>{m.status.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Compliance Tab */}
                    {tab === 'compliance' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-text-primary">Affordable Housing Compliance</h3>
                            {prop.affordable ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            ['Affordable Units', String(prop.affordableUnits)],
                                            ['Total Units', String(prop.units)],
                                            ['Affordability %', `${Math.round((prop.affordableUnits / prop.units) * 100)}%`],
                                            ['Status', 'Compliant'],
                                        ].map(([k, v]) => (
                                            <div key={k} className="bg-surface-element rounded-lg p-3">
                                                <p className="text-[9px] font-bold text-text-tertiary uppercase">{k}</p>
                                                <p className="text-sm font-bold text-text-primary mt-0.5">{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        {[
                                            { label: 'Annual Income Verification', due: '2026-12-01', status: 'upcoming' },
                                            { label: 'Rent Reasonableness Review', due: '2026-09-01', status: 'upcoming' },
                                            { label: 'City Compliance Report', due: '2026-06-30', status: 'upcoming' },
                                        ].map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-light">
                                                <div className="flex items-center gap-2">
                                                    <Shield size={14} className="text-primary" />
                                                    <span className="text-xs font-medium text-text-primary">{r.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-text-tertiary">Due: {r.due}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-info/10 text-info text-[10px] font-bold">{r.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-tertiary">
                                    <Shield size={32} className="mx-auto mb-2" />
                                    <p className="text-sm">No affordable housing compliance requirements for this property.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
