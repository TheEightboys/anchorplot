import React, { useState, useEffect } from 'react';
import {
    PieChart, DollarSign, TrendingUp, Building2, ArrowUpRight, ArrowDownRight,
    Eye, BarChart2, Calendar, Briefcase, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listInvestmentsByUser } from '../services/firestoreService';
import PageHeader from '../components/PageHeader';

const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export default function InvestorPortfolio() {
    const { userData } = useAuth();
    const [tab, setTab] = useState('overview');
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvestments = async () => {
            if (!userData?.uid) {
                setInvestments([]);
                setLoading(false);
                return;
            }

            try {
                const data = await listInvestmentsByUser(userData.uid);
                const mappedData = data.map(inv => ({
                    ...inv,
                    projectName: inv.projectName || inv.name || 'Unnamed Project',
                    city: inv.city || inv.propertyCity || 'Unknown City',
                    phase: inv.phase || inv.status || 'active',
                    committed: toSafeNumber(inv.committed ?? inv.amount),
                    deployed: toSafeNumber(inv.deployed ?? inv.amount),
                    currentValue: toSafeNumber(inv.currentValue ?? inv.deployed ?? inv.amount),
                    equity: toSafeNumber(inv.equity ?? inv.equityPct),
                    irr: toSafeNumber(inv.irr ?? inv.expectedReturn),
                    distributions: Array.isArray(inv.distributions)
                        ? inv.distributions.map(distribution => ({
                            ...distribution,
                            amount: toSafeNumber(distribution.amount),
                            date: distribution.date || distribution.createdAt || distribution.paidAt || '—',
                            type: distribution.type || 'Distribution',
                        }))
                        : []
                }));
                setInvestments(mappedData);
            } catch (error) {
                console.error("Error fetching investments:", error);
                setInvestments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInvestments();
    }, [userData]);

    const totalCommitted = investments.reduce((sum, inv) => sum + inv.committed, 0);
    const totalDeployed = investments.reduce((sum, inv) => sum + inv.deployed, 0);
    const totalDistributions = investments.reduce((sum, inv) => sum + inv.distributions.reduce((s, d) => s + d.amount, 0), 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const activeCount = investments.filter(i => i.status === 'active').length;
    const weightedAvgIrr = totalCommitted > 0
        ? investments.reduce((sum, inv) => sum + (inv.irr * inv.committed), 0) / totalCommitted
        : 0;
    const cashMultiple = totalCommitted > 0 ? (totalCurrentValue / totalCommitted) : 0;
    const totalReturn = totalCurrentValue - totalCommitted;
    const flattenedDistributions = investments
        .flatMap(inv => inv.distributions.map((distribution, index) => ({
            id: `${inv.id}-${index}`,
            date: distribution.date,
            projectName: inv.projectName,
            type: distribution.type,
            amount: distribution.amount,
        })))
        .sort((a, b) => {
            const aDate = new Date(a.date).getTime();
            const bDate = new Date(b.date).getTime();
            return (Number.isFinite(bDate) ? bDate : 0) - (Number.isFinite(aDate) ? aDate : 0);
        });

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 lg:p-8">
                <PageHeader title="Investor Portfolio" subtitle="Track your investments, distributions and portfolio performance." />

                {loading && (
                    <div className="mb-6 p-4 rounded-xl border border-border-light bg-surface text-sm text-text-secondary">
                        Loading live portfolio data...
                    </div>
                )}

                {/* Portfolio Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        ['Total Committed', `$${totalCommitted.toLocaleString()}`, DollarSign, 'primary'],
                        ['Total Deployed', `$${totalDeployed.toLocaleString()}`, TrendingUp, 'success'],
                        ['Total Distributions', `$${totalDistributions.toLocaleString()}`, ArrowUpRight, 'info'],
                        ['Active Projects', String(activeCount), Briefcase, 'warning'],
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
                    {[['overview', 'All Investments'], ['distributions', 'Distributions'], ['performance', 'Performance']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${tab === key ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {tab === 'overview' && (
                    <div className="space-y-4">
                        {investments.length === 0 ? (
                            <div className="bg-surface border border-border-light rounded-2xl p-8 text-center text-text-secondary">
                                No investments found yet.
                            </div>
                        ) : investments.map(inv => (
                            <div key={inv.id} className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-text-primary">{inv.projectName}</h3>
                                        <p className="text-xs text-text-secondary">{inv.city}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${inv.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                                        }`}>{inv.phase}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        ['Committed', `$${inv.committed.toLocaleString()}`],
                                        ['Deployed', `$${inv.deployed.toLocaleString()}`],
                                        ['Equity', `${inv.equity}%`],
                                        ['IRR', inv.irr > 0 ? `${inv.irr.toFixed(1)}%` : 'TBD'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="bg-surface-element/50 rounded-lg p-2.5">
                                            <p className="text-[9px] font-bold text-text-tertiary uppercase">{k}</p>
                                            <p className="text-sm font-bold text-text-primary mt-0.5">{v}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Deploy progress */}
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-[10px] text-text-tertiary mb-1">
                                        <span>Deployment Progress</span>
                                        <span>{inv.committed > 0 ? Math.round((inv.deployed / inv.committed) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-1.5 bg-surface-element rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${inv.committed > 0 ? Math.min(100, (inv.deployed / inv.committed) * 100) : 0}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Distributions Tab */}
                {tab === 'distributions' && (
                    <div className="space-y-3">
                        <div className="bg-surface border border-border-light rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light bg-surface-element/50">
                                        <th className="text-left p-4 text-xs font-bold text-text-tertiary uppercase">Date</th>
                                        <th className="text-left p-4 text-xs font-bold text-text-tertiary uppercase">Project</th>
                                        <th className="text-left p-4 text-xs font-bold text-text-tertiary uppercase">Type</th>
                                        <th className="text-right p-4 text-xs font-bold text-text-tertiary uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flattenedDistributions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-text-secondary">No distributions recorded yet.</td>
                                        </tr>
                                    ) : flattenedDistributions.map((distribution) => (
                                        <tr key={distribution.id} className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
                                            <td className="p-4 text-text-secondary">{distribution.date}</td>
                                            <td className="p-4 font-medium text-text-primary">{distribution.projectName}</td>
                                            <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">{distribution.type}</span></td>
                                            <td className="p-4 text-right font-bold text-success">+${distribution.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Performance Tab */}
                {tab === 'performance' && (
                    <div className="space-y-6">
                        <div className="bg-surface border border-border-light rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-text-primary mb-4">Portfolio Performance Summary</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    ['Weighted Avg IRR', totalCommitted > 0 ? `${weightedAvgIrr.toFixed(1)}%` : '—', 'text-success'],
                                    ['Total Return', `${totalReturn >= 0 ? '+' : '-'}$${Math.abs(totalReturn).toLocaleString()}`, totalReturn >= 0 ? 'text-primary' : 'text-danger'],
                                    ['Cash Multiple', totalCommitted > 0 ? `${cashMultiple.toFixed(2)}x` : '—', 'text-info'],
                                ].map(([label, value, color]) => (
                                    <div key={label} className="bg-surface-element rounded-xl p-4 text-center">
                                        <p className="text-xs text-text-tertiary font-bold uppercase mb-1">{label}</p>
                                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-info/5 border border-info/10 rounded-xl p-4 text-xs text-text-secondary">
                            Performance metrics are calculated based on deployed capital and distributions to date. IRR is projected based on current project timelines and may change.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
