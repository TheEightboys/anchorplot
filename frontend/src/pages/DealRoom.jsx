import React, { useState, useEffect } from 'react';
import { Share, UserPlus, PenTool, FileText, CheckCircle2, Lock, Navigation, MoreHorizontal, Download, Folder, FolderOpen, AlertCircle, Loader2, Plus, ArrowRight, Building, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import PageHeader from '../components/PageHeader';

const DealRoom = () => {
    const { userData } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Determine which projects to fetch based on user role/involvement
                let q;
                if (userData?.role === 'owner') {
                    q = query(collection(db, 'projects'), where('ownerId', '==', userData.uid));
                } else if (userData?.role === 'developer') {
                    q = query(collection(db, 'projects'), where('developerId', '==', userData.uid));
                } else if (userData?.role === 'investor') {
                    q = query(collection(db, 'projects'), where('investors', 'array-contains', userData.uid));
                } else {
                    // Admin gets all or fallback
                    q = query(collection(db, 'projects'));
                }

                const querySnapshot = await getDocs(q);
                const projData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProjects(projData);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        if (userData) {
            fetchProjects();
        }
    }, [userData]);

    const hasActiveDeals = projects.length > 0;

    if (loading) {
        return (
            <div className="p-6 h-[calc(100vh-73px)] overflow-y-auto flex flex-col items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary opacity-50 mb-4" size={48} />
                <p className="text-text-secondary">Loading your secure Deal Room...</p>
            </div>
        );
    }

    if (!hasActiveDeals) {
        return (
            <div className="p-6 lg:p-8 h-[calc(100vh-73px)] overflow-y-auto bg-background">
                <PageHeader
                    title="JV Deal Room"
                    subtitle="Your secure, encrypted workspace for active project collaboration."
                    badge="Encrypted"
                />
                <div className="flex flex-col items-center justify-center mt-16">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-surface border border-border-medium rounded-full flex items-center justify-center mx-auto mb-6 text-primary/30">
                            <FolderOpen size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-text-primary mb-3">Deal Room is Empty</h2>
                        <p className="text-text-secondary mb-8 leading-relaxed">
                            Your Deal Room activates when an owner accepts your pitch. Browse opportunities or create an Owner listing to get started.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
                            <div className="bg-surface border border-border-light rounded-xl p-5">
                                <CheckCircle2 size={18} className="text-success mb-3" />
                                <h4 className="font-bold text-sm mb-1 text-text-primary">Browse Deals</h4>
                                <p className="text-xs text-text-secondary">Find anonymized properties and submit a structured pitch.</p>
                                <NavLink to="/app/marketplace" className="text-primary text-xs font-bold mt-3 flex items-center gap-1">
                                    Open Marketplace <ArrowRight size={12} />
                                </NavLink>
                            </div>
                            <div className="bg-surface border border-border-light rounded-xl p-5">
                                <Building size={18} className="text-info mb-3" />
                                <h4 className="font-bold text-sm mb-1 text-text-primary">List a Property</h4>
                                <p className="text-xs text-text-secondary">Owners can create anonymized listings and invite developers.</p>
                                <NavLink to="/app/marketplace" className="text-info text-xs font-bold mt-3 flex items-center gap-1">
                                    Create Listing <ArrowRight size={12} />
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const activeProject = selectedProject || projects[0];

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    const phaseLabel = { planning: 'Planning', permitting: 'Permitting', funding_close: 'Funding Close', construction: 'Construction', completion: 'Completion' };
    const milestoneColor = { completed: 'text-success', in_progress: 'text-info', upcoming: 'text-text-tertiary' };
    const milestoneBg = { completed: 'bg-success-bg', in_progress: 'bg-info-bg', upcoming: 'bg-surface-element' };

    return (
        <div className="h-[calc(100vh-73px)] overflow-y-auto bg-background p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="JV Deal Room"
                    subtitle="Encrypted project workspaces with milestone tracking, equity ledgers and internal messaging."
                    badge="Encrypted"
                    backTo="/app"
                    backLabel="Dashboard"
                />

                {/* Project Selector */}
                <div className="flex gap-3 mt-6 mb-8 overflow-x-auto pb-2">
                    {projects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedProject(p)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-left whitespace-nowrap transition-all ${activeProject?.id === p.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border-light bg-surface hover:bg-surface-hover'}`}
                        >
                            <Building size={16} className={activeProject?.id === p.id ? 'text-primary' : 'text-text-tertiary'} />
                            <div>
                                <p className="text-sm font-bold text-text-primary">{p.name}</p>
                                <p className="text-xs text-text-secondary">{p.propertyCity}, {p.propertyState} · {phaseLabel[p.phase] || p.phase}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {activeProject && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main Column */}
                        <div className="lg:col-span-2 flex flex-col gap-6">

                            {/* Milestone Tracker */}
                            <div className="bg-surface border border-border-light rounded-2xl p-6">
                                <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
                                    <FileText size={16} className="text-primary" /> Milestone Tracker
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {(activeProject.milestones || []).map((m, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${milestoneBg[m.status] || 'bg-surface-element'}`}>
                                                {m.status === 'completed' ? <CheckCircle2 size={14} className="text-success" /> :
                                                    m.status === 'in_progress' ? <Navigation size={14} className="text-info" /> :
                                                        <Lock size={14} className="text-text-tertiary" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-bold ${milestoneColor[m.status] || 'text-text-primary'}`}>{m.title}</p>
                                                <p className="text-xs text-text-secondary">{m.date}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${milestoneBg[m.status] || 'bg-surface-element'} ${milestoneColor[m.status] || 'text-text-secondary'}`}>
                                                {m.status === 'completed' ? 'Done' : m.status === 'in_progress' ? 'In Progress' : 'Upcoming'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Budget Tracker */}
                            <div className="bg-surface border border-border-light rounded-2xl p-6">
                                <h3 className="font-bold text-text-primary mb-4">Budget Progress</h3>
                                <div className="flex items-end justify-between mb-3">
                                    <span className="text-2xl font-extrabold text-text-primary">{formatCurrency(activeProject.deployedBudget || 0)}</span>
                                    <span className="text-sm text-text-secondary">of {formatCurrency(activeProject.totalBudget || 0)}</span>
                                </div>
                                <div className="h-3 bg-surface-element rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${activeProject.totalBudget ? ((activeProject.deployedBudget || 0) / activeProject.totalBudget * 100) : 0}%` }} />
                                </div>
                                <p className="text-xs text-text-secondary mt-2">{activeProject.totalBudget ? Math.round((activeProject.deployedBudget || 0) / activeProject.totalBudget * 100) : 0}% deployed</p>
                            </div>

                            {/* Messages (Placeholder UI) */}
                            <div className="bg-surface border border-border-light rounded-2xl p-6">
                                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <Lock size={14} className="text-warning" /> Internal Messaging
                                </h3>
                                <div className="bg-surface-element rounded-xl p-4 mb-4 space-y-3">
                                    <div className="flex gap-3">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">SC</div>
                                        <div>
                                            <p className="text-xs text-text-secondary">Sarah Chen · Attorney · 2h ago</p>
                                            <p className="text-sm text-text-primary">Permit filing documents are ready for review. Please check the attached term sheet revisions.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-7 h-7 rounded-full bg-info/10 flex items-center justify-center text-xs font-bold text-info">MR</div>
                                        <div>
                                            <p className="text-xs text-text-secondary">Marcus R. · Developer · 5h ago</p>
                                            <p className="text-sm text-text-primary">Phase 2 site plan uploaded. Ready for owner approval before we proceed to permits.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Type a message..." className="flex-1 border border-border-light rounded-xl px-4 py-2.5 text-sm bg-surface-element focus:outline-none focus:border-primary" />
                                    <button className="btn btn-primary px-5">Send</button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="flex flex-col gap-6">

                            {/* Equity Ledger */}
                            <div className="bg-surface border border-border-light rounded-2xl p-6">
                                <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-success" /> Equity Ledger
                                </h3>
                                {(activeProject.equityLedger || []).map((row, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                                                <span className="text-sm text-text-secondary">{row.party}</span>
                                            </div>
                                            <span className="text-sm font-bold font-mono text-text-primary">{row.pct}%</span>
                                        </div>
                                        <div className="h-1.5 bg-surface-element rounded-full">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${row.pct}%`, background: row.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Project Details */}
                            <div className="bg-surface border border-border-light rounded-2xl p-6">
                                <h3 className="font-bold text-text-primary mb-4">Project Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-text-secondary">Status</span><span className="font-bold text-text-primary capitalize">{activeProject.status}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Phase</span><span className="font-bold text-text-primary">{phaseLabel[activeProject.phase] || activeProject.phase}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Location</span><span className="font-bold text-text-primary">{activeProject.propertyCity}, {activeProject.propertyState}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Created</span><span className="font-bold text-text-primary">{activeProject.createdAt}</span></div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-surface border border-border-light rounded-2xl p-6">
                                <h3 className="font-bold text-text-primary mb-4">Actions</h3>
                                <div className="flex flex-col gap-2">
                                    <button className="btn btn-secondary w-full justify-start gap-2 text-sm"><Download size={14} /> Export Documents</button>
                                    <button className="btn btn-secondary w-full justify-start gap-2 text-sm"><PenTool size={14} /> E-Sign Agreement</button>
                                    <button className="btn btn-secondary w-full justify-start gap-2 text-sm"><UserPlus size={14} /> Invite Attorney</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DealRoom;
