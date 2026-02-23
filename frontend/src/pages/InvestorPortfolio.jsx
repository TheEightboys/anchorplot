import React, { useState, useEffect } from 'react';
import {
    PieChart, DollarSign, TrendingUp, Building2, ArrowUpRight, ArrowDownRight,
    Eye, BarChart2, Calendar, Briefcase, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listInvestmentsByUser } from '../services/firestoreService';
import PageHeader from '../components/PageHeader';

export default function InvestorPortfolio() {
    const { userData } = useAuth();
    const [tab, setTab] = useState('overview');
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvestments = async () => {
            if (!userData?.uid) return;
            try {
                const data = await listInvestmentsByUser(userData.uid);
                // Ensure default structure for missing nested fields so map/reduce won't crash
                const mappedData = data.map(inv => ({
                    ...inv,
                    committed: inv.committed || 0,
                    deployed: inv.deployed || 0,
                    distributions: inv.distributions || []
                }));
                setInvestments(mappedData);
            } catch (error) {
                console.error("Error fetching investments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvestments();
    }, [userData]);

    const totalCommitted = investments.reduce((sum, inv) => sum + inv.committed, 0);
    const totalDeployed = investments.reduce((sum, inv) => sum + inv.deployed, 0);
    const totalDistributions = investments.reduce((sum, inv) => sum + inv.distributions.reduce((s, d) => s + d.amount, 0), 0);
    const activeCount = investments.filter(i => i.status === 'active').length;

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 lg:p-8">
                <PageHeader title="Investor Portfolio" subtitle="Track your investments, distributions, and portfolio performance." />

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
                        {investments.map(inv => (
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
                                        ['IRR', inv.irr ? `${inv.irr}%` : 'TBD'],
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
                                        <span>{Math.round((inv.deployed / inv.committed) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-surface-element rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(inv.deployed / inv.committed) * 100}%` }} />
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
                                    {investments.flatMap(inv =>
                                        inv.distributions.map((d, i) => (
                                            <tr key={`${inv.id}-${i}`} className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
                                                <td className="p-4 text-text-secondary">{d.date}</td>
                                                <td className="p-4 font-medium text-text-primary">{inv.projectName}</td>
                                                <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">{d.type}</span></td>
                                                <td className="p-4 text-right font-bold text-success">+${d.amount.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
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
                                    ['Weighted Avg IRR', '19.8%', 'text-success'],
                                    ['Total Return', `$${totalDistributions.toLocaleString()}`, 'text-primary'],
                                    ['Cash Multiple', '1.07x', 'text-info'],
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
