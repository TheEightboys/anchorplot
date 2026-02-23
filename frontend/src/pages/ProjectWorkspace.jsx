import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, Milestone, PieChart, MessageSquare, Shield,
    Check, Clock, AlertCircle, DollarSign, Users, Building2, Briefcase,
    ChevronRight, Plus, Send, Download, Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProject, updateProject, addMilestone, sendMessage, subscribeToMessages, updateEquityLedger } from '../services/firestoreService';

const TABS = [
    { key: 'overview', label: 'Overview', icon: Building2 },
    { key: 'milestones', label: 'Milestones', icon: Milestone },
    { key: 'equity', label: 'Equity Ledger', icon: PieChart },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'messages', label: 'Messages', icon: MessageSquare },
    { key: 'compliance', label: 'Compliance', icon: Shield },
];

const MILESTONE_PHASES = [
    { key: 'planning', label: 'Planning', color: '#3b82f6' },
    { key: 'permitting', label: 'Permitting', color: '#f59e0b' },
    { key: 'funding_close', label: 'Funding Close', color: '#8b5cf6' },
    { key: 'construction', label: 'Construction', color: '#22c55e' },
    { key: 'completion', label: 'Completion', color: '#06b6d4' },
];

export default function ProjectWorkspace() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [project, setProject] = useState(null);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const p = await getProject(projectId);
                setProject(p || {
                    id: projectId, name: 'Project', status: 'active', phase: 'planning',
                    milestones: [], equityLedger: [], totalBudget: 0, deployedBudget: 0,
                });
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        load();
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        const unsub = subscribeToMessages(projectId, (msgs) => setMessages(msgs));
        return unsub;
    }, [projectId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        await sendMessage({
            projectId,
            senderId: userData?.uid,
            senderName: userData?.name || 'User',
            text: newMessage,
        });
        setNewMessage('');
    };

    const formatCurrency = (n) => n ? `$${Number(n).toLocaleString()}` : '$0';

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const equityData = project?.equityLedger || [
        { party: 'Owner', pct: 40, color: '#22c55e', vested: true },
        { party: 'Developer', pct: 45, color: '#3b82f6', vested: true },
        { party: 'Investor Pool', pct: 14, color: '#8b5cf6', vested: false },
        { party: 'Realtor', pct: 1, color: '#f59e0b', vested: false },
    ];

    const milestones = project?.milestones || MILESTONE_PHASES.map((p, i) => ({
        ...p, status: i === 0 ? 'in-progress' : 'pending',
        budget: 0, spent: 0, due: '', notes: ''
    }));

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 lg:p-8">

                {/* Back */}
                <button onClick={() => navigate('/app/deal-room')}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-medium mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Deal Room
                </button>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-text-primary">{project?.name || 'Project Workspace'}</h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${project?.status === 'active' ? 'bg-success/10 text-success' :
                                    project?.status === 'completed' ? 'bg-info/10 text-info' :
                                        'bg-warning/10 text-warning'
                                }`}>{project?.status || 'active'}</span>
                            <span className="text-text-tertiary text-xs">Phase: <strong className="text-text-secondary capitalize">{project?.phase || 'planning'}</strong></span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-text-tertiary uppercase">Total Budget</p>
                        <p className="text-xl font-bold text-text-primary">{formatCurrency(project?.totalBudget)}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border-light mb-6 overflow-x-auto">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                                    }`}>
                                <Icon size={15} /> {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-surface border border-border-light rounded-2xl p-6 shadow-sm">

                    {/* Overview */}
                    {tab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    ['Total Budget', formatCurrency(project?.totalBudget), DollarSign, 'primary'],
                                    ['Deployed', formatCurrency(project?.deployedBudget), Check, 'success'],
                                    ['Milestones', `${milestones.filter(m => m.status === 'completed').length}/${milestones.length}`, Milestone, 'info'],
                                    ['Team', String((project?.investors?.length || 0) + 2), Users, 'warning'],
                                ].map(([label, value, Icon, color]) => (
                                    <div key={label} className={`bg-${color}/5 border border-${color}/10 rounded-xl p-4`}>
                                        <Icon size={18} className={`text-${color} mb-2`} />
                                        <p className="text-xs text-text-tertiary font-bold uppercase">{label}</p>
                                        <p className="text-xl font-bold text-text-primary">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Quick milestone view */}
                            <div>
                                <h3 className="text-sm font-bold text-text-primary mb-3">Phase Progress</h3>
                                <div className="flex items-center gap-2">
                                    {MILESTONE_PHASES.map((phase, i) => {
                                        const ms = milestones[i] || {};
                                        return (
                                            <React.Fragment key={phase.key}>
                                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${ms.status === 'completed' ? 'bg-success/10 text-success' :
                                                        ms.status === 'in-progress' ? 'bg-primary/10 text-primary ring-1 ring-primary/20' :
                                                            'bg-surface-element text-text-tertiary'
                                                    }`}>
                                                    {ms.status === 'completed' ? <Check size={12} /> : ms.status === 'in-progress' ? <Clock size={12} /> : null}
                                                    {phase.label}
                                                </div>
                                                {i < MILESTONE_PHASES.length - 1 && <ChevronRight size={14} className="text-text-tertiary" />}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Milestones */}
                    {tab === 'milestones' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-text-primary">Project Milestones</h3>
                            </div>
                            {milestones.map((ms, i) => (
                                <div key={i} className={`border rounded-xl p-4 transition-all ${ms.status === 'completed' ? 'border-success/20 bg-success/3' :
                                        ms.status === 'in-progress' ? 'border-primary/20 bg-primary/3' :
                                            'border-border-light'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ms.status === 'completed' ? 'bg-success text-white' :
                                                    ms.status === 'in-progress' ? 'bg-primary text-white' :
                                                        'bg-surface-element text-text-tertiary'
                                                }`}>
                                                {ms.status === 'completed' ? <Check size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-primary">{ms.label}</p>
                                                <p className="text-xs text-text-secondary capitalize">{ms.status}</p>
                                            </div>
                                        </div>
                                        {ms.budget > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-text-tertiary">Budget</p>
                                                <p className="text-sm font-bold text-text-primary">{formatCurrency(ms.budget)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Equity Ledger */}
                    {tab === 'equity' && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-text-primary">Equity Distribution</h3>
                            <div className="flex items-center gap-2 h-8 rounded-full overflow-hidden">
                                {equityData.map(e => (
                                    <div key={e.party} style={{ width: `${e.pct}%`, backgroundColor: e.color }}
                                        className="h-full flex items-center justify-center text-white text-[10px] font-bold min-w-[30px]">
                                        {e.pct}%
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {equityData.map(e => (
                                    <div key={e.party} className="bg-surface-element rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                                            <p className="text-xs font-bold text-text-secondary">{e.party}</p>
                                        </div>
                                        <p className="text-2xl font-bold text-text-primary">{e.pct}%</p>
                                        <p className={`text-[10px] font-bold mt-1 ${e.vested ? 'text-success' : 'text-warning'}`}>
                                            {e.vested ? '✓ Fully Vested' : '○ Vesting'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-info/5 border border-info/10 rounded-xl p-4 text-xs text-text-secondary">
                                <strong>Realtor equity</strong> is capped at 1% carried equity with vesting conditions tied to project completion. Distribution records and payment logs are stored with traceable transaction IDs.
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    {tab === 'documents' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-text-primary">Project Documents</h3>
                                <button className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"><Upload size={13} /> Upload</button>
                            </div>
                            {['JV Term Sheet', 'JV Agreement', 'Title Report', 'Zoning Verification'].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border border-border-light rounded-xl hover:bg-surface-hover transition-all">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-primary" />
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">{doc}</p>
                                            <p className="text-[10px] text-text-tertiary">v1.0 · Uploaded Feb 2026</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">Signed</span>
                                        <button className="p-1.5 rounded-lg hover:bg-surface-element"><Download size={14} className="text-text-secondary" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Messages */}
                    {tab === 'messages' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-text-primary">Project Messages</h3>
                            <div className="bg-warning/5 border border-warning/10 rounded-xl p-3 text-[11px] text-warning font-medium">
                                ⚠ All communication must occur within AnchorPlot. Sharing external contact information is prohibited.
                            </div>
                            <div className="h-64 overflow-y-auto border border-border-light rounded-xl p-4 space-y-3 bg-surface-element/30">
                                {messages.length === 0 && (
                                    <p className="text-center text-text-tertiary text-sm py-8">No messages yet. Start the conversation.</p>
                                )}
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.senderId === userData?.uid ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-xl p-3 ${msg.senderId === userData?.uid ? 'bg-primary text-white' : 'bg-surface border border-border-light'
                                            }`}>
                                            <p className={`text-[10px] font-bold mb-1 ${msg.senderId === userData?.uid ? 'text-white/70' : 'text-text-tertiary'}`}>{msg.senderName}</p>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-surface border border-border-light rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                <button onClick={handleSendMessage}
                                    className="btn btn-primary px-4 py-2.5 flex items-center gap-1.5 text-sm"><Send size={14} /> Send</button>
                            </div>
                        </div>
                    )}

                    {/* Compliance */}
                    {tab === 'compliance' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-text-primary">Compliance Checkpoints</h3>
                            {[
                                { label: 'Owner Consent', status: 'complete', date: '2026-02-10' },
                                { label: 'Attorney Selection', status: 'complete', date: '2026-02-12' },
                                { label: 'Disclosure Acknowledgment', status: 'complete', date: '2026-02-12' },
                                { label: 'Platform Fee Accepted', status: 'complete', date: '2026-02-14' },
                                { label: 'KYC Verification (Investor)', status: 'pending', date: '' },
                                { label: 'E-Signature on JV Agreement', status: 'pending', date: '' },
                            ].map((cp, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${cp.status === 'complete' ? 'border-success/15 bg-success/3' : 'border-border-light'
                                    }`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${cp.status === 'complete' ? 'bg-success text-white' : 'bg-surface-element text-text-tertiary'
                                        }`}>
                                        {cp.status === 'complete' ? <Check size={13} /> : <Clock size={13} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-text-primary">{cp.label}</p>
                                        {cp.date && <p className="text-[10px] text-text-tertiary">{cp.date}</p>}
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cp.status === 'complete' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                        }`}>{cp.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
