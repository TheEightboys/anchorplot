import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Building2, TrendingUp, Check, ChevronRight, ArrowUpRight, Link, PieChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function RealtorManagement() {
    const { userData } = useAuth();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReferrals = async () => {
            if (!userData?.uid) return;
            try {
                // Fetch projects where this user is the referring realtor
                const q = query(collection(db, 'projects'), where('realtorId', '==', userData.uid));
                const snapshot = await getDocs(q);

                // Map the project data to the referral view format
                const refsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Find the realtor's equity in the ledger if it exists
                    const realtorEquity = (data.equityLedger || []).find(e => e.party === 'Realtor' || e.realtorId === userData.uid);

                    return {
                        id: doc.id,
                        projectName: data.name || 'Unnamed Project',
                        ownerName: data.ownerName || 'Property Owner',
                        propertyCity: data.propertyCity || 'Unknown City',
                        status: data.status || 'active',
                        carriedEquity: realtorEquity ? realtorEquity.pct : (data.realtorCarriedEquity || 0),
                        vested: data.realtorVested || false,
                        vestingCondition: data.realtorVestingCondition || 'Project completion',
                        estimatedValue: data.realtorEstimatedValue || 0,
                        paidOut: data.realtorPaidOut || 0
                    };
                });
                setReferrals(refsData);
            } catch (error) {
                console.error('Error fetching referrals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReferrals();
    }, [userData]);

    const totalEstimated = referrals.reduce((sum, r) => sum + r.estimatedValue, 0);
    const totalPaid = referrals.reduce((sum, r) => sum + (r.paidOut || 0), 0);
    const activeReferrals = referrals.filter(r => r.status === 'active').length;

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 lg:p-8">
                <PageHeader title="Referrals & Equity" subtitle="Track your property referrals and carried equity positions (≤1%)." />

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        ['Total Referrals', String(referrals.length), Users, 'primary'],
                        ['Active', String(activeReferrals), Building2, 'success'],
                        ['Est. Total Value', `$${totalEstimated.toLocaleString()}`, TrendingUp, 'info'],
                        ['Paid Out', `$${totalPaid.toLocaleString()}`, DollarSign, 'warning'],
                    ].map(([label, value, Icon, color]) => (
                        <div key={label} className={`bg-${color}/5 border border-${color}/10 rounded-xl p-4`}>
                            <Icon size={18} className={`text-${color} mb-2`} />
                            <p className="text-xs text-text-tertiary font-bold uppercase">{label}</p>
                            <p className="text-xl font-bold text-text-primary">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Info banner */}
                <div className="bg-warning/5 border border-warning/10 rounded-xl p-4 mb-6 text-xs text-text-secondary">
                    <strong className="text-warning">Carried Equity:</strong> Realtors can earn up to 1% carried equity per project, subject to vesting conditions tied to project milestones. Equity is tracked in the project's immutable equity ledger.
                </div>

                {/* Referral Cards */}
                <div className="space-y-4">
                    {referrals.map(ref => (
                        <div key={ref.id} className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-text-primary">{ref.projectName}</h3>
                                    <p className="text-xs text-text-secondary">Referred by {ref.ownerName} · {ref.propertyCity}</p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${ref.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                                    }`}>{ref.status}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="bg-surface-element/50 rounded-lg p-3">
                                    <p className="text-[9px] font-bold text-text-tertiary uppercase">Carried Equity</p>
                                    <p className="text-lg font-bold text-text-primary">{ref.carriedEquity}%</p>
                                </div>
                                <div className="bg-surface-element/50 rounded-lg p-3">
                                    <p className="text-[9px] font-bold text-text-tertiary uppercase">Est. Value</p>
                                    <p className="text-sm font-bold text-text-primary">${ref.estimatedValue.toLocaleString()}</p>
                                </div>
                                <div className="bg-surface-element/50 rounded-lg p-3">
                                    <p className="text-[9px] font-bold text-text-tertiary uppercase">Vested</p>
                                    <p className={`text-sm font-bold ${ref.vested ? 'text-success' : 'text-warning'}`}>
                                        {ref.vested ? '✓ Yes' : '○ Pending'}
                                    </p>
                                </div>
                                <div className="bg-surface-element/50 rounded-lg p-3">
                                    <p className="text-[9px] font-bold text-text-tertiary uppercase">Condition</p>
                                    <p className="text-xs font-semibold text-text-primary">{ref.vestingCondition}</p>
                                </div>
                            </div>
                            {ref.paidOut > 0 && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-success font-bold">
                                    <Check size={12} /> Paid out: ${ref.paidOut.toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
